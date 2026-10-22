import { useState } from 'react'
import { clockTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Log } from '@/types'

const SOURCE: Record<Log['source'], string> = { ssh: 'SSH', web: 'WEB', firewall: 'FW', system: 'SYS' }

function highlight(text: string, needle: string) {
  if (!needle) return text
  const i = text.toLowerCase().indexOf(needle.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-primary/25 text-text">{text.slice(i, i + needle.length)}</mark>
      {text.slice(i + needle.length)}
    </>
  )
}

/** One raw log line. Lines that belong to an alert carry a rose marker. Click to see parsed fields. */
export function LogLine({ log, needle, fresh = false }: { log: Log; needle: string; fresh?: boolean }) {
  const [open, setOpen] = useState(false)
  const flagged = log.alert_id !== null

  return (
    <li className={cn('border-l-2 transition-colors duration-1000', flagged ? 'border-threat' : 'border-transparent', fresh && 'bg-primary/10 duration-0')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_auto_1fr] items-baseline gap-3 px-4 py-1.5 text-left font-mono text-[11px] leading-relaxed hover:bg-card/70"
      >
        <span className="text-text-muted tabular-nums">{clockTime(log.timestamp)}</span>
        <span className={cn('w-7', flagged ? 'text-threat' : 'text-text-muted')}>{SOURCE[log.source]}</span>
        <span className={cn('min-w-0 text-text/85', open ? 'break-all whitespace-pre-wrap' : 'truncate')}>{highlight(log.raw, needle)}</span>
      </button>
      {open && (
        <dl className="mx-4 mb-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 rounded-lg bg-surface/70 px-3 py-2 font-mono text-[11px]">
          {Object.entries({ id: log.id, alert: log.alert_id ?? '–', src_ip: log.src_ip, dst_ip: log.dst_ip ?? '–', user: log.user ?? '–', event: log.event_type, ...log.parsed }).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-text-muted">{k}</dt>
              <dd className="truncate text-text">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  )
}
