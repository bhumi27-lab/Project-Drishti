import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConfidenceRing } from '@/components/agents/ConfidenceRing'
import { SeverityDot } from '@/components/common/SeverityDot'
import { api } from '@/lib/api'
import { formatPct, timeAgo } from '@/lib/format'
import { ACTION, techniqueLabel } from '@/lib/incident'
import { qk } from '@/lib/queryKeys'
import type { Incident } from '@/types'
import { ApprovalActions } from './ApprovalActions'

/** A pending incident: what happened, how sure the gate was, what the Bouncer wants to do. */
export function ApprovalCard({ incident: i, now }: { incident: Incident; now: number }) {
  // The Detective's reasoning is the "why"; fetch the detail lazily per card.
  const detail = useQuery({ queryKey: qk.incident(i.id), queryFn: () => api.incident(i.id) })
  const action = i.proposed_action
  const ActionIcon = action ? ACTION[action.type].icon : null

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-warning/25 bg-card/50 p-5">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SeverityDot severity={i.severity} />
            <h2 className="truncate font-medium text-text">{techniqueLabel(i)}</h2>
            {i.technique_id && <span className="font-mono text-xs text-threat">{i.technique_id}</span>}
          </div>
          <p className="mt-1 text-sm text-text-muted">{i.summary}</p>
          <p className="mt-1 font-mono text-xs text-text-muted">
            {i.src_ip} · {i.id} · {timeAgo(i.created_at, now)}
          </p>
        </div>
        {i.confidence !== null && (
          <div className="flex flex-col items-center">
            <ConfidenceRing value={i.confidence} decision={i.decision} showValue={false} className="size-12" />
            <span className="mt-1 text-xs text-warning tabular-nums">{formatPct(i.confidence)}</span>
          </div>
        )}
      </header>

      {detail.data?.verdict && <p className="line-clamp-2 border-l-2 border-border pl-3 text-sm text-text-muted">{detail.data.verdict.reasoning}</p>}

      {action && (
        <div className="flex items-center gap-3 rounded-xl bg-surface/70 px-3 py-2.5 text-sm">
          {ActionIcon && <ActionIcon className="size-4 text-primary-glow" />}
          <span className="text-text">{ACTION[action.type].label}</span>
          <span className="truncate font-mono text-xs text-text-muted">{action.target}</span>
        </div>
      )}

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <ApprovalActions incidentId={i.id} />
        <Link to={`/investigations/${i.id}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
          Investigation <ArrowRight className="size-3.5" />
        </Link>
      </footer>
    </article>
  )
}
