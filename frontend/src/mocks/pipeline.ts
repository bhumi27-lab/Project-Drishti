// The mock pipeline, one function per stage. The seed runs them back-to-back to build
// history; the live emitter runs the same steps on timers.
import { confidenceOf, routeOf } from '@/lib/confidence'
import type { Action, Alert, AuditEntry, Decision, Incident, IncidentDetail, Log, ScenarioId, Settings } from '@/types'
import type { LogDraft } from './format'
import type { ScenarioRun } from './scenarios'

export interface MockDb {
  logs: Log[] // newest first
  alerts: Alert[]
  incidents: IncidentDetail[]
  scenarioOf: Map<string, ScenarioId>
  settings: Settings
  seq: Record<string, number>
}

export type Resolution = 'approved' | 'rejected' | 'escalated'

const ID_BASE: Record<string, number> = { LOG: 50000, ALR: 2200, INC: 1040, ACT: 700, APR: 300, AUD: 9000, CTX: 400 }
const iso = (ms: number) => new Date(ms).toISOString()
const round2 = (n: number) => Math.round(n * 100) / 100

export function nextId(db: MockDb, prefix: keyof typeof ID_BASE): string {
  db.seq[prefix] = (db.seq[prefix] ?? ID_BASE[prefix]) + 1
  return `${prefix}-${db.seq[prefix]}`
}

function audit(db: MockDb, inc: IncidentDetail, at: number, actor: AuditEntry['actor'], event: string, details: Record<string, unknown> = {}) {
  inc.audit.push({ id: nextId(db, 'AUD'), incident_id: inc.id, actor, event, details, created_at: iso(at) })
}

/** The list shape of an incident (no evidence trail). */
export function toSummary(d: IncidentDetail): Incident {
  const { id, alert_id, src_ip, summary, severity, stage, technique_id, technique_name, confidence, decision, status, proposed_action, created_at, closed_at } = d
  return { id, alert_id, src_ip, summary, severity, stage, technique_id, technique_name, confidence, decision, status, proposed_action, created_at, closed_at }
}

/** Give drafts ids and file them, keeping db.logs newest first. */
export function storeLogs(db: MockDb, drafts: LogDraft[], alertId: string | null = null, sort = true): Log[] {
  const logs = drafts.map((d) => ({ ...d, id: nextId(db, 'LOG'), alert_id: alertId }))
  db.logs.push(...logs)
  if (sort) db.logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return logs
}

/** Watcher: the logs cross a rule, an alert and an open incident appear. */
export function raiseAlert(db: MockDb, scenario: ScenarioId, run: ScenarioRun, logs: Log[], t: number, sort = true): IncidentDetail {
  const alertId = nextId(db, 'ALR')
  const incId = nextId(db, 'INC')
  for (const l of logs) l.alert_id = alertId
  const related = storeLogs(db, run.related, null, sort)

  const alert: Alert = {
    id: alertId,
    created_at: iso(t),
    log_ids: logs.map((l) => l.id),
    anomaly_score: round2(run.factors.anomaly),
    rule_hits: run.rule_hits,
    severity: run.severity,
    status: 'new',
    src_ip: run.src_ip,
    source: logs[0].source,
    incident_id: incId,
  }
  const inc: IncidentDetail = {
    id: incId,
    alert_id: alertId,
    src_ip: run.src_ip,
    summary: run.summary,
    severity: run.severity,
    stage: 'watcher',
    technique_id: null,
    technique_name: null,
    confidence: null,
    decision: null,
    status: 'open',
    proposed_action: run.proposed,
    created_at: iso(t),
    closed_at: null,
    alert,
    verdict: null,
    mitre_matches: [],
    confidence_breakdown: null,
    context_requests: [],
    related_events: related,
    actions: [],
    approvals: [],
    audit: [],
  }
  audit(db, inc, t, 'watcher', 'alert_raised', { rule_hits: run.rule_hits, anomaly_score: alert.anomaly_score })
  db.alerts.push(alert)
  db.incidents.push(inc)
  db.scenarioOf.set(incId, scenario)
  return inc
}

