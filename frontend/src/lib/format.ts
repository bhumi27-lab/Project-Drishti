const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const plain = new Intl.NumberFormat('en')

/** 1,284 below 10K, then 12.9K / 4.2M. */
export function formatCount(n: number): string {
  return n < 10_000 ? plain.format(n) : compact.format(n)
}

export function formatPct(v: number): string {
  return `${Math.round(v * 100)}%`
}

/** "now", "12m", "3h", "2d". */
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000)
  if (s < 45) return 'now'
  if (s < 3600) return `${Math.round(s / 60)}m`
  if (s < 86_400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86_400)}d`
}

/** Local "14:03:22". */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

/** "22 Oct, 14:03". */
export function shortDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`
}

/** "+6.2s", "+4m", "+2h" between two ISO times. */
export function elapsed(fromIso: string, toIso: string): string {
  const s = (Date.parse(toIso) - Date.parse(fromIso)) / 1000
  if (s < 60) return `+${s.toFixed(s < 10 ? 1 : 0)}s`
  if (s < 3600) return `+${Math.round(s / 60)}m`
  return `+${Math.round(s / 3600)}h`
}

/** Local "14:00". */
export function hourLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
