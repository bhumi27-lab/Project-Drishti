import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/queryKeys'
import type { ApprovalDecision, Incident } from '@/types'

export function useApprovals() {
  return useQuery({ queryKey: qk.approvals, queryFn: () => api.approvals() })
}

/** Approve / reject / escalate. Drops the card from the queue at once, then refreshes everything it touches. */
export function useDecide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: ApprovalDecision }) => api.decide(id, { decision }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: qk.approvals })
      const prev = qc.getQueryData<Incident[]>(qk.approvals)
      qc.setQueryData<Incident[]>(qk.approvals, (old) => old?.filter((i) => i.id !== id))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.approvals, ctx.prev)
    },
    onSettled: (_data, _err, { id }) => {
      for (const key of [qk.approvals, qk.stats, qk.incident(id), ['incidents'], ['alerts'], qk.actions]) {
        void qc.invalidateQueries({ queryKey: key })
      }
    },
  })
}
