import { CAR_HALF, DIAL, PLATFORM_X, SWITCH_LEVER, loop, spur, type Pose } from './track'

const CAR_FILL = 'color-mix(in oklab, var(--primary) 14%, var(--card))'
const CAR_STROKE = 'color-mix(in oklab, var(--primary) 40%, var(--border))'
const CAR_LINES = 'color-mix(in oklab, var(--primary-glow) 60%, transparent)'

/** Blend a base colour towards neon rose. Rose only ever means "threat". */
const toThreat = (amount: number, base: string) =>
  `color-mix(in oklab, var(--threat) ${Math.round(amount * 100)}%, ${base})`

const toward = (amount: number, to: string, from: string) =>
  `color-mix(in oklab, ${to} ${Math.round(amount * 100)}%, ${from})`

export function Rails({ thrown }: { thrown: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      {[loop.d, spur.d].map((d, i) => (
        <g key={i}>
          <path d={d} className="stroke-border" strokeWidth={12} />
          <path d={d} className="stroke-text-muted" strokeOpacity={0.22} strokeWidth={12} strokeDasharray="1.5 6" strokeLinecap="butt" />
          <path d={d} className="stroke-primary" strokeWidth={1} strokeOpacity={0.5} />
        </g>
      ))}
      <path d={spur.d} className="stroke-primary-glow" strokeWidth={2} strokeOpacity={thrown * 0.55} />
    </g>
  )
}

interface CarriageProps {
  pose: Pose
  threat?: number
  opacity?: number
  scale?: number
}

export function Carriage({ pose, threat = 0, opacity = 1, scale = 1 }: CarriageProps) {
  return (
    <g
      transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle}) scale(${scale})`}
      opacity={opacity}
      style={threat > 0 ? { filter: `drop-shadow(0 0 ${5 * threat}px var(--threat))` } : undefined}
    >
      <rect
        x={-CAR_HALF}
        y={-7}
        width={CAR_HALF * 2}
        height={14}
        rx={4}
        strokeWidth={1}
        style={{ fill: toThreat(threat * 0.3, CAR_FILL), stroke: toThreat(threat, CAR_STROKE) }}
      />
      {/* two tiny log lines */}
      <path
        d="M-8 -2.5h12M-8 2.5h7"
        strokeWidth={1.5}
        strokeLinecap="round"
        style={{ stroke: toThreat(threat, CAR_LINES) }}
      />
      <circle cx={10.5} cy={0} r={1.3} style={{ fill: toThreat(threat, 'var(--primary-glow)') }} />
    </g>
  )
}

export function Switch({ thrown }: { thrown: number }) {
  const color = toward(thrown, 'var(--primary-glow)', 'var(--text-muted)')
  return (
    <g transform={`translate(${SWITCH_LEVER.x} ${SWITCH_LEVER.y})`}>
      <circle r={2.5} className="fill-border" />
      <g transform={`rotate(${-40 + 80 * thrown})`}>
        <line y2={-9} strokeWidth={2} strokeLinecap="round" style={{ stroke: color }} />
        <circle cy={-9} r={2} style={{ fill: color }} />
      </g>
    </g>
  )
}

/** Confidence Gate: a ring that fills, green when sure, amber when a human is needed. */
export function Dial({ value, human, thrown }: { value: number; human: boolean; thrown: number }) {
  const color = human ? 'var(--warning)' : 'var(--success)'
  return (
    <g>
      <path
        d={`M${DIAL.x - 14} ${DIAL.y - 6} Q${DIAL.x - 30} ${DIAL.y - 24} ${SWITCH_LEVER.x + 4} ${SWITCH_LEVER.y + 4}`}
        fill="none"
        strokeWidth={1}
        strokeDasharray="1 3"
        strokeLinecap="round"
        style={{ stroke: toward(thrown, 'var(--primary-glow)', 'var(--border)') }}
      />
      <g transform={`translate(${DIAL.x} ${DIAL.y})`}>
        <Gauge value={value} color={color} />
      </g>
    </g>
  )
}

interface GaugeProps {
  value: number // 0-1
  color: string
  threshold?: number
  showValue?: boolean
}

/** The Confidence Gate's ring, centred on (0, 0). Also used as an app glyph. */
export function Gauge({ value, color, threshold = 0.8, showValue = true }: GaugeProps) {
  return (
    <g>
      <circle r={21} className="fill-card stroke-border" strokeWidth={1} />
      <circle r={15} fill="none" className="stroke-border" strokeWidth={3} />
      {/* threshold tick */}
      <line y1={-19} y2={-11} transform={`rotate(${threshold * 360})`} className="stroke-text-muted" strokeWidth={1} strokeLinecap="round" />
      <circle
        r={15}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${value} 1`}
        transform="rotate(-90)"
        opacity={value > 0.01 ? 1 : 0}
        style={{ stroke: color }}
      />
      {showValue && (
        <text y={2.8} textAnchor="middle" className="fill-text font-mono" fontSize={8} opacity={value > 0.05 ? 1 : 0}>
          {Math.round(value * 100)}
        </text>
      )}
    </g>
  )
}

export function Platform({ lamp }: { lamp: number }) {
  const lampX = PLATFORM_X + 34
  return (
    <g>
      <rect x={PLATFORM_X - 26} y={267} width={52} height={3} rx={1.5} className="fill-border" />
      <line x1={lampX} y1={282} x2={lampX} y2={270} className="stroke-text-muted" strokeOpacity={0.35} strokeWidth={1.5} />
      <circle cx={lampX} cy={268} r={6} className="fill-warning" opacity={lamp * 0.25} />
      <circle cx={lampX} cy={268} r={2.4} style={{ fill: toward(lamp, 'var(--warning)', 'var(--border)') }} />
    </g>
  )
}

export function Tag({ x, y, opacity, scale }: { x: number; y: number; opacity: number; scale: number }) {
  if (opacity <= 0) return null
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect x={-17} y={-7} width={34} height={13} rx={6.5} className="fill-surface stroke-threat" strokeOpacity={0.5} />
      <text y={2.5} textAnchor="middle" className="fill-threat font-mono" fontSize={7.5}>
        T1110
      </text>
    </g>
  )
}

export function Burst({ x, y, p }: { x: number; y: number; p: number }) {
  return (
    <g opacity={1 - p}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4
        const r = 4 + 16 * p
        return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={1.6 * (1 - p)} className="fill-threat" />
      })}
    </g>
  )
}
