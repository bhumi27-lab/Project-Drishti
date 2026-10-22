import { Analyst, Bird, Bouncer, Eye } from '@/components/animation/pipeline/Characters'
import { Gauge } from '@/components/animation/pipeline/Rail'
import { cn } from '@/lib/utils'
import type { AgentId } from '@/types'

export type GlyphAgent = AgentId | 'analyst'

// Square boxes around each character's origin-centred drawing.
const VIEWBOX: Record<GlyphAgent, string> = {
  watcher: '-35 -35 70 70',
  detective: '-14 -14 28 28',
  gate: '-23 -23 46 46',
  bouncer: '-14 -17 34 34',
  analyst: '-17 -21 34 34',
}

interface AgentGlyphProps {
  agent: GlyphAgent
  /** The character's "on it" pose: eye locked, gauge full, bouncer squinting, analyst awake. */
  active?: boolean
  title?: string
  className?: string
}

/** The landing-page characters as small icons, so the app feels like one product. */
export function AgentGlyph({ agent, active = false, title, className }: AgentGlyphProps) {
  return (
    <svg
      viewBox={VIEWBOX[agent]}
      className={cn('size-6 shrink-0 overflow-visible', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {agent === 'watcher' && <Eye pupil={active ? 3.6 : 6} lock={active ? 1 : 0} />}
      {agent === 'detective' && <Bird x={0} y={0} facing={1} loupe={-12} />}
      {agent === 'gate' && <Gauge value={active ? 0.92 : 0.66} color={active ? 'var(--success)' : 'var(--primary)'} showValue={false} />}
      {agent === 'bouncer' && <Bouncer x={0} y={0} squash={0} squint={active ? 1 : 0} />}
      {agent === 'analyst' && <Analyst x={0} y={0} awake={active ? 1 : 0} approve={0} />}
    </svg>
  )
}
