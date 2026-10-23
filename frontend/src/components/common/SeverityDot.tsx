import { cn } from '@/lib/utils'
import type { Severity } from '@/types'

// Rose only for real threats (high/critical). Medium is deep lime so amber stays "needs approval".
const TONE: Record<Severity, string> = {
  critical: 'bg-threat shadow-[0_0_8px_var(--threat)]',
  high: 'bg-threat',
  medium: 'bg-primary-deep',
  low: 'bg-text-muted/60',
}

export function SeverityDot({ severity, className }: { severity: Severity; className?: string }) {
  return <span role="img" aria-label={severity} title={severity} className={cn('inline-block size-2 shrink-0 rounded-full', TONE[severity], className)} />
}
