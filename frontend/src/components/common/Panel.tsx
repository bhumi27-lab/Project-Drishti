import type { ReactNode } from 'react'
import { AgentGlyph, type GlyphAgent } from '@/components/agents/AgentGlyph'
import { cn } from '@/lib/utils'

/** A titled card. The optional character says which agent the section belongs to. */
export function Panel({
  title,
  agent,
  aside,
  children,
  className,
}: {
  title: string
  agent?: GlyphAgent
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-border/70 bg-card/40 p-5', className)}>
      <header className="mb-4 flex items-center gap-2.5">
        {agent && <AgentGlyph agent={agent} className="size-5" />}
        <h2 className="text-sm font-medium text-text">{title}</h2>
        {aside && <div className="ml-auto text-xs text-text-muted">{aside}</div>}
      </header>
      {children}
    </section>
  )
}
