import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Meter } from '@/components/common/Meter'
import { SeverityDot } from '@/components/common/SeverityDot'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Alert, AlertStatus } from '@/types'

const STATUS: Record<AlertStatus, string> = {
  new: 'text-primary',
  investigating: 'text-warning',
  closed: 'text-text-muted',
}

/** Watcher alerts. A table from md up, stacked rows below. Each row opens its incident. */
export function AlertList({ alerts, now }: { alerts: Alert[]; now: number }) {
  const navigate = useNavigate()
  const open = (a: Alert) => a.incident_id && navigate(`/investigations/${a.incident_id}`)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
      <table className="w-full text-sm">
        <thead className="hidden border-b border-border/60 text-left text-xs text-text-muted md:table-header-group">
          <tr>
            <th className="py-3 pr-3 pl-5 font-normal">Source IP</th>
            <th className="px-3 font-normal">Rules</th>
            <th className="w-36 px-3 font-normal">Anomaly</th>
            <th className="px-3 font-normal">Status</th>
            <th className="pr-5 pl-3 text-right font-normal">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {alerts.map((a) => (
            <tr
              key={a.id}
              onClick={() => open(a)}
              onKeyDown={(e) => e.key === 'Enter' && open(a)}
              tabIndex={0}
              className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 px-5 py-3 transition-colors outline-none hover:bg-card/70 focus-visible:bg-card/70 md:table-row md:p-0"
            >
              <td className="md:py-3 md:pr-3 md:pl-5">
                <span className="flex items-center gap-3">
                  <SeverityDot severity={a.severity} />
                  <span className="hidden md:block">
                    <span className="block font-mono text-xs text-text">{a.src_ip}</span>
                    <span className="block text-[11px] text-text-muted">
                      {a.source} · {a.id}
                    </span>
                  </span>
                </span>
              </td>
              <td className="min-w-0 md:px-3">
                <span className="block font-mono text-xs text-text md:hidden">{a.src_ip}</span>
                <span className="block truncate text-xs text-text-muted md:text-sm md:text-text">{a.rule_hits.join(' · ')}</span>
              </td>
              <td className="hidden md:table-cell md:px-3">
                <span className="flex items-center gap-2">
                  <Meter value={a.anomaly_score} />
                  <span className="w-8 text-right text-xs text-text-muted tabular-nums">{a.anomaly_score.toFixed(2)}</span>
                </span>
              </td>
              <td className={cn('hidden text-xs md:table-cell md:px-3', STATUS[a.status])}>{a.status}</td>
              <td className="text-right text-xs text-text-muted md:pr-5 md:pl-3">
                <span className="inline-flex items-center gap-2 tabular-nums">
                  {timeAgo(a.created_at, now)}
                  <ArrowRight className="hidden size-3.5 md:block" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
