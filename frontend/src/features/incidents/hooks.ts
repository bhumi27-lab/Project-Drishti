import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/queryKeys'
import type { IncidentQuery } from '@/types'

export function useIncidents(q: IncidentQuery = {}) {
  return useQuery({ queryKey: qk.incidents(q), queryFn: () => api.incidents(q) })
}

export function useIncident(id: string) {
  return useQuery({ queryKey: qk.incident(id), queryFn: () => api.incident(id), retry: false })
}

/** The logs that make up an alert (the incident's trigger evidence). */
export function useAlertLogs(alertId: string | undefined) {
  const q = { alert_id: alertId, limit: 100 }
  return useQuery({ queryKey: qk.logs(q), queryFn: () => api.logs(q), enabled: !!alertId })
}
