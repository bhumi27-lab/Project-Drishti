import { RotateCcw } from 'lucide-react'
import { Fragment } from 'react'
import { AgentGlyph, type GlyphAgent } from '@/components/agents/AgentGlyph'
import { elapsed, formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { IncidentDetail } from '@/types'

type StepState = 'done' | 'current' | 'upcoming' | 'skipped'
interface Step {
  agent: GlyphAgent
  label: string
  state: StepState
  at?: string
  note?: string
}

function stepsOf(i: IncidentDetail): Step[] {
  const at = (actor: string, event: string) => i.audit.find((a) => a.actor === actor && a.event === event)?.created_at
  const steps: Step[] = [
    { agent: 'watcher', label: 'Watcher', state: 'done', at: at('watcher', 'alert_raised') },
    { agent: 'detective', label: 'Detective', state: i.verdict ? 'done' : 'current', at: at('detective', 'verdict') },
    {
      agent: 'gate',
      label: 'Gate',
      state: i.decision ? 'done' : 'upcoming',
      at: at('gate', 'decision'),
      note: i.confidence !== null ? formatPct(i.confidence) : undefined,
    },
  ]
  if (i.decision === 'human') {
    const a = i.approvals[0]
    steps.push({ agent: 'analyst', label: 'Analyst', state: a ? 'done' : 'current', at: a?.created_at, note: a ? `${a.analyst} · ${a.decision}` : 'waiting' })
  }
  if (i.decision === 'dismiss') {
    steps[2].note = `${steps[2].note} · dismissed`
  } else {
    const act = i.actions[0]
    const stopped = i.status === 'rejected' || i.status === 'escalated'
    steps.push({ agent: 'bouncer', label: 'Bouncer', state: act ? 'done' : stopped ? 'skipped' : 'upcoming', at: act?.created_at })
  }
  return steps
}

/** Watcher → Detective → Gate → (Analyst) → Bouncer, with time since the alert. */
export function StageTimeline({ incident }: { incident: IncidentDetail }) {
  const steps = stepsOf(incident)
  const start = steps[0].at ?? incident.created_at
  const loops = incident.context_requests.length

  return (
    <section aria-label="Stages" className="overflow-x-auto rounded-2xl border border-border/70 bg-card/40 px-5 py-5">
      <ol className="flex min-w-max items-start">
        {steps.map((s, k) => (
          <Fragment key={s.agent}>
            {k > 0 && (
              <li aria-hidden className="relative mt-6 h-px w-4 flex-1 bg-border sm:w-16">
                {s.agent === 'detective' && loops > 0 && (
                  <span
                    className="absolute -top-7 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 text-[11px] whitespace-nowrap text-primary"
                    title="Detective asked Watcher for more context"
                  >
                    <RotateCcw className="size-3" /> {loops}
                  </span>
                )}
              </li>
            )}
            <li className={cn('flex w-18 flex-col items-center text-center sm:w-24', s.state === 'skipped' && 'opacity-35')}>
              <span
                className={cn(
                  'relative grid size-12 place-items-center rounded-2xl bg-surface ring-1',
                  s.state === 'current' ? 'ring-warning/60' : s.state === 'done' ? 'ring-primary/50' : 'ring-border',
                )}
              >
                {s.state === 'current' && <span className="absolute inset-0 animate-ping rounded-2xl ring-1 ring-warning/40 motion-reduce:hidden" />}
                <AgentGlyph agent={s.agent} active={s.state === 'current'} className={cn('size-7', s.state === 'upcoming' && 'opacity-40')} />
              </span>
              <span className="mt-2 text-xs text-text">{s.label}</span>
              <span className="text-[11px] text-text-muted tabular-nums">{s.at ? elapsed(start, s.at) : s.state === 'skipped' ? 'skipped' : '·'}</span>
              {s.note && <span className="mt-0.5 text-[11px] text-text-muted">{s.note}</span>}
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  )
}
