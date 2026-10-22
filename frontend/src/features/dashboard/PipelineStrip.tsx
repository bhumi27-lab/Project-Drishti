import { Link } from 'react-router-dom'
import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { STAGES } from '@/lib/constants'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AgentId, Stats } from '@/types'
import { PipelinePulses } from './PipelinePulses'

const CAPTION: Record<AgentId, string> = {
  watcher: 'alerts',
  detective: 'investigated',
  gate: 'decided',
  bouncer: 'actions',
}

/** The four agents left to right, with 24 h counts. Agents holding an incident right now pulse. */
export function PipelineStrip({ stats }: { stats?: Stats }) {
  const waiting = stats?.pipeline.human.active ?? 0

  return (
    <section aria-label="Pipeline" className="rounded-2xl border border-border/70 bg-card/40 px-4 py-6 sm:px-6">
      <ol className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4">
        <span
          aria-hidden
          className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-linear-to-r from-primary/15 via-primary/45 to-primary/15 sm:block"
        />
        <PipelinePulses />
        {STAGES.map((s) => {
          const c = stats?.pipeline[s.id]
          const busy = (c?.active ?? 0) > 0
          return (
            <li key={s.id} className="relative flex flex-col items-center text-center">
              <span className={cn('relative grid size-14 place-items-center rounded-2xl bg-surface ring-1', busy ? 'ring-primary/60' : 'ring-border')}>
                {busy && <span className="absolute inset-0 animate-ping rounded-2xl ring-1 ring-primary/40 motion-reduce:hidden" />}
                <AgentGlyph agent={s.id} active={busy} className="size-8" />
              </span>
              <p className="mt-3 text-sm text-text">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{c ? formatCount(c.processed) : '–'}</p>
              <p className="text-[11px] text-text-muted">{CAPTION[s.id]}</p>
              {s.id === 'gate' && waiting > 0 && (
                <Link
                  to="/approvals"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 py-0.5 pr-2 pl-1 text-[11px] text-warning hover:bg-warning/15"
                >
                  <AgentGlyph agent="analyst" active className="size-4" />
                  {waiting} waiting
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
