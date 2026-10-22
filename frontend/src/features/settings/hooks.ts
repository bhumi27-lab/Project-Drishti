import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/queryKeys'
import type { Settings } from '@/types'

export function useSettings() {
  return useQuery({ queryKey: qk.settings, queryFn: () => api.settings() })
}

/** Optimistic: the UI (and the Topbar chips) change at once, and roll back if the save fails. */
export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => api.updateSettings(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: qk.settings })
      const prev = qc.getQueryData<Settings>(qk.settings)
      if (prev) qc.setQueryData<Settings>(qk.settings, { ...prev, ...patch, simulator: { ...prev.simulator, ...patch.simulator } })
      return { prev }
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.settings, ctx.prev)
    },
    onSuccess: (saved) => qc.setQueryData(qk.settings, saved),
  })
}
