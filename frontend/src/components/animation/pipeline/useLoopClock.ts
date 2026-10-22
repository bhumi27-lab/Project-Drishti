import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion'
import { useState, type RefObject } from 'react'

export interface LoopClock {
  t: number
  loop: number
}

// Dev only: freeze a frame with ?t=6.3 (add &loop=2 for the human route).
const debug = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null
const debugT = debug?.get('t')
const frozen: LoopClock | null =
  debugT != null ? { t: Number(debugT), loop: Number(debug?.get('loop') ?? 0) } : null

/** Seconds into the current loop, plus how many loops have played. Pauses off-screen. */
export function useLoopClock(ref: RefObject<Element | null>, period: number, still: number): LoopClock {
  const reduce = useReducedMotion()
  const inView = useInView(ref)
  const [clock, setClock] = useState<LoopClock>({ t: 0, loop: 0 })

  useAnimationFrame((ms) => {
    if (reduce || frozen || !inView) return
    const s = ms / 1000
    setClock({ t: s % period, loop: Math.floor(s / period) })
  })

  if (frozen) return { t: frozen.t % period, loop: frozen.loop }
  return reduce ? { t: still, loop: 0 } : clock
}
