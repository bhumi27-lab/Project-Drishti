import { ArrowUpRight, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApprovalDecision } from '@/types'
import { useDecide } from './hooks'

/** Approve / Reject / Escalate for one pending incident. Used on Approvals and on the Investigation page. */
export function ApprovalActions({ incidentId, className }: { incidentId: string; className?: string }) {
  const decide = useDecide()
  const go = (decision: ApprovalDecision) => decide.mutate({ id: incidentId, decision })
  const busy = decide.isPending

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button onClick={() => go('approve')} disabled={busy} className="h-9 px-3">
        <Check data-icon="inline-start" /> Approve
      </Button>
      <Button variant="outline" onClick={() => go('reject')} disabled={busy} className="h-9 px-3">
        <X data-icon="inline-start" /> Reject
      </Button>
      <Button variant="ghost" onClick={() => go('escalate')} disabled={busy} className="h-9 px-3 text-text-muted">
        <ArrowUpRight data-icon="inline-start" /> Escalate
      </Button>
      {decide.isError && <p className="w-full text-xs text-warning">Couldn't save. Try again.</p>}
    </div>
  )
}
