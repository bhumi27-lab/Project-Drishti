import { ConfidenceRing } from '@/components/agents/ConfidenceRing'
import { SeverityDot } from '@/components/common/SeverityDot'
import { StatusChip } from '@/components/common/StatusChip'
import { ApprovalActions } from '@/features/approvals/ApprovalActions'
import { shortDateTime } from '@/lib/format'
import { techniqueLabel } from '@/lib/incident'
import type { IncidentDetail } from '@/types'

export function IncidentHeader({ incident: i }: { incident: IncidentDetail }) {
  const pending = i.stage === 'human' && i.status === 'open'
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/40 p-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityDot severity={i.severity} />
          <h2 className="text-xl font-semibold tracking-tight text-text">{techniqueLabel(i)}</h2>
          {i.technique_id && (
            <span className="rounded-full border border-threat/30 px-2 py-0.5 font-mono text-xs text-threat">{i.technique_id}</span>
          )}
          <StatusChip status={i.status} stage={i.stage} />
        </div>
        <p className="mt-1.5 text-sm text-text-muted">{i.summary}</p>
        <p className="mt-1 font-mono text-xs text-text-muted">
          {i.src_ip} · {i.alert_id} · {shortDateTime(i.created_at)}
        </p>
        {pending && <ApprovalActions incidentId={i.id} className="mt-4" />}
      </div>
      {i.confidence !== null && (
        <div className="flex items-center gap-3 sm:flex-col sm:gap-1">
          <ConfidenceRing value={i.confidence} decision={i.decision} className="size-20" />
          <span className="text-xs text-text-muted">confidence</span>
        </div>
      )}
    </section>
  )
}
