// Mirrors backend/app/schemas. Keep in sync with docs/PROJECT_PLAN.md section 7.

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type LogSource = 'ssh' | 'web' | 'firewall' | 'system'
export type Stage = 'watcher' | 'detective' | 'gate' | 'bouncer' | 'human'
export type Decision = 'auto' | 'human' | 'dismiss'
export type IncidentStatus = 'open' | 'blocked' | 'approved' | 'rejected' | 'escalated'
export type AlertStatus = 'new' | 'investigating' | 'closed'

export interface Log {
  id: string
  timestamp: string
  source: LogSource
  src_ip: string
  dst_ip: string | null
  user: string | null
  event_type: string
  raw: string
  parsed: Record<string, unknown>
}

export interface Alert {
  id: string
  created_at: string
  log_ids: string[]
  anomaly_score: number
  rule_hits: string[]
  severity: Severity
  status: AlertStatus
}

export interface MitreMatch {
  id: string
  name: string
  tactic: string
  similarity: number
}

export interface Verdict {
  technique_id: string | null
  is_malicious: boolean
  reasoning: string
  llm_confidence: number
  needs_more_context: boolean
  context_query: string | null
}

export interface Action {
  id: string
  incident_id: string
  type: 'block_ip' | 'rate_limit' | 'disable_user'
  target: string
  mode: 'simulated' | 'real'
  executed_by: 'bouncer' | 'analyst'
  success: boolean
  created_at: string
}

export interface Incident {
  id: string
  alert_id: string
  stage: Stage
  technique_id: string | null
  technique_name: string | null
  confidence: number | null
  confidence_breakdown: Record<string, number>
  decision: Decision | null
  status: IncidentStatus
  verdict: Verdict | null
  mitre_matches: MitreMatch[]
  created_at: string
  closed_at: string | null
}

export interface Approval {
  id: string
  incident_id: string
  analyst: string
  decision: 'approve' | 'reject' | 'escalate'
  comment: string | null
  created_at: string
}
