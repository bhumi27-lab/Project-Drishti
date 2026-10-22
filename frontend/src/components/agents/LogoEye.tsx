import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Eye } from '@/components/animation/pipeline/Characters'
import { cn } from '@/lib/utils'

/** Brand mark: the Watcher's eye. Follows the pointer and blinks now and then. */
export function LogoEye({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const reduce = useReducedMotion()
  const [look, setLook] = useState({ dx: 0, dy: 0 })
  const [blink, setBlink] = useState(0)

  useEffect(() => {
    if (reduce) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        const vx = e.clientX - (r.left + r.width / 2)
        const vy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(vx, vy) || 1
        const reach = Math.min(d / 320, 1)
        setLook({ dx: (vx / d) * reach * 9, dy: (vy / d) * reach * 5 })
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    let timer = 0
    let raf = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        const start = performance.now()
        const step = (now: number) => {
          const p = Math.min((now - start) / 220, 1)
          setBlink(Math.sin(Math.PI * p))
          if (p < 1) raf = requestAnimationFrame(step)
          else schedule()
        }
        raf = requestAnimationFrame(step)
      }, 4000 + Math.random() * 3000)
    }
    schedule()
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [reduce])

  return (
    <svg ref={ref} viewBox="-35 -22 70 44" className={cn('h-5 w-8 shrink-0 overflow-visible', className)} aria-hidden>
      <Eye dx={look.dx} dy={look.dy} blink={blink} />
    </svg>
  )
}
