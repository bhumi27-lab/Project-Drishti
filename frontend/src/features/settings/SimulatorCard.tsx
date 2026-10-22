import { useMutation } from '@tanstack/react-query'
import { Play } from 'lucide-react'
import { Panel } from '@/components/common/Panel'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/api'
import { SCENARIO_LABEL } from '@/lib/constants'
import type { Settings } from '@/types'
import { useUpdateSettings } from './hooks'

type Scenario = Settings['simulator']['scenario']

/** Log simulator: on/off, which traffic it plays, and a button to run an attack right now. */
export function SimulatorCard({ simulator }: { simulator: Settings['simulator'] }) {
  const update = useUpdateSettings()
  const run = useMutation({ mutationFn: (s: Scenario) => api.injectScenario(s) })
  const set = (patch: Partial<Settings['simulator']>) => update.mutate({ simulator: { ...simulator, ...patch } })

  return (
    <Panel title="Simulator" agent="watcher">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-sm text-text">{simulator.running ? 'Running' : 'Paused'}</span>
        <Switch checked={simulator.running} onCheckedChange={(running) => set({ running })} />
      </label>
      <div className="mt-4">
        <p className="mb-1.5 text-xs text-text-muted">Scenario</p>
        <div className="flex gap-2">
          <Select<Scenario> items={SCENARIO_LABEL} value={simulator.scenario} onValueChange={(scenario) => scenario && set({ scenario })}>
            <SelectTrigger className="h-9 min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-border bg-surface">
              {(Object.keys(SCENARIO_LABEL) as Scenario[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {SCENARIO_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-9 px-3"
            disabled={simulator.scenario === 'normal' || run.isPending}
            onClick={() => run.mutate(simulator.scenario)}
          >
            <Play data-icon="inline-start" /> Run now
          </Button>
        </div>
      </div>
    </Panel>
  )
}
