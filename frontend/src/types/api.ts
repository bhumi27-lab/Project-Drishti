// Request/response shapes for /api/v1 (docs/PROJECT_PLAN.md 7.5).
import type { AlertStatus, ApprovalDecision, IncidentStatus, LogSource, MitigationMode, Severity } from './domain'

export interface Page<T> {
  items: T[]
  total: number
}

export interface LogQuery {
  q?: string
  source?: LogSource
  alert_id?: string
  limit?: number
}

export interface AlertQuery {
  severity?: Severity[]
  status?: AlertStatus
  ip?: string
}

export interface IncidentQuery {
  status?: IncidentStatus
}

export interface ApprovalRequest {
  decision: ApprovalDecision
  comment?: string
}

export interface StageCount {
  processed: number // last 24 h
  active: number // right now
}

export interface Stats {
  logs_processed: number
  threats_detected: number
  auto_blocked: number
  awaiting_approval: number
  pipeline: Record<'watcher' | 'detective' | 'gate' | 'bouncer' | 'human', StageCount>
  threats_24h: { hour: string; count: number }[] // 24 buckets, oldest first
}

export type ScenarioId = 'ssh_bruteforce' | 'port_scan' | 'sql_injection' | 'odd_login' | 'unknown' | 'normal'

export interface Settings {
  confidence_threshold: number // 0-1
  mitigation_mode: MitigationMode
  simulator: { running: boolean; scenario: ScenarioId | 'mixed' }
}
