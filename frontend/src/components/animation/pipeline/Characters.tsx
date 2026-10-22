import { useId } from 'react'
import { ANALYST, BIRD_HOME, BUFFER, EYE } from './track'

const lerp = (a: number, b: number, p: number) => a + (b - a) * p

interface EyeProps {
  dx: number
  dy: number
  pupil: number
  blink: number
  lock: number
}

/** Watcher: the eye that keeps watch, on a signal tower in the middle of the loop. */
export function WatcherEye({ dx, dy, pupil, blink, lock }: EyeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { x, y } = EYE
  const almond = `M${x - 32} ${y} Q${x} ${y - 26} ${x + 32} ${y} Q${x} ${y + 26} ${x - 32} ${y} Z`
  const ix = x + dx
  const iy = y + dy

  return (
    <g>
      <defs>
        <radialGradient id={`${uid}g`}>
          <stop offset="0" stopColor="var(--primary)" stopOpacity={0.4} />
          <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}i`}>
          <stop offset="0.3" stopColor="var(--primary-glow)" />
          <stop offset="1" stopColor="var(--primary-deep)" />
        </radialGradient>
        <clipPath id={`${uid}c`}>
          <path d={almond} />
        </clipPath>
      </defs>

      <circle cx={x} cy={y} r={58} fill={`url(#${uid}g)`} opacity={0.55 + 0.45 * lock} />
      <path d={`M${x} ${y + 16}V${y + 66}`} className="stroke-text-muted" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={x} cy={y + 68} rx={11} ry={3} className="fill-border" />

      <g transform={`translate(${x} ${y}) scale(1 ${1 - 0.92 * blink}) translate(${-x} ${-y})`}>
        <path d={almond} className="fill-surface stroke-primary" strokeWidth={1.5} />
        <g clipPath={`url(#${uid}c)`}>
          <circle cx={ix} cy={iy} r={13} fill={`url(#${uid}i)`} />
          {/* iris fibres turn as it focuses */}
          <g transform={`rotate(${lock * 60} ${ix} ${iy})`} className="stroke-primary-deep" strokeWidth={0.8} opacity={0.7}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <line
                  key={i}
                  x1={ix + Math.cos(a) * 7.5}
                  y1={iy + Math.sin(a) * 7.5}
                  x2={ix + Math.cos(a) * 11.5}
                  y2={iy + Math.sin(a) * 11.5}
                />
              )
            })}
          </g>
          <circle cx={ix} cy={iy} r={pupil} className="fill-bg" />
          <circle cx={ix - 4} cy={iy - 4} r={2.2} className="fill-text" opacity={0.9} />
          <circle cx={ix + 3} cy={iy + 3} r={1.1} className="fill-threat" opacity={lock * 0.9} />
        </g>
        <path
          d={`M${x - 14} ${y - 10}l-3 -5M${x} ${y - 13}v-5M${x + 14} ${y - 10}l3 -5`}
          className="stroke-primary"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

interface BirdProps {
  x: number
  y: number
  facing: 1 | -1
  loupe: number
}

/** Detective: a round little bird with a loupe. */
export function Bird({ x, y, facing, loupe }: BirdProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>
      <path d="M-6 -1L-11 -4.5L-10 1.5Z" className="fill-primary" />
      <ellipse rx={7} ry={6} className="fill-primary-glow" />
      <ellipse cx={1.8} cy={1.6} rx={4} ry={3.4} className="fill-text" opacity={0.9} />
      <circle cx={3} cy={-2.4} r={1.3} className="fill-bg" />
      <path d="M6.4 -1.6L9.8 -0.5L6.4 0.8Z" className="fill-text" />
      <path d="M-1.5 5.5v2.5M1.5 5.5v2.5" className="stroke-text-muted" strokeWidth={1} strokeLinecap="round" />
      <g transform={`translate(9 3.5) rotate(${loupe})`}>
        <circle r={3.2} className="fill-primary-glow/20 stroke-text" strokeWidth={1.1} />
        <line x1={2.3} y1={2.3} x2={5} y2={5} className="stroke-text" strokeWidth={1.4} strokeLinecap="round" />
      </g>
    </g>
  )
}

