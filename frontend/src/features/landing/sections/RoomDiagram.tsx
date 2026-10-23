import { useInView, useReducedMotion } from 'framer-motion'
import { Boxes, Cpu, Database, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Eye } from '@/components/animation/pipeline/Characters'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type Pt = { x: number; y: number }
interface Layout {
  w: number
  h: number
  room: { x: number; y: number; w: number; h: number }
  label: Pt
  sources: Pt[]
  core: Pt & { r: number }
  nodes: Pt[]
  nodeW: number
  cloud: Pt
  /** Blocked route out of the room: from the room edge to the cloud. */
  exit: [Pt, Pt]
}

// Wide: logs → Drishti → services left to right, cloud outside on the right. Tall: the same, top to bottom.
const WIDE: Layout = {
  w: 960, h: 420,
  room: { x: 8, y: 30, w: 744, h: 380 },
  label: { x: 40, y: 68 },
  sources: [{ x: 120, y: 140 }, { x: 120, y: 220 }, { x: 120, y: 300 }],
  core: { x: 380, y: 220, r: 62 },
  nodes: [{ x: 620, y: 112 }, { x: 620, y: 220 }, { x: 620, y: 328 }],
  nodeW: 112,
  cloud: { x: 868, y: 150 },
  exit: [{ x: 752, y: 150 }, { x: 812, y: 150 }],
}
const TALL: Layout = {
  w: 360, h: 640,
  room: { x: 6, y: 150, w: 348, h: 484 },
  label: { x: 28, y: 184 },
  sources: [{ x: 66, y: 238 }, { x: 180, y: 238 }, { x: 294, y: 238 }],
  core: { x: 180, y: 380, r: 54 },
  nodes: [{ x: 64, y: 548 }, { x: 180, y: 548 }, { x: 296, y: 548 }],
  nodeW: 104,
  cloud: { x: 180, y: 42 },
  exit: [{ x: 180, y: 150 }, { x: 180, y: 108 }],
}

const SOURCES = ['ssh', 'web', 'firewall']
const NODES: { icon: LucideIcon; name: string; sub: string }[] = [
  { icon: Cpu, name: 'Ollama', sub: 'Llama 3.2 3B' },
  { icon: Database, name: 'PostgreSQL', sub: 'logs · history' },
  { icon: Boxes, name: 'ChromaDB', sub: 'MITRE ATT&CK' },
]
const NODE_H = 84

/** Smooth link between two points, bending along the layout's main axis. */
function link(a: Pt, b: Pt, wide: boolean) {
  const m = wide ? { x: (a.x + b.x) / 2, y: a.y } : { x: a.x, y: (a.y + b.y) / 2 }
  const n = wide ? { x: (a.x + b.x) / 2, y: b.y } : { x: b.x, y: (a.y + b.y) / 2 }
  return `M${a.x} ${a.y}C${m.x} ${m.y} ${n.x} ${n.y} ${b.x} ${b.y}`
}

function Bead({ d, dur, begin, threat = false }: { d: string; dur: number; begin: number; threat?: boolean }) {
  return (
    <circle r={3} className={threat ? 'fill-threat' : 'fill-primary-light'}>
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={d} />
    </circle>
  )
}

