import { Eye, Gauge, Search, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoEye } from '@/components/agents/LogoEye'
import { Hero } from '@/features/landing/Hero'

// The four scroll sections replace the #how strip later in Phase 1.
const stages = [
  { icon: Eye, name: 'Watcher', verb: 'SEE' },
  { icon: Search, name: 'Detective', verb: 'UNDERSTAND' },
  { icon: Gauge, name: 'Gate', verb: 'DECIDE' },
  { icon: Shield, name: 'Bouncer', verb: 'DEFEND' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5 font-medium text-text">
          <LogoEye />
          Drishti
        </Link>
        <Link to="/dashboard" className="text-sm text-text-muted transition-colors hover:text-text">
          Dashboard
        </Link>
      </header>

      <main>
        <Hero />
        <section id="how" className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-6 pb-24 sm:grid-cols-4">
          {stages.map(({ icon: Icon, name, verb }) => (
            <div key={name} className="rounded-2xl border border-border/70 bg-card/40 p-4">
              <Icon className="size-5 text-primary-glow" />
              <p className="mt-3 text-sm text-text">{name}</p>
              <p className="font-mono text-[11px] tracking-widest text-text-muted">{verb}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
