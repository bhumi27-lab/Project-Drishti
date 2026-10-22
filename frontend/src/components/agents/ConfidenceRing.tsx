import { Gauge } from '@/components/animation/pipeline/Rail'
import { useSettings } from '@/features/settings/hooks'
import { CONFIDENCE_THRESHOLD } from '@/lib/constants'
import { DECISION_COLOR } from '@/lib/incident'
import { cn } from '@/lib/utils'
import type { Decision } from '@/types'

interface ConfidenceRingProps {
  value: number // 0-1
  /** Colour by what the gate actually decided (green auto, amber human). Without it, compare to the threshold. */
  decision?: Decision | null
  threshold?: number
  showValue?: boolean
  className?: string
}

/** The Confidence Gate's ring. The tick marks the current threshold. */
export function ConfidenceRing({ value, decision, threshold, showValue = true, className }: ConfidenceRingProps) {
  const current = useSettings().data?.confidence_threshold ?? CONFIDENCE_THRESHOLD
  const tick = threshold ?? current
  const color = decision ? DECISION_COLOR[decision] : value >= tick ? DECISION_COLOR.auto : DECISION_COLOR.human
  return (
    <svg viewBox="-22 -22 44 44" className={cn('size-10 shrink-0', className)} role="img" aria-label={`Confidence ${Math.round(value * 100)}%`}>
      <Gauge value={value} color={color} threshold={tick} showValue={showValue} />
    </svg>
  )
}