/** Your network as a room: logs flow in to Drishti and its local services; the cloud stays outside. */
export function RoomDiagram() {
  const ref = useRef<SVGSVGElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref)
  const wide = useMediaQuery('(min-width: 1024px)')
  const L = wide ? WIDE : TALL

  useEffect(() => {
    if (inView) ref.current?.unpauseAnimations()
    else ref.current?.pauseAnimations()
  }, [inView, wide])

  const sourceEdge = (p: Pt) => (wide ? { x: p.x + 46, y: p.y } : { x: p.x, y: p.y + 18 })
  const nodeEdge = (p: Pt) => (wide ? { x: p.x - L.nodeW / 2, y: p.y } : { x: p.x, y: p.y - NODE_H / 2 })
  const coreIn = wide ? { x: L.core.x - L.core.r, y: L.core.y } : { x: L.core.x, y: L.core.y - L.core.r }
  const coreOut = wide ? { x: L.core.x + L.core.r, y: L.core.y } : { x: L.core.x, y: L.core.y + L.core.r }
  const ins = L.sources.map((p) => link(sourceEdge(p), coreIn, wide))
  const outs = L.nodes.map((p) => link(coreOut, nodeEdge(p), wide))
  const [e0, e1] = L.exit
  const mid = { x: (e0.x + e1.x) / 2, y: (e0.y + e1.y) / 2 }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${L.w} ${L.h}`}
      role="img"
      aria-label="Your network: logs from ssh, web and firewall flow to Drishti, which uses Ollama, PostgreSQL and ChromaDB inside the network. External AI APIs stay outside, crossed out."
      className="mx-auto h-auto w-full max-w-sm overflow-visible lg:max-w-none"
    >
      <defs>
        <radialGradient id="room-glow">
          <stop offset="0" stopColor="var(--primary)" stopOpacity={0.22} />
          <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* outside: the cloud nobody calls */}
      <g opacity={0.45}>
        <path d={`M${e0.x} ${e0.y}L${e1.x} ${e1.y}`} className="stroke-text-muted" strokeWidth={1.5} strokeDasharray="3 6" />
        <g transform={`translate(${mid.x} ${mid.y})`} className="stroke-text-muted" strokeWidth={2} strokeLinecap="round">
          <circle r={11} className="fill-bg" strokeWidth={1.5} />
          <path d="M-4 -4L4 4M4 -4L-4 4" />
        </g>
        <g transform={`translate(${L.cloud.x} ${L.cloud.y})`}>
          <path
            d="M-38 22h76a20 20 0 0 0 2-40a28 28 0 0 0-54-6a22 22 0 0 0-26 46z"
            className="fill-surface stroke-text-muted"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <path d="M-46 30L46 -34" className="stroke-text-muted" strokeWidth={1.5} strokeLinecap="round" />
          <text y={52} textAnchor="middle" className="fill-text-muted font-mono text-[12px]">
            External AI APIs
          </text>
        </g>
      </g>

      {/* the room */}
      <rect x={L.room.x} y={L.room.y} width={L.room.w} height={L.room.h} rx={36} className="fill-card/40 stroke-primary/45" strokeWidth={1.5} strokeDasharray="6 7" />
      <circle cx={L.core.x} cy={L.core.y} r={L.core.r * 3} fill="url(#room-glow)" />
      <text x={L.label.x} y={L.label.y} className="fill-primary font-mono text-[12px] tracking-[0.28em]">
        YOUR NETWORK
      </text>

      {[...ins, ...outs].map((d) => (
        <path key={d} d={d} fill="none" className="stroke-primary-light/35" strokeWidth={1.25} />
      ))}

      {L.sources.map((p, i) => (
        <g key={SOURCES[i]} transform={`translate(${p.x} ${p.y})`}>
          <rect x={-46} y={-17} width={92} height={34} rx={17} className="fill-surface stroke-border" />
          <text y={4.5} textAnchor="middle" className="fill-text font-mono text-[13px]">
            {SOURCES[i]}
          </text>
        </g>
      ))}

      <g transform={`translate(${L.core.x} ${L.core.y})`}>
        <circle r={L.core.r} className="fill-surface stroke-primary/70" strokeWidth={1.5} />
        <g transform={`translate(0 -8) scale(${L.core.r / 52})`}>
          <Eye pupil={4.5} />
        </g>
        <text y={L.core.r * 0.62} textAnchor="middle" className="fill-primary font-display text-[12px] tracking-[0.18em]">
          DRISHTI
        </text>
      </g>

      {L.nodes.map((p, i) => {
        const { icon: Icon, name, sub } = NODES[i]
        return (
          <g key={name} transform={`translate(${p.x} ${p.y})`}>
            <rect x={-L.nodeW / 2} y={-NODE_H / 2} width={L.nodeW} height={NODE_H} rx={18} className="fill-surface stroke-border" />
            <Icon x={-10} y={-31} width={20} height={20} className="text-primary" strokeWidth={1.75} />
            <text y={7} textAnchor="middle" className="fill-text text-[13px] font-medium">
              {name}
            </text>
            <text y={25} textAnchor="middle" className="fill-text-muted font-mono text-[10.5px]">
              {sub}
            </text>
          </g>
        )
      })}

      {!reduce && (
        <g>
          {ins.map((d, i) => (
            <Bead key={d} d={d} dur={2.4} begin={i * 0.7} threat={i === 0} />
          ))}
          {outs.map((d, i) => (
            <Bead key={d} d={d} dur={2} begin={0.4 + i * 0.6} />
          ))}
        </g>
      )}
    </svg>
  )
}
