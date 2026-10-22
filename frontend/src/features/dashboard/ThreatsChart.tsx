import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { hourLabel } from '@/lib/format'
import type { Stats } from '@/types'

type Point = { label: string; range: string; count: number }

function Tip({ active, payload }: TooltipContentProps) {
  const p = payload?.[0]?.payload as Point | undefined
  if (!active || !p) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-text-muted">{p.range}</p>
      <p className="mt-0.5 text-text">
        {p.count} {p.count === 1 ? 'threat' : 'threats'}
      </p>
    </div>
  )
}

/** Threats per hour, last 24 h. One series, so the title names it and there is no legend. */
export function ThreatsChart({ data }: { data?: Stats['threats_24h'] }) {
  const points: Point[] = (data ?? []).map((d) => {
    const end = new Date(Date.parse(d.hour) + 3_600_000).toISOString()
    return { label: hourLabel(d.hour), range: `${hourLabel(d.hour)}–${hourLabel(end)}`, count: d.count }
  })
  const total = points.reduce((n, p) => n + p.count, 0)

  return (
    <section className="self-start rounded-2xl border border-border/70 bg-card/40 p-5">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-text">
          Threats <span className="font-normal text-text-muted">· last 24 h</span>
        </h2>
        <span className="text-2xl font-semibold tracking-tight text-text">{data ? total : '–'}</span>
      </header>

      <div className="mt-4 h-44" aria-hidden>
        {data ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" interval={5} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis allowDecimals={false} width={24} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                content={Tip}
                cursor={{ fill: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
                isAnimationActive={false}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={24} activeBar={{ fill: 'var(--primary-glow)' }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full animate-pulse rounded-lg bg-card/60" />
        )}
      </div>

      {/* table view for screen readers */}
      <table className="sr-only">
        <caption>Threats per hour, last 24 hours</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.range}>
              <th scope="row">{p.range}</th>
              <td>{p.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