export function Perch() {
  const { x, y } = BIRD_HOME
  return (
    <g className="stroke-text-muted" strokeOpacity={0.35} strokeLinecap="round">
      <line x1={x} y1={y + 8} x2={x} y2={y + 36} strokeWidth={2} />
      <line x1={x - 5} y1={y + 8} x2={x + 5} y2={y + 8} strokeWidth={2} />
    </g>
  )
}

/** Bouncer: a sturdy buffer stop with a stern face and a spring. */
export function Bouncer({ squash, squint }: { squash: number; squint: number }) {
  const w = 7 * (1 - 0.6 * squash) // spring length
  const spring =
    'M10 0' + Array.from({ length: 6 }, (_, i) => `L${10 + (w * (i + 0.5)) / 6} ${i % 2 ? 2.5 : -2.5}`).join('') + `L${10 + w} 0`
  return (
    <g transform={`translate(${BUFFER.x} ${BUFFER.y})`}>
      <circle r={26} className="fill-primary" opacity={squash * 0.2} />
      <path d={spring} fill="none" className="stroke-text-muted" strokeWidth={1.3} strokeLinejoin="round" />
      <rect x={9 + w} y={-6} width={2.5} height={12} rx={1} className="fill-primary-glow" />
      <g transform={`translate(${-1.5 * squash} 0)`}>
        <rect x={-12} y={-15} width={22} height={30} rx={7} className="fill-card stroke-primary" strokeWidth={1.5} />
        <path d="M-7.5 -10.5L-3 -9M5.5 -10.5L1 -9" className="stroke-text" strokeWidth={1.2} strokeLinecap="round" />
        <g className="fill-text" opacity={1 - squint}>
          <circle cx={-5} cy={-5.5} r={1.6} />
          <circle cx={3} cy={-5.5} r={1.6} />
        </g>
        <path
          d="M-6.5 -7l2.5 1.5l-2.5 1.5M4.5 -7l-2.5 1.5l2.5 1.5"
          fill="none"
          className="stroke-text"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={squint}
        />
        <path d="M-1 2.5l5 1.6v3q0 3.6 -5 5.4q-5 -1.8 -5 -5.4v-3Z" className="fill-primary" opacity={0.55} />
      </g>
    </g>
  )
}

/** The human analyst on the platform. Dozes until the gate is unsure. */
export function Analyst({ awake, approve }: { awake: number; approve: number }) {
  const { x, y } = ANALYST
  const body = `color-mix(in oklab, var(--text) ${Math.round(awake * 100)}%, var(--text-muted))`
  return (
    <g>
      <circle cx={x} cy={y - 4} r={15} fill="none" className="stroke-warning" strokeWidth={1} opacity={awake * (1 - approve) * 0.7} />
      <g opacity={0.7 + 0.3 * awake}>
        <rect x={x - 7} y={y - 4} width={14} height={16} rx={6} style={{ fill: body }} />
        <circle cx={x} cy={y - 10} r={5} style={{ fill: body }} />
        <path d={`M${x - 6} ${y - 10}a6 6 0 0 1 12 0`} fill="none" className="stroke-primary" strokeWidth={1.2} />
        <g transform={`rotate(${lerp(25, -150, approve)} ${x + 6} ${y - 1})`}>
          <line x1={x + 6} y1={y - 1} x2={x + 6} y2={y + 8} strokeWidth={3} strokeLinecap="round" style={{ stroke: body }} />
        </g>
      </g>
      <g transform={`translate(${x + 16} ${y - 24}) scale(${0.6 + 0.4 * approve})`} opacity={approve}>
        <circle r={6} className="fill-success/15 stroke-success" strokeWidth={1} />
        <path d="M-2.6 0l1.8 2l3.4 -3.6" fill="none" className="stroke-success" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  )
}
