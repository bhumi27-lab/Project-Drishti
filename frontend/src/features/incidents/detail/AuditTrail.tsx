import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { Panel } from '@/components/common/Panel'
import { clockTime } from '@/lib/format'
import { actorGlyph, describeAudit } from '@/lib/incident'
import type { AuditEntry } from '@/types'

/** Every decision, in order, by whom. */
export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  return (
    <Panel title="Audit trail" aside={entries.length}>
      <ol className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-border">
        {entries.map((e) => {
          const { title, detail } = describeAudit(e)
          return (
            <li key={e.id} className="relative grid grid-cols-[20px_1fr_auto] items-start gap-3">
              <span className="grid size-5 place-items-center rounded-full bg-card ring-1 ring-border">
                <AgentGlyph agent={actorGlyph(e.actor)} className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-text">{title}</p>
                {detail && <p className="truncate text-xs text-text-muted">{detail}</p>}
              </div>
              <time dateTime={e.created_at} className="font-mono text-[11px] text-text-muted tabular-nums">
                {clockTime(e.created_at)}
              </time>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}