/** Detective: pull the top MITRE techniques. */
export function retrieve(db: MockDb, inc: IncidentDetail, run: ScenarioRun, t: number) {
  inc.stage = 'detective'
  inc.alert.status = 'investigating'
  inc.mitre_matches = run.matches
  audit(db, inc, t, 'detective', 'mitre_retrieved', { top: run.matches[0].id, similarity: run.matches[0].similarity })
}

/** Detective → Watcher: "not enough context". */
export function askContext(db: MockDb, inc: IncidentDetail, c: ScenarioRun['context'][number], t: number) {
  inc.stage = 'watcher'
  audit(db, inc, t, 'detective', 'context_requested', { query: c.query })
}

/** Watcher → Detective: history from PostgreSQL. */
export function answerContext(db: MockDb, inc: IncidentDetail, c: ScenarioRun['context'][number], t: number) {
  inc.stage = 'detective'
  inc.context_requests.push({ id: nextId(db, 'CTX'), incident_id: inc.id, requested_by: 'detective', query: c.query, result_summary: c.result, created_at: iso(t) })
  audit(db, inc, t, 'watcher', 'context_returned', { summary: c.result })
}

/** Detective: the LLM verdict. */
export function conclude(db: MockDb, inc: IncidentDetail, run: ScenarioRun, t: number) {
  inc.verdict = { ...run.verdict, llm_confidence: round2(run.factors.llm), needs_more_context: false, context_query: null }
  inc.technique_id = run.verdict.technique_id
  inc.technique_name = run.verdict.technique_name
  audit(db, inc, t, 'detective', 'verdict', { technique: inc.technique_id, malicious: run.verdict.is_malicious, llm_confidence: inc.verdict.llm_confidence })
}

/** Confidence Gate: weigh the evidence against the current threshold. */
export function score(db: MockDb, inc: IncidentDetail, run: ScenarioRun, t: number): Decision {
  inc.stage = 'gate'
  inc.confidence_breakdown = run.factors
  inc.confidence = round2(confidenceOf(run.factors))
  inc.decision = routeOf(inc.confidence, run.verdict.is_malicious, db.settings.confidence_threshold)
  audit(db, inc, t, 'gate', 'decision', { confidence: inc.confidence, decision: inc.decision })
  return inc.decision
}

/** Send the incident where the gate decided: Bouncer, an analyst, or nowhere. */
export function route(db: MockDb, inc: IncidentDetail, t: number) {
  if (inc.decision === 'auto') {
    inc.stage = 'bouncer'
  } else if (inc.decision === 'dismiss') {
    inc.status = 'dismissed'
    inc.stage = 'closed'
    inc.alert.status = 'closed'
    inc.closed_at = iso(t)
  } else {
    inc.stage = 'human'
    audit(db, inc, t, 'system', 'approval_requested', { proposed: inc.proposed_action })
  }
}

function execute(db: MockDb, inc: IncidentDetail, at: number, by: Action['executed_by']) {
  if (!inc.proposed_action) return
  inc.actions.push({ id: nextId(db, 'ACT'), incident_id: inc.id, ...inc.proposed_action, mode: db.settings.mitigation_mode, executed_by: by, success: true, created_at: iso(at) })
  audit(db, inc, at, 'bouncer', 'action_executed', { ...inc.proposed_action, mode: db.settings.mitigation_mode })
}

/** Bouncer: execute (simulated unless the mode says otherwise) and close. */
export function act(db: MockDb, inc: IncidentDetail, t: number) {
  execute(db, inc, t, 'bouncer')
  inc.status = 'blocked'
  inc.stage = 'closed'
  inc.alert.status = 'closed'
  inc.closed_at = iso(t)
}

/** Analyst closes a pending incident. Shared by the seed and the Approvals page. */
export function resolve(db: MockDb, inc: IncidentDetail, outcome: Resolution, analyst: string, comment: string | null, at: number) {
  const decision = ({ approved: 'approve', rejected: 'reject', escalated: 'escalate' } as const)[outcome]
  inc.approvals.push({ id: nextId(db, 'APR'), incident_id: inc.id, analyst, decision, comment, created_at: iso(at) })
  audit(db, inc, at, 'analyst', outcome, { analyst, comment })
  if (outcome === 'approved') execute(db, inc, at + 800, 'analyst')
  inc.status = outcome
  inc.stage = 'closed'
  inc.alert.status = 'closed'
  inc.closed_at = iso(at + 800)
}
