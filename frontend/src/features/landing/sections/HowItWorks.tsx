import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { useRef, useState } from 'react'
import { PipelineScene } from '@/components/animation/pipeline/PipelineScene'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { Accent, Headline } from './Headline'
import { StageCard } from './StageCard'
import { STAGES, type Route } from './stages'

const START = 0.6
const END: Record<Route, number> = { auto: 8.3, human: 10.6 } // when the story has played out
const LOOP: Record<Route, number> = { auto: 0, human: 2 } // timeline: every 3rd loop is the human route

function RouteToggle({ route, onChange }: { route: Route; onChange: (r: Route) => void }) {
  const opts: { value: Route; label: string; dot: string }[] = [
    { value: 'auto', label: 'Sure · 92%', dot: 'bg-success' },
    { value: 'human', label: 'Unsure · 64%', dot: 'bg-warning' },
  ]
  return (
    <div role="group" aria-label="Gate confidence" className="inline-flex rounded-full border border-border bg-surface/70 p-1">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={route === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs transition-colors',
            route === o.value ? 'bg-card text-text ring-1 ring-border' : 'text-text-muted hover:text-text',
          )}
        >
          <span className={cn('size-1.5 rounded-full', o.dot)} />
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Heading() {
  return (
    <div className="text-center">
      <Headline className="text-[clamp(2.6rem,7vw,6.5rem)] short:text-[clamp(2.4rem,5vw,4.5rem)]">
        How it <Accent>works</Accent>
      </Headline>
      <p className="mt-4 text-lg text-text-muted md:text-2xl short:mt-2 short:text-xl">Four agents, one watch.</p>
    </div>
  )
}

function StageDots({ current }: { current: number }) {
  return (
    <div className="flex justify-center gap-1.5" aria-hidden>
      {STAGES.map((s, i) => (
        <span key={s.id} className={cn('h-1.5 rounded-full transition-all duration-500', i === current ? 'w-5 bg-primary' : 'w-1.5 bg-border')} />
      ))}
    </div>
  )
}

/** Four agent cards beside the Watching Railway. Scroll scrubs the railway and pops the active card. */
export function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [route, setRoute] = useState<Route>('auto')
  const [p, setP] = useState(0)
  const wide = useMediaQuery('(min-width: 1024px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', setP)

  if (reduce) {
    return (
      <section id="how" className="mx-auto max-w-7xl space-y-12 px-6 py-28 md:px-10">
        <Heading />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <div className="grid gap-4 sm:grid-cols-2">
            {STAGES.map((s) => (
              <StageCard key={s.id} stage={s} route="auto" active={false} dim={false} />
            ))}
          </div>
          <PipelineScene className="mx-auto h-auto w-full max-w-md order-first lg:order-0" />
        </div>
      </section>
    )
  }

  const t = START + Math.min(1, Math.max(0, (p - 0.04) / 0.86)) * (END[route] - START)
  const current = Math.max(0, STAGES.findLastIndex((s) => t >= s.at[route]))
  const scene = <PipelineScene className="h-auto w-full" clock={{ t, loop: LOOP[route] }} />

  return (
    <section id="how" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-5 overflow-hidden px-5 py-6 md:px-10 lg:gap-8 short:gap-4 short:py-3">
        <Heading />

        {wide ? (
          // desktop: 2×2 cards take the larger share, the railway floats beside them
          <div className="mx-auto grid w-full max-w-[84rem] grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-center gap-10">
            <div className="grid grid-cols-2 gap-5 short:gap-4">
              {STAGES.map((s, i) => (
                <StageCard key={s.id} stage={s} route={route} active={i === current} dim={i !== current} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-5">
              <div className="w-full max-w-xl short:max-w-md">{scene}</div>
              <RouteToggle route={route} onChange={setRoute} />
            </div>
          </div>
        ) : (
          // mobile / tablet: small railway on top, the active card below
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
            <div className="w-full max-w-68 sm:max-w-xs">{scene}</div>
            <RouteToggle route={route} onChange={setRoute} />
            <div className="grid w-full pt-1">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="col-start-1 row-start-1"
                >
                  <StageCard stage={STAGES[current]} route={route} active dim={false} />
                </motion.div>
              </AnimatePresence>
            </div>
            <StageDots current={current} />
          </div>
        )}
      </div>
    </section>
  )
}
