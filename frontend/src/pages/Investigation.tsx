import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { ActionPanel } from '@/features/incidents/detail/ActionPanel'
import { AuditTrail } from '@/features/incidents/detail/AuditTrail'
import { ConfidencePanel } from '@/features/incidents/detail/ConfidencePanel'
import { ContextThread } from '@/features/incidents/detail/ContextThread'
import { EvidencePanel } from '@/features/incidents/detail/EvidencePanel'
import { IncidentHeader } from '@/features/incidents/detail/IncidentHeader'
import { ReasoningPanel } from '@/features/incidents/detail/ReasoningPanel'
import { StageTimeline } from '@/features/incidents/detail/StageTimeline'
import { useIncident } from '@/features/incidents/hooks'

export default function Investigation() {
  const { id = '' } = useParams()
  const { data: inc, isError, isPending } = useIncident(id)

  return (
    <PageShell className="space-y-5">
      <Link to="/investigations" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text">
        <ArrowLeft className="size-3.5" /> Investigations
      </Link>

      {isError ? (
        <EmptyState agent="detective" title="Incident not found" />
      ) : isPending ? (
        <div className="space-y-5">
          <div className="h-36 animate-pulse rounded-2xl bg-card/50" />
          <div className="h-32 animate-pulse rounded-2xl bg-card/50" />
        </div>
      ) : (
        <>
          <IncidentHeader incident={inc} />
          <StageTimeline incident={inc} />
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="min-w-0 space-y-5">
              <ReasoningPanel incident={inc} />
              <ContextThread requests={inc.context_requests} />
              <EvidencePanel alertId={inc.alert_id} related={inc.related_events} />
            </div>
            <div className="min-w-0 space-y-5">
              {inc.confidence_breakdown && inc.confidence !== null && (
                <ConfidencePanel breakdown={inc.confidence_breakdown} confidence={inc.confidence} decision={inc.decision} />
              )}
              <ActionPanel incident={inc} />
              <AuditTrail entries={inc.audit} />
            </div>
          </div>
        </>
      )}
    </PageShell>
  )
}
