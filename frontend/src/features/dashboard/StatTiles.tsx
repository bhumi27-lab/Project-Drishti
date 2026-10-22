import { ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AgentGlyph, type GlyphAgent } from '@/components/agents/AgentGlyph'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Stats } from '@/types'

interface Tile {
  label: string
  value: number
  to: string
  agent?: GlyphAgent
  active?: boolean
  warn?: boolean
}

export function StatTiles({ stats }: { stats?: Stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[6.5rem] animate-pulse rounded-2xl bg-card/60" />
        ))}
      </div>
    )
  }

  const waiting = stats.awaiting_approval
  const tiles: Tile[] = [
    { label: 'Logs processed', value: stats.logs_processed, to: '/logs' },
    { label: 'Threats detected', value: stats.threats_detected, to: '/investigations', agent: 'watcher', active: true },
    { label: 'Auto-blocked', value: stats.auto_blocked, to: '/investigations?status=blocked', agent: 'bouncer' },
    { label: 'Awaiting approval', value: waiting, to: '/approvals', agent: 'analyst', active: waiting > 0, warn: waiting > 0 },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <Link
          key={t.label}
          to={t.to}
          className={cn(
            'group rounded-2xl border bg-card/40 p-4 transition-colors hover:bg-card/70',
            t.warn ? 'border-warning/30' : 'border-border/70 hover:border-border',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-text-muted">{t.label}</span>
            <span className="grid size-8 place-items-center rounded-lg bg-surface">
              {t.agent ? <AgentGlyph agent={t.agent} active={t.active} className="size-5" /> : <ScrollText className="size-4 text-text-muted" />}
            </span>
          </div>
          <p className={cn('mt-2 text-3xl font-semibold tracking-tight', t.warn ? 'text-warning' : 'text-text')}>{formatCount(t.value)}</p>
        </Link>
      ))}
    </div>
  )
}
