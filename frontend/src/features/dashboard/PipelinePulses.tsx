import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useLiveEvent } from '@/lib/live'
import type { Stage } from '@/types'

// Column centres of the 4-column strip. The analyst sits under the gate.
const COLUMN: Record<Stage, number | null> = { watcher: 0, detective: 1, gate: 2, bouncer: 3, human: 2, closed: null }
const left = (col: number) => `${12.5 + col * 25}%`

interface Pulse {
  key: string
  from: number
  to: number
}

/**
 * A coral dot (the threat, like the hero's carriage) travels along the strip on every stage change,
 * backwards too, when the Detective asks the Watcher for context.
 */
export function PipelinePulses() {
  const reduce = useReducedMotion()
  const [pulses, setPulses] = useState<Pulse[]>([])

  useLiveEvent((e) => {
    if (e.type !== 'stage_change') return
    const to = COLUMN[e.data.to]
    if (to === null) return
    const from = e.data.from ? (COLUMN[e.data.from] ?? to) : to
    const key = `${e.data.incident.id}:${e.data.to}:${performance.now()}`
    setPulses((p) => [...p, { key, from, to }])
    window.setTimeout(() => setPulses((p) => p.filter((x) => x.key !== key)), 1200)
  }, !reduce)

  return (
    <>
      {pulses.map((p) => (
        <motion.span
          key={p.key}
          aria-hidden
          className="pointer-events-none absolute top-7 z-10 -mt-[5px] -ml-[5px] hidden size-2.5 rounded-full bg-threat shadow-[0_0_12px_var(--threat)] sm:block"
          initial={{ left: left(p.from), opacity: 0, scale: 0.4 }}
          animate={{ left: left(p.to), opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.6] }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}
