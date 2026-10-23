import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Big uppercase Unbounded heading in acid lime. Wrap one word in <Accent> for the coral serif italic. */
export function Headline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-display text-[clamp(2rem,4.2vw,4rem)] leading-[0.98] font-medium tracking-[-0.03em] text-primary uppercase', className)}>
      {children}
    </h2>
  )
}

export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-serif text-[1.4em] leading-none font-normal tracking-normal text-threat normal-case">{children}</em>
}
