import { Meter } from '@/components/common/Meter'
import { Panel } from '@/components/common/Panel'
import { formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { IncidentDetail } from '@/types'

/** What the Detective concluded, and the MITRE techniques it grounded that on. */
export function ReasoningPanel({ incident: i }: { incident: IncidentDetail }) {
  const v = i.verdict
  return (
    <Panel
      title="Detective"
      agent="detective"
      aside={v && <span className={v.is_malicious ? 'text-threat' : 'text-success'}>{v.is_malicious ? 'malicious' : 'benign'}</span>}
    >
      {v ? <p className="text-sm leading-relaxed text-text">{v.reasoning}</p> : <p className="text-sm text-text-muted">Investigating…</p>}

      {i.mitre_matches.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs text-text-muted">MITRE ATT&CK matches</p>
          <ul className="space-y-2.5">
            {i.mitre_matches.map((m, k) => (
              <li key={m.id} className="grid grid-cols-[4.5rem_1fr_6rem] items-center gap-3 text-sm sm:grid-cols-[4.5rem_1fr_8rem]">
                <span className={cn('font-mono text-xs', k === 0 && v?.is_malicious ? 'text-threat' : 'text-text-muted')}>{m.id}</span>
                <span className="min-w-0">
                  <span className="block truncate text-text">{m.name}</span>
                  <span className="block truncate text-[11px] text-text-muted">{m.tactic}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Meter value={m.similarity} />
                  <span className="w-8 text-right text-xs text-text-muted tabular-nums">{formatPct(m.similarity)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
