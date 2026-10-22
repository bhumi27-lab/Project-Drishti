import type { AlertQuery, IncidentQuery, LogQuery } from '@/types'

/** One place for TanStack Query keys, so live updates can target the right cache. */
export const qk = {
  stats: ['stats'] as const,
  logs: (q: LogQuery = {}) => ['logs', q] as const,
  alerts: (q: AlertQuery = {}) => ['alerts', q] as const,
  incidents: (q: IncidentQuery = {}) => ['incidents', q] as const,
  incident: (id: string) => ['incident', id] as const,
  approvals: ['approvals'] as const,
  actions: ['actions'] as const,
  settings: ['settings'] as const,
}
