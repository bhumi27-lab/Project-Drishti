// Confidence Gate formula (docs/PROJECT_PLAN.md 7.4). Shared by mocks and UI.
import type { ConfidenceBreakdown, Decision } from '@/types'
import { DISMISS_BELOW } from './constants'

export const CONFIDENCE_WEIGHTS: ConfidenceBreakdown = {
  anomaly: 0.3,
  mitre: 0.3,
  llm: 0.3,
  history: 0.1,
}

export function confidenceOf(b: ConfidenceBreakdown): number {
  return (Object.keys(CONFIDENCE_WEIGHTS) as (keyof ConfidenceBreakdown)[]).reduce(
    (sum, k) => sum + CONFIDENCE_WEIGHTS[k] * b[k],
    0,
  )
}

export function routeOf(confidence: number, isMalicious: boolean, threshold: number): Decision {
  if (isMalicious && confidence >= threshold) return 'auto'
  if (!isMalicious && confidence < DISMISS_BELOW) return 'dismiss'
  return 'human'
}
