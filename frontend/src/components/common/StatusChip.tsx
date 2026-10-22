import { cn } from '@/lib/utils'
import type { IncidentStatus, Stage } from '@/types'

const TONE = {
  threat: 'border-threat/25 bg-threat/10 text-threat',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  primary: 'border-primary/25 bg-primary/10 text-primary-glow',
  muted: 'border-border bg-card text-text-muted',
}

const STATUS: Record<Exclude<IncidentStatus, 'open'>, { label: string; tone: keyof typeof TONE }> = {
  blocked: { label: 'Blocked', tone: 'threat' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'muted' },
  escalated: { label: 'Escalated', tone: 'primary' },
  dismissed: { label: 'Dismissed', tone: 'muted' },
}

/** Incident status. An open incident reads "Needs you" at the human stage, else "Investigating". */
export function StatusChip({ status, stage, className }: { status: IncidentStatus; stage?: Stage; className?: string }) {
  const { label, tone } =
    status === 'open'
      ? stage === 'human'
        ? { label: 'Needs you', tone: 'warning' as const }
        : { label: 'Investigating', tone: 'primary' as const }
      : STATUS[status]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap', TONE[tone], className)}>
      {label}
    </span>
  )
}
