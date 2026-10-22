import { EmptyState } from '@/components/common/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { useStats } from '@/features/dashboard/hooks'
import { useIncidents } from '@/features/incidents/hooks'
import { IncidentFeed } from '@/features/dashboard/IncidentFeed'
import { PipelineStrip } from '@/features/dashboard/PipelineStrip'
import { StatTiles } from '@/features/dashboard/StatTiles'
import { ThreatsChart } from '@/features/dashboard/ThreatsChart'

export default function Dashboard() {
  const stats = useStats()
  const incidents = useIncidents()

  if (stats.isError || incidents.isError) {
    return (
      <PageShell>
        <EmptyState agent="watcher" title="Can't reach the backend">
          Check the API, or set VITE_USE_MOCKS=true.
        </EmptyState>
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-6">
      <StatTiles stats={stats.data} />
      <PipelineStrip stats={stats.data} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <IncidentFeed incidents={incidents.data?.slice(0, 10)} />
        <ThreatsChart data={stats.data?.threats_24h} />
      </div>
    </PageShell>
  )
}
