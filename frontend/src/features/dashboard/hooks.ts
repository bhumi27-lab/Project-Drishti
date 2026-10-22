import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/queryKeys'

export function useStats() {
  return useQuery({ queryKey: qk.stats, queryFn: () => api.stats() })
}
