import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PipelineScene } from '@/components/animation/pipeline/PipelineScene'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: 'easeOut' as const } }),
}

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1fr_1.2fr] lg:pt-16">
      <div className="text-center lg:text-left">
        <motion.p variants={rise} initial="hidden" animate="show" custom={0} className="text-sm text-primary-glow">
          <span lang="hi">दृष्टि</span>
          <span className="ml-2 font-mono text-xs tracking-[0.25em] text-text-muted">· SIGHT</span>
        </motion.p>
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-4 text-6xl font-semibold tracking-tight text-text sm:text-7xl"
        >
          Drishti
        </motion.h1>
        <motion.p variants={rise} initial="hidden" animate="show" custom={2} className="mt-4 text-xl text-text">
          The AI that fights back.
        </motion.p>
        <motion.p variants={rise} initial="hidden" animate="show" custom={3} className="mt-2 text-balance text-text-muted">
          Watches every log. Acts when sure. Asks when not.
        </motion.p>
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
        >
          <Link to="/dashboard" className={cn(buttonVariants({ size: 'lg' }), 'h-10 px-4')}>
            Open Dashboard
            <ArrowRight data-icon="inline-end" />
          </Link>
          <a href="#how" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')}>
            How it works
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative"
      >
        <div aria-hidden className="absolute inset-8 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative rounded-3xl border border-border/70 bg-card/50 p-3 shadow-glow backdrop-blur-sm sm:p-5">
          <PipelineScene className="h-auto w-full" />
        </div>
      </motion.div>
    </section>
  )
}
