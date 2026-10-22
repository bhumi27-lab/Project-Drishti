import { Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { Segmented } from '@/components/common/Segmented'
import { SeverityDot } from '@/components/common/SeverityDot'
import { PageShell } from '@/components/layout/PageShell'
import { Input } from '@/components/ui/input'
import { AlertList } from '@/features/alerts/AlertList'
import { useAlerts } from '@/features/alerts/hooks'
import { useDebounced } from '@/hooks/useDebounced'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import type { AlertStatus, Severity } from '@/types'

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low']
type StatusFilter = AlertStatus | 'all'

export default function Alerts() {
  const [params, setParams] = useSearchParams()
  const severity = (params.get('severity')?.split(',').filter(Boolean) ?? []) as Severity[]
  const status = (params.get('status') as StatusFilter | null) ?? 'all'
  const [ip, setIp] = useState(params.get('ip') ?? '')
  const debouncedIp = useDebounced(ip)
  const now = useNow()

  const { data, isError } = useAlerts({ severity, status: status === 'all' ? undefined : status, ip: debouncedIp || undefined })

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const toggleSeverity = (s: Severity) =>
    update('severity', (severity.includes(s) ? severity.filter((x) => x !== s) : [...severity, s]).join(','))

  return (
    <PageShell className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5" role="group" aria-label="Severity">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={severity.includes(s)}
              onClick={() => toggleSeverity(s)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs capitalize transition-colors',
                severity.includes(s) ? 'border-primary/40 bg-primary/10 text-text' : 'border-border text-text-muted hover:text-text',
              )}
            >
              <SeverityDot severity={s} /> {s}
            </button>
          ))}
        </div>
        <Segmented<StatusFilter>
          label="Status"
          value={status}
          onChange={(v) => update('status', v === 'all' ? '' : v)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'investigating', label: 'Investigating' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <div className="relative w-full sm:ml-auto sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            value={ip}
            onChange={(e) => {
              setIp(e.target.value)
              update('ip', e.target.value)
            }}
            placeholder="Source IP"
            className="h-9 pl-8 font-mono text-xs"
          />
        </div>
      </div>

      {isError ? (
        <EmptyState agent="watcher" title="Can't load alerts" />
      ) : !data ? (
        <div className="h-96 animate-pulse rounded-2xl bg-card/50" />
      ) : data.length === 0 ? (
        <EmptyState agent="watcher" title="No alerts match" />
      ) : (
        <AlertList alerts={data} now={now} />
      )}
    </PageShell>
  )
}
