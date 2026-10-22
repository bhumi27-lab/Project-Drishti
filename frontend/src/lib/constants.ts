import type { Stage } from '@/types'

export const CONFIDENCE_THRESHOLD = 0.8

export const STAGES: { id: Stage; label: string; verb: string }[] = [
  { id: 'watcher', label: 'Watcher', verb: 'SEE' },
  { id: 'detective', label: 'Detective', verb: 'UNDERSTAND' },
  { id: 'gate', label: 'Confidence Gate', verb: 'DECIDE' },
  { id: 'bouncer', label: 'Bouncer', verb: 'DEFEND' },
]

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'
