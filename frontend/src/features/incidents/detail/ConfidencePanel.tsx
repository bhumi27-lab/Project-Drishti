import { Meter } from '@/components/common/Meter'
import { Panel } from '@/components/common/Panel'
import { useSettings } from '@/features/settings/hooks'
import { CONFIDENCE_WEIGHTS } from '@/lib/confidence'
import { CONFIDENCE_THRESHOLD } from '@/lib/constants'
import { formatPct } from '@/lib/format'
import { FACTOR_LABEL } from '@/lib/incident'
import type { ConfidenceBreakdown, Decision } from '@/types'

const FACTORS = Object.keys(CONFIDENCE_WEIGHTS) as (keyof ConfidenceBreakdown)[]

/** Which evidence moved the gate, and by how much (weight × value). */
export function ConfidencePanel({ breakdown, confidence, decision }: { breakdown: ConfidenceBreakdown; confidence: number; decision: Decision | null }) {
  const threshold = useSettings().data?.confidence_threshold ?? CONFIDENCE_THRESHOLD
  // Colour by what the gate decided at the time, not by today's threshold.
  const auto = decision ? decision === 'auto' : confidence >= threshold
  return (
    <Panel title="Confidence" agent="gate" aside={`threshold ${formatPct(threshold)}`}>
      <ul className="space-y-3">
        {FACTORS.map((f) => (
          <li key={f} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm">
            <span className="text-text">
              {FACTOR_LABEL[f]} <span className="text-xs text-text-muted">×{CONFIDENCE_WEIGHTS[f]}</span>
            </span>
            <span className="text-xs text-text-muted tabular-nums">+{(CONFIDENCE_WEIGHTS[f] * breakdown[f]).toFixed(2)}</span>
            <Meter value={breakdown[f]} className="col-span-2" />
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-border/60 pt-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-text">Total</span>
          <span className={auto ? 'font-medium text-success' : 'font-medium text-warning'}>{formatPct(confidence)}</span>
        </div>
        <Meter value={confidence} mark={threshold} />
      </div>
    </Panel>
  )
}
