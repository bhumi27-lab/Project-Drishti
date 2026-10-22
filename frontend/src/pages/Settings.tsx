import { EmptyState } from '@/components/common/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { useSettings } from '@/features/settings/hooks'
import { ModeCard } from '@/features/settings/ModeCard'
import { SimulatorCard } from '@/features/settings/SimulatorCard'
import { ThresholdCard } from '@/features/settings/ThresholdCard'

export default function Settings() {
  const { data, isError } = useSettings()

  return (
    <PageShell>
      {isError ? (
        <EmptyState agent="bouncer" title="Can't load settings" />
      ) : !data ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-card/50" />
          <div className="h-48 animate-pulse rounded-2xl bg-card/50" />
        </div>
      ) : (
        <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
          <ThresholdCard value={data.confidence_threshold} />
          <div className="space-y-5">
            <ModeCard mode={data.mitigation_mode} />
            <SimulatorCard simulator={data.simulator} />
          </div>
        </div>
      )}
    </PageShell>
  )
}
