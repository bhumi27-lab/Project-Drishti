import { Link } from 'react-router-dom'
import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { ConfidenceRing } from '@/components/agents/ConfidenceRing'
import { SeverityDot } from '@/components/common/SeverityDot'
import { StatusChip } from '@/components/common/StatusChip'
import { formatPct, timeAgo } from '@/lib/format'
import { HANDLER_LABEL, handlerOf, techniqueLabel } from '@/lib/incident'
import type { Incident } from '@/types'

/** One incident in a list. `full` adds the summary and confidence (Investigations); compact is the Dashboard feed. */
export function IncidentRow({ incident: i, now, full = false }: { incident: Incident; now: number; full?: boolean }) {
  const handler = handlerOf(i)
  const open = i.status === 'open'

  return (
    <Link
      to={`/investigations/${i.id}`}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-card/70"
    >
      <SeverityDot severity={i.severity} />
      <div className="min-w-0">
        <p className="truncate text-sm text-text">
          {techniqueLabel(i)}
          {full && <span className="ml-2 text-text-muted">{i.summary}</span>}
        </p>
        <p className="truncate font-mono text-xs text-text-muted">
          {i.src_ip} · {i.id}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {full && i.confidence !== null && (
          <span className="hidden items-center gap-1.5 text-xs text-text-muted tabular-nums md:flex">
            <ConfidenceRing value={i.confidence} decision={i.decision} showValue={false} className="size-5" />
            {formatPct(i.confidence)}
          </span>
        )}
        <AgentGlyph agent={handler} active={open} title={HANDLER_LABEL[handler]} className="hidden size-5 sm:block" />
        <StatusChip status={i.status} stage={i.stage} className={open ? undefined : 'hidden sm:inline-flex'} />
        <time dateTime={i.created_at} className="w-9 text-right text-xs text-text-muted tabular-nums">
          {timeAgo(i.created_at, now)}
        </time>
      </div>
    </Link>
  )
}
