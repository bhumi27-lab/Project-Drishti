// Domain records. Mirror backend/app/schemas (docs/PROJECT_PLAN.md 7.1).

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type LogSource = 'ssh' | 'web' | 'firewall' | 'system'
export type AgentId = 'watcher' | 'detective' | 'gate' | 'bouncer'
/** Where an incident is in the pipeline. `human` = waiting for an analyst. */
export type Stage = AgentId | 'human' | 'closed'
export type Decision = 'auto' | 'human' | 'dismiss'
export type IncidentStatus = 'open' | 'blocked' | 'approved' | 'rejected' | 'escalated' | 'dismissed'
export type AlertStatus = 'new' | 'investigating' | 'closed'
export type ActionType = 'block_ip' | 'rate_limit' | 'disable_user'
export type MitigationMode = 'simulated' | 'real'
export type Actor = AgentId | 'analyst' | 'system'

export interface Log {
  id: string
  timestamp: string // ISO 8601
  source: LogSource
  src_ip: string
  dst_ip: string | null
  user: string | null
  event_type: string
  raw: string
  parsed: Record<string, unknown>
  /** Set when this log is part of an alert. */
  alert_id: string | null
}

export interface Alert {
  id: string
  created_at: string
  log_ids: string[]
  anomaly_score: number // 0-1
  rule_hits: string[]
  severity: Severity
  status: AlertStatus
  src_ip: string
  source: LogSource
  incident_id: string | null
}

export interface MitreMatch {
  id: string // e.g. T1110
  name: string
  tactic: string
  similarity: number // 0-1
}

export interface Verdict {
  technique_id: string | null
  technique_name: string | null
  is_malicious: boolean
  reasoning: string
  llm_confidence: number
  needs_more_context: boolean
  context_query: string | null
}

/** Raw factor values (0-1) the Confidence Gate weighs. */
export interface ConfidenceBreakdown {
  anomaly: number
  mitre: number
  llm: number
  history: number
}

export interface ContextRequest {
  id: string
  incident_id: string
  requested_by: 'detective'
  query: string
  result_summary: string
  created_at: string
}

export interface ProposedAction {
  type: ActionType
  target: string
}

export interface Action extends ProposedAction {
  id: string
  incident_id: string
  mode: MitigationMode
  executed_by: 'bouncer' | 'analyst'
  success: boolean
  created_at: string
}

export interface Approval {
  id: string
  incident_id: string
  analyst: string
  decision: ApprovalDecision
  comment: string | null
  created_at: string
}

export type ApprovalDecision = 'approve' | 'reject' | 'escalate'

export interface AuditEntry {
  id: string
  incident_id: string
  actor: Actor
  event: string
  details: Record<string, unknown>
  created_at: string
}

/** Incident as listed. The detail view adds the evidence trail. */
export interface Incident {
  id: string
  alert_id: string
  src_ip: string
  summary: string
  severity: Severity
  stage: Stage
  technique_id: string | null
  technique_name: string | null
  confidence: number | null
  decision: Decision | null
  status: IncidentStatus
  proposed_action: ProposedAction | null
  created_at: string
  closed_at: string | null
}

export interface IncidentDetail extends Incident {
  alert: Alert
  verdict: Verdict | null
  mitre_matches: MitreMatch[]
  confidence_breakdown: ConfidenceBreakdown | null
  context_requests: ContextRequest[]
  related_events: Log[]
  actions: Action[]
  approvals: Approval[]
  audit: AuditEntry[]
}
