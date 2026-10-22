import { Ban, Gauge, UserX, type LucideIcon } from 'lucide-react'
import type { GlyphAgent } from '@/components/agents/AgentGlyph'
import type { ActionType, Actor, AuditEntry, ConfidenceBreakdown, Decision, Incident } from '@/types'
import { formatPct } from './format'

/** The character currently holding the incident, or the one that closed it. */
export function handlerOf(i: Pick<Incident, 'stage' | 'decision'>): GlyphAgent {
  if (i.stage === 'human') return 'analyst'
  if (i.stage !== 'closed') return i.stage
  if (i.decision === 'auto') return 'bouncer'
  if (i.decision === 'human') return 'analyst'
  return 'gate'
}

export const HANDLER_LABEL: Record<GlyphAgent, string> = {
  watcher: 'Watcher',
  detective: 'Detective',
  gate: 'Confidence Gate',
  bouncer: 'Bouncer',
  analyst: 'Analyst',
}

export function techniqueLabel(i: Pick<Incident, 'technique_name'>): string {
  return i.technique_name ?? 'Unclassified'
}

export const ACTION: Record<ActionType, { label: string; icon: LucideIcon }> = {
  block_ip: { label: 'Block IP', icon: Ban },
  rate_limit: { label: 'Rate limit', icon: Gauge },
  disable_user: { label: 'Disable user', icon: UserX },
}

/** The gate's decision as a colour: green = Bouncer acted, amber = a human decides. */
export const DECISION_COLOR: Record<Decision, string> = {
  auto: 'var(--success)',
  human: 'var(--warning)',
  dismiss: 'var(--text-muted)',
}

export const FACTOR_LABEL: Record<keyof ConfidenceBreakdown, string> = {
  anomaly: 'Anomaly',
  mitre: 'MITRE match',
  llm: 'LLM confidence',
  history: 'History',
}

export const actorGlyph = (a: Actor): GlyphAgent => (a === 'system' ? 'gate' : a)

const EVENT_LABEL: Record<string, string> = {
  alert_raised: 'Raised an alert',
  mitre_retrieved: 'Matched MITRE ATT&CK',
  context_requested: 'Asked Watcher for context',
  context_returned: 'Returned context',
  verdict: 'Gave a verdict',
  decision: 'Scored confidence',
  approval_requested: 'Asked an analyst',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  action_executed: 'Executed action',
}

/** One readable line per audit entry, e.g. "Scored confidence · 92% → auto". */
export function describeAudit(e: AuditEntry): { title: string; detail?: string } {
  const d = e.details
  const title = EVENT_LABEL[e.event] ?? e.event
  switch (e.event) {
    case 'alert_raised':
      return { title, detail: (d.rule_hits as string[] | undefined)?.join(', ') }
    case 'mitre_retrieved':
      return { title, detail: `${d.top} · ${formatPct(Number(d.similarity))}` }
    case 'context_requested':
      return { title, detail: String(d.query) }
    case 'verdict':
      return { title, detail: `${d.technique ?? 'no technique'} · ${d.malicious ? 'malicious' : 'benign'} · ${formatPct(Number(d.llm_confidence))}` }
    case 'decision':
      return { title, detail: `${formatPct(Number(d.confidence))} → ${d.decision}` }
    case 'action_executed':
      return { title, detail: `${ACTION[d.type as ActionType]?.label ?? d.type} ${d.target} · ${d.mode}` }
    case 'approved':
    case 'rejected':
    case 'escalated':
      return { title: `${d.analyst} ${title.toLowerCase()}`, detail: (d.comment as string | null) ?? undefined }
    default:
      return { title }
  }
}
