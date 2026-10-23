import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Suspense, lazy, useMemo, useRef } from 'react'
import { EyeCopy, HeroCopy } from './EyeCopy'
import type { Still } from './rig'

const FibreScene = lazy(() => import('./FibreScene'))

function detect() {
  let webgl = false
  try {
    const c = document.createElement('canvas')
    webgl = !!(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    webgl = false
  }
  const low = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
  return { webgl, quality: low ? ('low' as const) : ('high' as const) }
}

// Dev only: ?still=hero|mid|eye freezes the scene and hides the copy (used to render the fallback stills).
const stillParam = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('still') : null
const STILL_AT: Record<string, number> = { hero: 0, mid: 0.42, eye: 1 }
const STILL: Still | undefined = stillParam ? { time: 7.3, progress: STILL_AT[stillParam] ?? (Number(stillParam) || 0) } : undefined

/** Without WebGL, or with reduced motion: the same two screens as still images. */
function StaticHeroEye() {
  return (
    <>
      <section className="relative h-svh overflow-hidden">
        <img src="/landing/hero.webp" alt="" className="absolute inset-0 size-full object-cover" />
        <HeroCopy />
      </section>
      <section className="relative h-svh overflow-hidden">
        <img src="/landing/iris.webp" alt="" className="absolute inset-0 size-full object-contain" />
        <EyeCopy />
      </section>
    </>
  )
}

/**
 * (A) + (B), pinned: glowing fibres (log streams) with beads (events) converge into the
 * Watcher's iris as you scroll; the ring scans and locks onto the coral threat bead.
 */
export function HeroEye() {
  const ref = useRef<HTMLElement>(null)
  // useReducedMotion() can report false before it has read the media query; check it directly so three.js never loads.
  const reduce = useReducedMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const support = useMemo(() => detect(), [])
  const inView = useInView(ref, { margin: '100px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const heroOpacity = useTransform(scrollYProgress, [0.04, 0.16], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -60])
  const heroEvents = useTransform(scrollYProgress, (p) => (p < 0.12 ? 'auto' : 'none'))
  const eyeOpacity = useTransform(scrollYProgress, [0.66, 0.8], [0, 1])
  const eyeX = useTransform(scrollYProgress, [0.66, 0.82], [-40, 0])

  if (reduce || !support.webgl) return <StaticHeroEye />

  return (
    <section ref={ref} className="relative h-[340vh]" aria-label="Drishti">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Suspense fallback={null}>
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
            <FibreScene progress={scrollYProgress} active={inView} quality={support.quality} still={STILL} />
          </motion.div>
        </Suspense>
        {!STILL && (
          <>
            <motion.div className="absolute inset-0" style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }}>
              <HeroCopy />
            </motion.div>
            <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: eyeOpacity, x: eyeX }}>
              <EyeCopy />
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
