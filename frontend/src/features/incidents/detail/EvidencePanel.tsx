import { useState } from 'react'
import { Panel } from '@/components/common/Panel'
import { clockTime, shortDateTime } from '@/lib/format'
import type { Log } from '@/types'
import { useAlertLogs } from '../hooks'

function Lines({ logs, dated = false }: { logs: Log[]; dated?: boolean }) {
  return (
    <ul className="space-y-1 font-mono text-[11px] leading-relaxed">
      {logs.map((l) => (
        <li key={l.id} className="grid grid-cols-[auto_1fr] gap-3">
          <span className="text-text-muted tabular-nums">{dated ? shortDateTime(l.timestamp) : clockTime(l.timestamp)}</span>
          <span className="truncate text-text/85" title={l.raw}>
            {l.raw}
          </span>
        </li>
      ))}
    </ul>
  )
}

const PREVIEW = 6

/** The logs that raised the alert, plus the history Watcher pulled for context. */
export function EvidencePanel({ alertId, related }: { alertId: string; related: Log[] }) {
  const { data } = useAlertLogs(alertId)
  const [all, setAll] = useState(false)
  const trigger = [...(data?.items ?? [])].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const shown = all ? trigger : trigger.slice(0, PREVIEW)

  return (
    <Panel title="Evidence" agent="watcher" aside={data && `${data.total} logs`}>
      {data ? <Lines logs={shown} /> : <div className="h-24 animate-pulse rounded-lg bg-card/60" />}
      {trigger.length > PREVIEW && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 text-xs text-primary-glow hover:underline">
          {all ? 'Show less' : `Show all ${trigger.length}`}
        </button>
      )}
      {related.length > 0 && (
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="mb-2 text-xs text-text-muted">History</p>
          <Lines logs={[...related].sort((a, b) => b.timestamp.localeCompare(a.timestamp))} dated />
        </div>
      )}
    </Panel>
  )
}
