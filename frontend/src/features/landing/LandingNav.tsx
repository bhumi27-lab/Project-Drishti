import { useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoEye } from '@/components/agents/LogoEye'
import { cn } from '@/lib/utils'

/** Slim top bar: brand left, one Dashboard pill right. Transparent over the hero, solid once past it. */
export function LandingNav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  // The hero copy has faded out by ~0.4 viewport heights into the pinned hero/eye section.
  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > window.innerHeight * 0.6))

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 border-b transition-colors duration-300',
        solid ? 'border-border bg-bg/90' : 'border-transparent bg-transparent',
      )}
    >
      <div className="flex h-14 items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoEye />
          <span className="font-display text-sm font-medium tracking-wide text-white uppercase">Drishti</span>
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex h-8 items-center gap-1 rounded-full border border-sage px-3.5 text-xs text-text transition-colors hover:border-primary hover:text-primary"
        >
          Dashboard <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </header>
  )
}
