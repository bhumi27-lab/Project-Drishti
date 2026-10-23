import { useRef } from 'react'
import { Analyst, Bird, Bouncer, Perch, WatcherEye } from './Characters'
import { Burst, Carriage, Dial, Platform, Rails, Switch, Tag } from './Rail'
import { HUMAN_EVERY, LOOP_SECONDS, STILL_FRAME, sceneAt } from './timeline'
import { BUFFER, EYE, VIEWBOX } from './track'
import { useLoopClock, type LoopClock } from './useLoopClock'

/**
 * Hero animation. A toy railway of log carriages watched by an eye:
 * Watcher spots the rogue, Detective rides it, the Gate throws the switch,
 * Bouncer stops it. Every third loop the gate is unsure and a human approves.
 * Pass `clock` to drive it from outside (e.g. scroll) instead of its own loop.
 */
export function PipelineScene({ className, clock }: { className?: string; clock?: LoopClock }) {
  const ref = useRef<SVGSVGElement>(null)
  const own = useLoopClock(ref, LOOP_SECONDS, STILL_FRAME, !!clock)
  const { t, loop } = clock ?? own
  const s = sceneAt(t, loop % HUMAN_EVERY === HUMAN_EVERY - 1)

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      role="img"
      aria-label="Log carriages circle a track. An eye spots a threat, a bird investigates, a dial decides, and a guard stops it."
      className={className}
    >
      <Rails thrown={s.switchThrown} />
      <Platform lamp={s.lamp} />
      <Dial value={s.dial.value} human={s.dial.human} thrown={s.switchThrown} />
      <Switch thrown={s.switchThrown} />

      <WatcherEye {...s.eye} />
      <line
        x1={EYE.x}
        y1={EYE.y}
        x2={s.sight.x}
        y2={s.sight.y}
        className="stroke-primary-light"
        strokeWidth={1}
        strokeDasharray="2 4"
        strokeLinecap="round"
        opacity={s.sight.opacity}
      />

      {s.ambient.map((pose, i) => (
        <Carriage key={i} pose={pose} />
      ))}
      {s.fresh && <Carriage pose={s.fresh.pose} opacity={s.fresh.opacity} />}
      {s.rogue && <Carriage {...s.rogue} />}
      {s.burst && <Burst {...s.burst} />}
      {s.impact !== null && (
        <circle
          cx={BUFFER.contactX}
          cy={BUFFER.y}
          r={4 + 12 * s.impact}
          fill="none"
          className="stroke-threat"
          strokeWidth={1.5}
          opacity={(1 - s.impact) * 0.8}
        />
      )}

      <Bouncer {...s.bouncer} />
      <Analyst {...s.analyst} />
      <Perch />
      <Bird {...s.bird} />
      <Tag {...s.tag} />
    </svg>
  )
}
