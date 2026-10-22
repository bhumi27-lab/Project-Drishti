import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { Segmented, type SegmentOption } from '@/components/common/Segmented'
import { PageShell } from '@/components/layout/PageShell'
import { IncidentRow } from '@/features/incidents/IncidentRow'
import { useIncidents } from '@/features/incidents/hooks'
import { useNow } from '@/hooks/useNow'
import type { IncidentStatus } from '@/types'

type Filter = IncidentStatus | 'all'
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'approved', label: 'Approved' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'dismissed', label: 'Dismissed' },
]

export default function Investigations() {
  const [params, setParams] = useSearchParams()
  const filter = (params.get('status') as Filter | null) ?? 'all'
  const { data, isError } = useIncidents()
  const now = useNow()

  const options: SegmentOption<Filter>[] = FILTERS.map((f) => ({
    ...f,
    count: data && (f.value === 'all' ? data.length : data.filter((i) => i.status === f.value).length),
  }))
  const rows = data?.filter((i) => filter === 'all' || i.status === filter)

  return (
    <PageShell className="space-y-5">
      <Segmented
        label="Status"
        options={options}
        value={filter}
        onChange={(v) => setParams(v === 'all' ? {} : { status: v }, { replace: true })}
      />

      {isError ? (
        <EmptyState agent="detective" title="Can't load incidents" />
      ) : !rows ? (
        <div className="h-96 animate-pulse rounded-2xl bg-card/50" />
      ) : rows.length === 0 ? (
        <EmptyState agent="detective" title="Nothing here" />
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card/40">
          {rows.map((i) => (
            <li key={i.id}>
              <IncidentRow incident={i} now={now} full />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
