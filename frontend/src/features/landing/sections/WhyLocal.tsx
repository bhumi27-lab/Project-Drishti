import { motion } from 'framer-motion'
import { Lock, Server, SlidersHorizontal, Wallet, type LucideIcon } from 'lucide-react'
import { Accent, Headline } from './Headline'
import { RoomDiagram } from './RoomDiagram'

const POINTS: { icon: LucideIcon; title: string; line: string }[] = [
  { icon: Lock, title: 'Privacy', line: 'Logs, alerts and verdicts stay on your machines. Nothing goes to an outside AI service.' },
  { icon: SlidersHorizontal, title: 'Control', line: 'You own the model, the threshold and the rules, and can change them from Settings.' },
  { icon: Server, title: 'On-prem', line: 'Runs beside your servers with Docker Compose: PostgreSQL, ChromaDB and Ollama.' },
  { icon: Wallet, title: 'Cost', line: 'No per-token API bills or usage caps. Llama 3.2 3B runs on everyday hardware.' },
]

/** Why it runs locally: the network as a room with everything inside it, then four points. */
export function WhyLocal() {
  return (
    <section id="local" className="relative mx-auto max-w-6xl px-6 py-28 md:px-10">
      <div className="text-center">
        <Headline>
          Nothing <Accent>leaves</Accent> the room
        </Headline>
        <p className="mt-4 text-sm text-text-muted md:text-base">Your logs, your models, your network.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mt-14 md:mt-16"
      >
        <RoomDiagram />
      </motion.div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ icon: Icon, title, line }, i) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            className="rounded-3xl border border-sage/40 bg-card/60 p-6 transition-colors hover:border-primary/40"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-sage/15 ring-1 ring-sage/50">
              <Icon className="size-5 text-primary" strokeWidth={1.75} />
            </span>
            <h3 className="mt-5 font-display text-sm font-medium tracking-[0.08em] text-text uppercase">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{line}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
