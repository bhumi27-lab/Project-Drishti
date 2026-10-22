import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IncidentRow } from '@/features/incidents/IncidentRow'
import { useNow } from '@/hooks/useNow'
import type { Incident } from '@/types'

export function IncidentFeed({ incidents }: { incidents?: Incident[] }) {
  const now = useNow()

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
      <header className="flex items-center justify-between px-5 py-4">
        <h2 className="text-sm font-medium text-text">Latest incidents</h2>
        <Link to="/investigations" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
          All <ArrowRight className="size-3.5" />
        </Link>
      </header>

      {!incidents ? (
        <div className="space-y-px">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="mx-5 my-3 h-9 animate-pulse rounded-lg bg-card/60" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {/* new incidents slide in at the top; the first render doesn't animate */}
          <AnimatePresence initial={false}>
            {incidents.map((i) => (
              <motion.li
                key={i.id}
                layout
                initial={{ opacity: 0, backgroundColor: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
                animate={{ opacity: 1, backgroundColor: 'color-mix(in oklab, var(--primary) 0%, transparent)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <IncidentRow incident={i} now={now} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
