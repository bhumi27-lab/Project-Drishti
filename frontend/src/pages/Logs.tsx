import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { Segmented } from '@/components/common/Segmented'
import { PageShell } from '@/components/layout/PageShell'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { LogLine } from '@/features/logs/LogLine'
import { useDebounced } from '@/hooks/useDebounced'
import { api } from '@/lib/api'
import { formatCount } from '@/lib/format'
import { useLiveEvent } from '@/lib/live'
import { qk } from '@/lib/queryKeys'
import type { Log, LogSource, Page } from '@/types'

type SourceFilter = LogSource | 'all'
const LIMIT = 300

export default function Logs() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [source, setSource] = useState<SourceFilter>('all')
  const [tail, setTail] = useState(true)
  const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set())
  const needle = useDebounced(q.trim())

  const query = { q: needle || undefined, source: source === 'all' ? undefined : source, limit: LIMIT }
  const { data, isError } = useQuery({ queryKey: qk.logs(query), queryFn: () => api.logs(query), placeholderData: keepPreviousData })

  // Live tail: new matching lines go on top and glow briefly. Off = the list holds still for reading.
  useLiveEvent((e) => {
    if (e.type === 'alert') void qc.invalidateQueries({ queryKey: qk.logs(query) }) // pick up the coral markers
    if (e.type !== 'log') return
    const l = e.data
    if (query.source && l.source !== query.source) return
    if (needle && !l.raw.toLowerCase().includes(needle.toLowerCase())) return
    qc.setQueryData<Page<Log>>(qk.logs(query), (p) => p && { items: [l, ...p.items].slice(0, LIMIT), total: p.total + 1 })
    setFresh((s) => new Set(s).add(l.id))
    window.setTimeout(() => setFresh((s) => (s.has(l.id) ? new Set([...s].filter((id) => id !== l.id)) : s)), 1500)
  }, tail)

  return (
    <PageShell className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search logs" className="h-9 pl-8 font-mono text-xs" />
        </div>
        <Segmented<SourceFilter>
          label="Source"
          value={source}
          onChange={setSource}
          options={[
            { value: 'all', label: 'All' },
            { value: 'ssh', label: 'SSH' },
            { value: 'web', label: 'Web' },
            { value: 'firewall', label: 'Firewall' },
            { value: 'system', label: 'System' },
          ]}
        />
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs text-text-muted">
          <Switch checked={tail} onCheckedChange={setTail} />
          Live tail
        </label>
      </div>

      {isError ? (
        <EmptyState agent="watcher" title="Can't load logs" />
      ) : !data ? (
        <div className="h-128 animate-pulse rounded-2xl bg-card/50" />
      ) : data.items.length === 0 ? (
        <EmptyState agent="watcher" title="No logs match" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
          <ul className="max-h-[calc(100vh-14rem)] overflow-y-auto py-2">
            {data.items.map((l) => (
              <LogLine key={l.id} log={l} needle={needle} fresh={fresh.has(l.id)} />
            ))}
          </ul>
          <p className="border-t border-border/60 px-4 py-2 text-[11px] text-text-muted">
            {formatCount(data.items.length)} of {formatCount(data.total)}
          </p>
        </div>
      )}
    </PageShell>
  )
}
