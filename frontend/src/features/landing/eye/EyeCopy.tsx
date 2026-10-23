import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/** (A) Hero: one centred block, slightly below the middle, where the fibre tips gather. */
export function HeroCopy() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pt-[14vh] text-center">
      <div className="relative flex flex-col items-center">
        {/* soft dark fade so the title reads over the glowing tips (no box) */}
        <div aria-hidden className="absolute -inset-x-[35%] -inset-y-[45%] -z-10 bg-radial from-bg/80 via-bg/45 via-50% to-transparent to-72%" />
        <h1 className="font-display text-[clamp(2.3rem,10.8vw,9rem)] leading-[0.85] font-semibold tracking-[-0.045em] whitespace-nowrap text-[#f4f7f2] uppercase">
          Drishti
        </h1>
        <p className="mt-5 text-lg text-text md:mt-6 md:text-2xl">The AI that fights back.</p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-balance text-text-muted md:max-w-none md:text-base">
          Watches every log. Acts when sure. Asks when not.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-[11px] font-semibold tracking-[0.18em] text-bg uppercase transition-colors hover:bg-primary-light"
          >
            Open dashboard <ArrowUpRight className="size-3.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex h-11 items-center justify-center rounded-full border border-sage px-6 text-[11px] tracking-[0.18em] text-text uppercase transition-colors hover:border-primary"
          >
            How it works
          </a>
        </div>
      </div>
      <motion.span
        aria-hidden
        className="absolute bottom-4 left-1/2 -ml-2 text-text-muted"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowDown className="size-4" />
      </motion.span>
    </div>
  )
}

/** (B) The eye: headline left over the iris edge, counter right, one quiet line bottom-left. */
export function EyeCopy() {
  return (
    <div className="absolute inset-0">
      <h2 className="absolute top-[13%] left-6 font-display text-[clamp(2.1rem,4.4vw,4.4rem)] leading-[0.98] font-medium tracking-[-0.03em] text-primary uppercase md:top-[33%] md:left-[6vw]">
        Learn <em className="font-serif text-[1.12em] font-normal tracking-normal text-threat normal-case">to see</em>
        <br />
        threats
        <br />
        first
      </h2>
      <p className="absolute bottom-10 left-6 hidden max-w-60 text-xs leading-relaxed text-text-muted md:block md:left-[6vw]">
        The Watcher reads every stream at once, and locks onto the one that matters.
      </p>
    </div>
  )
}
