import { Menu, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useSettings } from '@/features/settings/hooks'
import { useLiveStatus } from '@/lib/live'
import { cn } from '@/lib/utils'
import type { MitigationMode } from '@/types'
import { NavLinks } from './NavLinks'
import { Brand } from './Sidebar'
import { usePageTitle } from './usePageTitle'

function ModeChip({ mode }: { mode: MitigationMode }) {
  const real = mode === 'real'
  const Icon = real ? TriangleAlert : ShieldCheck
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
        real ? 'border-warning/30 bg-warning/10 text-warning' : 'border-border bg-card text-text-muted',
      )}
      title={real ? 'Mitigation touches the real firewall' : 'Mitigation is simulated'}
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{real ? 'Real' : 'Simulated'}</span>
    </span>
  )
}

function LiveIndicator({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-text-muted">
      <span className="relative flex size-2">
        {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />}
        <span className={cn('relative size-2 rounded-full', live ? 'bg-success' : 'bg-text-muted/50')} />
      </span>
      {live ? 'Live' : 'Paused'}
    </span>
  )
}

export function Topbar() {
  const title = usePageTitle()
  const { data: settings } = useSettings()
  const connected = useLiveStatus()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/70 px-4 backdrop-blur md:px-8">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2 md:hidden" aria-label="Open menu" />}>
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 gap-0 border-border bg-surface p-0 outline-none">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <nav className="px-3 py-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="truncate text-[15px] font-medium tracking-tight text-text">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {settings && <ModeChip mode={settings.mitigation_mode} />}
        <LiveIndicator live={connected && (settings?.simulator.running ?? false)} />
      </div>
    </header>
  )
}
