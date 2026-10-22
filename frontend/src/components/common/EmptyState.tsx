import type { ReactNode } from 'react'
import { AgentGlyph, type GlyphAgent } from '@/components/agents/AgentGlyph'
import { cn } from '@/lib/utils'

/** A character and a few words instead of a blank panel. */
export function EmptyState({ agent, title, children, className }: { agent: GlyphAgent; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center', className)}>
      <span className="grid size-16 place-items-center rounded-2xl bg-card">
        <AgentGlyph agent={agent} className="size-10" />
      </span>
      <p className="text-sm text-text">{title}</p>
      {children && <div className="text-sm text-text-muted">{children}</div>}
    </div>
  )
}
