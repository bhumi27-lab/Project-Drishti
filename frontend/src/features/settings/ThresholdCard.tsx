import { useState } from 'react'
import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { ConfidenceRing } from '@/components/agents/ConfidenceRing'
import { Panel } from '@/components/common/Panel'
import { Slider } from '@/components/ui/slider'
import { useUpdateSettings } from './hooks'

const first = (v: number | readonly number[]) => (typeof v === 'number' ? v : v[0])

/** Where the gate splits "Bouncer acts" from "ask a human". Saved when the thumb is released. */
export function ThresholdCard({ value }: { value: number }) {
  const update = useUpdateSettings()
  const [draft, setDraft] = useState(Math.round(value * 100))

  return (
    <Panel title="Confidence threshold" agent="gate" aside="applies to new incidents" className="self-start">
      <div className="flex items-center gap-5">
        <ConfidenceRing value={draft / 100} threshold={draft / 100} showValue={false} className="size-16" />
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-semibold tracking-tight text-text">{draft}%</p>
          <Slider
            min={50}
            max={95}
            step={1}
            value={[draft]}
            onValueChange={(v) => setDraft(first(v))}
            onValueCommitted={(v) => update.mutate({ confidence_threshold: first(v) / 100 })}
            aria-label="Confidence threshold"
            className="mt-3"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <AgentGlyph agent="analyst" className="size-4" /> below: you decide
        </span>
        <span className="inline-flex items-center gap-1.5">
          above: Bouncer acts <AgentGlyph agent="bouncer" className="size-4" />
        </span>
      </div>
    </Panel>
  )
}
