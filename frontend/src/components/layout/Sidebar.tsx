import { Link } from 'react-router-dom'
import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { LogoEye } from '@/components/agents/LogoEye'
import { STAGES } from '@/lib/constants'
import { NavLinks } from './NavLinks'

export function Brand() {
  return (
    <Link to="/" className="flex h-14 items-center gap-2.5 px-5 md:justify-center md:px-0 lg:justify-start lg:px-5">
      <LogoEye />
      <span className="font-medium tracking-tight text-white md:hidden lg:inline">Drishti</span>
    </Link>
  )
}

/** The four agents, on duty. Health comes from /health in Phase 7. */
function AgentRoster() {
  return (
    <div className="m-3 hidden rounded-2xl border border-border/70 bg-card/40 p-3 lg:block">
      <p className="mb-2.5 text-[11px] text-text-muted">Agents online</p>
      <div className="grid grid-cols-4 gap-2">
        {STAGES.map((s) => (
          <span key={s.id} title={s.label} className="relative grid aspect-square place-items-center rounded-xl bg-bg/60 ring-1 ring-border/60">
            <AgentGlyph agent={s.id} className="size-6" />
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-success" />
          </span>
        ))}
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface/70 backdrop-blur md:flex md:w-18 lg:w-60">
      <Brand />
      <nav className="flex-1 px-3 py-4">
        <NavLinks rail />
      </nav>
      <AgentRoster />
    </aside>
  )
}
