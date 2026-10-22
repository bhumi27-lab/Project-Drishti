import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/queryKeys'
import type { AlertQuery } from '@/types'

export function useAlerts(q: AlertQuery) {
  return useQuery({ queryKey: qk.alerts(q), queryFn: () => api.alerts(q), placeholderData: keepPreviousData })
}
