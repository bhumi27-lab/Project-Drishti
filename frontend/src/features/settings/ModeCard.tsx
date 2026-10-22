import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Panel } from '@/components/common/Panel'
import { Segmented } from '@/components/common/Segmented'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { USE_MOCKS } from '@/lib/constants'
import type { MitigationMode } from '@/types'
import { useUpdateSettings } from './hooks'

/** Simulated by default. Going real needs an explicit confirmation (CLAUDE.md safety rule). */
export function ModeCard({ mode }: { mode: MitigationMode }) {
  const update = useUpdateSettings()
  const [confirming, setConfirming] = useState(false)

  return (
    <Panel title="Mitigation" agent="bouncer">
      <Segmented<MitigationMode>
        label="Mitigation mode"
        value={mode}
        onChange={(m) => (m === 'real' ? setConfirming(true) : update.mutate({ mitigation_mode: 'simulated' }))}
        options={[
          { value: 'simulated', label: 'Simulated' },
          { value: 'real', label: 'Real' },
        ]}
      />
      <p className={mode === 'real' ? 'mt-3 flex items-center gap-1.5 text-xs text-warning' : 'mt-3 text-xs text-text-muted'}>
        {mode === 'real' && <TriangleAlert className="size-3.5" />}
        {mode === 'real' ? 'Blocks change the host firewall.' : 'Blocks are recorded. Nothing real is touched.'}
      </p>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="border border-border bg-surface">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-4 text-warning" /> Use the real firewall?
            </DialogTitle>
            <DialogDescription>
              The Bouncer will change host firewall rules. Localhost, the gateway and allowlisted IPs are never blocked.
              {USE_MOCKS && ' (Mock mode: still nothing real is touched.)'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-border bg-card/50">
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Stay simulated
            </Button>
            <Button
              className="bg-warning text-bg hover:bg-warning/85"
              onClick={() => {
                update.mutate({ mitigation_mode: 'real' })
                setConfirming(false)
              }}
            >
              Switch to real
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  )
}
