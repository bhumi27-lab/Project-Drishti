import { cn } from '@/lib/utils'

/** A thin 0-1 bar. The track is a light step of the fill's own hue; `mark` draws a tick (e.g. the threshold). */
export function Meter({ value, mark, className }: { value: number; mark?: number; className?: string }) {
  return (
    <span className={cn('relative block h-1.5 w-full rounded-full bg-primary/15', className)}>
      <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
      {mark !== undefined && <span className="absolute -inset-y-1 w-px bg-text-muted" style={{ left: `${mark * 100}%` }} />}
    </span>
  )
}
