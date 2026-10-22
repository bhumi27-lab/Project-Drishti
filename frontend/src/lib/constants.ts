import type { AgentId, Settings } from '@/types'

export const CONFIDENCE_THRESHOLD = 0.8
/** Below this, a non-malicious verdict is dismissed instead of sent to a human. */
export const DISMISS_BELOW = 0.4

export const STAGES: { id: AgentId; label: string; verb: string }[] = [
  { id: 'watcher', label: 'Watcher', verb: 'SEE' },
  { id: 'detective', label: 'Detective', verb: 'UNDERSTAND' },
  { id: 'gate', label: 'Confidence Gate', verb: 'DECIDE' },
  { id: 'bouncer', label: 'Bouncer', verb: 'DEFEND' },
]

export const SCENARIO_LABEL: Record<Settings['simulator']['scenario'], string> = {
  mixed: 'Mixed traffic',
  ssh_bruteforce: 'SSH brute force',
  port_scan: 'Port scan',
  sql_injection: 'SQL injection',
  odd_login: '3 AM login',
  unknown: 'Unknown behaviour',
  normal: 'Normal only',
}

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'
