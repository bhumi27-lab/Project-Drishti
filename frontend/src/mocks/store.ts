// In-memory backend (request/response half). Only lib/api.ts should import this.
import type {
  Action, Alert, AlertQuery, ApprovalRequest, Incident, IncidentDetail, IncidentQuery, Log, LogQuery, Page, ScenarioId, Settings, Stats,
} from '@/types'
import { db } from './db'
import { emit, inject } from './emitter'
import { resolve, toSummary } from './pipeline'

const HOUR = 3_600_000

const byNewest = <T extends { created_at: string }>(a: T, b: T) => b.created_at.localeCompare(a.created_at)

export function listLogs({ q, source, alert_id, limit = 200 }: LogQuery = {}): Page<Log> {
  const needle = q?.trim().toLowerCase()
  const items = db.logs.filter(
    (l) => (!source || l.source === source) && (!alert_id || l.alert_id === alert_id) && (!needle || l.raw.toLowerCase().includes(needle)),
  )
  return { items: items.slice(0, limit), total: items.length }
}

export function listAlerts({ severity, status, ip }: AlertQuery = {}): Alert[] {
  return db.alerts
    .filter((a) => (!severity?.length || severity.includes(a.severity)) && (!status || a.status === status) && (!ip || a.src_ip.includes(ip.trim())))
    .sort(byNewest)
}

export function listIncidents({ status }: IncidentQuery = {}): Incident[] {
  return db.incidents.filter((i) => !status || i.status === status).sort(byNewest).map(toSummary)
}

export function getIncident(id: string): IncidentDetail {
  const inc = db.incidents.find((i) => i.id === id)
  if (!inc) throw new Error(`Incident ${id} not found`)
  return inc
}

export function listApprovals(): Incident[] {
  return db.incidents.filter((i) => i.stage === 'human' && i.status === 'open').sort(byNewest).map(toSummary)
}

export function decide(id: string, { decision, comment }: ApprovalRequest): Incident {
  const inc = getIncident(id)
  if (inc.stage !== 'human') throw new Error(`Incident ${id} is not awaiting approval`)
  const outcome = ({ approve: 'approved', reject: 'rejected', escalate: 'escalated' } as const)[decision]
  resolve(db, inc, outcome, 'You', comment ?? null, Date.now())
  emit({ type: 'incident_closed', data: toSummary(inc) })
  return toSummary(inc)
}

export function listActions(): Action[] {
  return db.incidents.flatMap((i) => i.actions).sort(byNewest)
}

export function getStats(now = Date.now()): Stats {
  // "Last 24 h" = the 24 local-hour buckets of the chart, so tiles and chart always agree.
  const hourStart = new Date(now).setMinutes(0, 0, 0)
  const since = hourStart - 23 * HOUR
  const recent = db.incidents.filter((i) => Date.parse(i.created_at) >= since)
  const active = (stage: Incident['stage']) => db.incidents.filter((i) => i.stage === stage && i.status === 'open').length

  return {
    logs_processed: db.logs.filter((l) => Date.parse(l.timestamp) >= since).length,
    threats_detected: recent.filter((i) => i.status !== 'dismissed').length,
    auto_blocked: recent.filter((i) => i.decision === 'auto').length,
    awaiting_approval: active('human'),
    pipeline: {
      watcher: { processed: db.alerts.filter((a) => Date.parse(a.created_at) >= since).length, active: active('watcher') },
      detective: { processed: recent.filter((i) => i.verdict).length, active: active('detective') },
      gate: { processed: recent.filter((i) => i.decision).length, active: active('gate') },
      bouncer: { processed: recent.reduce((n, i) => n + i.actions.length, 0), active: active('bouncer') },
      human: { processed: recent.filter((i) => i.decision === 'human').length, active: active('human') },
    },
    threats_24h: Array.from({ length: 24 }, (_, k) => {
      const start = hourStart - (23 - k) * HOUR
      const count = recent.filter((i) => {
        const t = Date.parse(i.created_at)
        return i.status !== 'dismissed' && t >= start && t < start + HOUR
      }).length
      return { hour: new Date(start).toISOString(), count }
    }),
  }
}

export function getSettings(): Settings {
  return db.settings
}

export function updateSettings(patch: Partial<Settings>): Settings {
  db.settings = { ...db.settings, ...patch, simulator: { ...db.settings.simulator, ...patch.simulator } }
  return db.settings
}

/** POST /simulator/inject: run one scenario through the pipeline now. */
export function injectScenario(scenario: ScenarioId | 'mixed'): { ok: true } {
  inject(scenario)
  return { ok: true }
}
