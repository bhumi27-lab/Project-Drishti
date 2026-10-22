import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  count?: number
}

/** A row of mutually exclusive choices. Scrolls sideways on narrow screens instead of wrapping. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  return (
    <div className={cn('max-w-full overflow-x-auto', className)}>
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-border bg-surface/60 p-0.5">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-xs whitespace-nowrap transition-colors',
                on ? 'bg-card text-text ring-1 ring-border' : 'text-text-muted hover:text-text',
              )}
            >
              {o.label}
              {o.count !== undefined && <span className="ml-1.5 text-text-muted tabular-nums">{o.count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
