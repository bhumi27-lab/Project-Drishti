import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useLiveEvent } from '@/lib/live'
import { qk } from '@/lib/queryKeys'
import type { Incident, Stats } from '@/types'

const upsert = (list: Incident[], inc: Incident) =>
  list.some((i) => i.id === inc.id) ? list.map((i) => (i.id === inc.id ? inc : i)) : [inc, ...list]

/**
 * Keeps the TanStack Query cache in step with live events: the incident list is patched in place
 * (so the feed moves at once), everything derived is refetched.
 */
export function useLiveCache() {
  const qc = useQueryClient()
  const refresh = (...keys: QueryKey[]) => {
    for (const queryKey of keys) void qc.invalidateQueries({ queryKey })
  }

  useLiveEvent((e) => {
    switch (e.type) {
      case 'log':
        qc.setQueryData<Stats>(qk.stats, (s) => s && { ...s, logs_processed: s.logs_processed + 1 })
        break
      case 'alert':
        refresh(['alerts'])
        break
      case 'stage_change':
        qc.setQueryData<Incident[]>(qk.incidents(), (list) => list && upsert(list, e.data.incident))
        refresh(qk.stats, qk.incident(e.data.incident.id))
        break
      case 'approval_needed':
      case 'incident_closed':
        qc.setQueryData<Incident[]>(qk.incidents(), (list) => list && upsert(list, e.data))
        refresh(qk.stats, qk.incident(e.data.id), qk.approvals, qk.actions, ['alerts'])
        break
    }
  })
}
