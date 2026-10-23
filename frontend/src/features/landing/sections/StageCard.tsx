import { motion } from 'framer-motion'
import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { cn } from '@/lib/utils'
import { type Route, type Stage, type Tone } from './stages'

const TONE: Record<Tone, string> = { threat: 'text-threat', success: 'text-success', warning: 'text-warning' }

/** One agent. `active` pops it forward with a lime glow; `dim` fades its border, icon, title and example (never the description, which stays pure white). */
export function StageCard({ stage, route, active, dim, className }: { stage: Stage; route: Route; active: boolean; dim: boolean; className?: string }) {
  return (
    <motion.article
      animate={{ scale: active ? 1.035 : 1, y: active ? -6 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={cn(
        'relative flex flex-col rounded-3xl border p-5 backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-500 will-change-transform md:p-6 short:p-5',
        active
          ? 'z-10 bg-card/70 border-primary/80 shadow-[0_0_0_1px_rgb(200_255_61/0.25),0_24px_70px_-24px_rgb(200_255_61/0.45)]'
          : cn('shadow-none', dim ? 'border-sage/20 bg-card/35' : 'border-sage/45 bg-card/70'),
        className,
      )}
    >
      <header className={cn('flex items-center gap-4 transition-opacity duration-500', dim && 'opacity-45')}>
        <span className={cn('grid size-12 shrink-0 place-items-center short:size-10 rounded-2xl bg-surface ring-1 transition-colors duration-500', active ? 'ring-primary/60' : 'ring-sage/45')}>
          <AgentGlyph agent={stage.id} active={active} className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-[0.28em] text-threat">{stage.verb}</p>
          <h3 className="mt-1 truncate font-display text-lg leading-tight font-medium tracking-[-0.01em] text-text uppercase">{stage.name}</h3>
        </div>
      </header>

      <p className="mt-4 text-[15px] leading-relaxed text-[#ffffff] short:mt-3 short:text-sm">{stage.line}</p>

      <div className={cn('mt-auto pt-4 transition-opacity duration-500 short:pt-3', dim && 'opacity-45')}>
        <p className="rounded-xl border border-border/70 bg-bg/60 px-3 py-2 font-mono text-xs leading-relaxed text-text">
          <span aria-hidden className="mr-2 text-text-muted">›</span>
          {stage.example[route].map((s, i) => (
            <span key={i} className={s.tone && TONE[s.tone]}>
              {s.text}
            </span>
          ))}
        </p>
      </div>
    </motion.article>
  )
}
