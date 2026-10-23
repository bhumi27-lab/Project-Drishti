import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoEye } from '@/components/agents/LogoEye'
import { Accent, Headline } from './Headline'

/** Last call to action, then the footer. */
export function FooterCta() {
  return (
    <>
      <section className="relative overflow-hidden px-6 py-32 text-center md:py-44">
        <span aria-hidden className="absolute inset-x-0 top-1/2 mx-auto h-112 max-w-3xl -translate-y-1/2 rounded-full bg-radial from-primary/15 to-transparent to-70%" />
        <div className="relative">
          <Headline className="text-[clamp(2.5rem,7vw,6.5rem)]">
            Ready <Accent>to</Accent> watch?
          </Headline>
          <Link
            to="/dashboard"
            className="mt-10 inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-6 text-[11px] font-semibold tracking-[0.18em] text-bg uppercase transition-colors hover:bg-primary-light"
          >
            Open dashboard <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <LogoEye />
            <span className="font-display text-sm font-medium tracking-wide text-white uppercase">Drishti</span>
          </div>
          <p className="font-mono text-xs text-text-muted">BE Information Technology · SPPU · 2026–27</p>
        </div>
      </footer>
    </>
  )
}
