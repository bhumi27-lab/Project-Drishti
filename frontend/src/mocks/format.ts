// Realistic raw log lines: syslog (sshd, kernel/UFW, cron) and nginx combined format.
// Attacker IPs use the documentation ranges (RFC 5737) so no real host is implicated.
import type { Log, LogSource } from '@/types'
import type { Rng } from './random'

export type LogDraft = Omit<Log, 'id' | 'alert_id'>

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')

export function syslogTime(ms: number): string {
  const d = new Date(ms)
  return `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function clfTime(ms: number): string {
  const d = new Date(ms)
  const off = -d.getTimezoneOffset()
  const abs = Math.abs(off)
  return `${pad(d.getDate())}/${MON[d.getMonth()]}/${d.getFullYear()}:${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${off >= 0 ? '+' : '-'}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`
}

export const HOSTS = {
  bastion: '10.0.1.10',
  web: '10.0.2.10',
  app: '10.0.3.21',
  db: '10.0.5.30',
}

export const attackerIp = (rng: Rng) => rng.pick(['203.0.113', '198.51.100']) + `.${rng.int(2, 254)}`
export const visitorIp = (rng: Rng) => `192.0.2.${rng.int(2, 254)}`
export const internalIp = (rng: Rng) => `10.0.4.${rng.int(10, 60)}`

export const UA = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
  safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile Safari/604.1',
  firefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
  sqlmap: 'sqlmap/1.8.11#stable (https://sqlmap.org)',
  kuma: 'Uptime-Kuma/2.0.1',
}

export function draft(
  at: number,
  source: LogSource,
  src_ip: string,
  dst_ip: string | null,
  user: string | null,
  event_type: string,
  raw: string,
  parsed: Record<string, unknown>,
): LogDraft {
  return { timestamp: new Date(at).toISOString(), source, src_ip, dst_ip, user, event_type, raw, parsed }
}

export function nginxLine(
  at: number,
  ip: string,
  method: string,
  path: string,
  status: number,
  bytes: number,
  ua: string,
): LogDraft {
  return draft(
    at,
    'web',
    ip,
    HOSTS.web,
    null,
    'http_request',
    `${ip} - - [${clfTime(at)}] "${method} ${path} HTTP/1.1" ${status} ${bytes} "-" "${ua}"`,
    { host: 'web-01', method, path, status, bytes, ua },
  )
}

export function ufwLine(at: number, action: 'BLOCK' | 'ALLOW', src: string, dst: string, spt: number, dpt: number): LogDraft {
  return draft(
    at,
    'firewall',
    src,
    dst,
    null,
    action === 'BLOCK' ? 'fw_block' : 'fw_allow',
    `${syslogTime(at)} fw-01 kernel: [UFW ${action}] IN=eth0 OUT= SRC=${src} DST=${dst} PROTO=TCP SPT=${spt} DPT=${dpt} SYN`,
    { host: 'fw-01', action, proto: 'TCP', spt, dpt },
  )
}

export function sshLine(
  at: number,
  rng: Rng,
  ip: string,
  user: string,
  ok: boolean,
  method: 'password' | 'publickey',
  extra: Record<string, unknown> = {},
): LogDraft {
  const port = rng.int(32768, 60999)
  const text = ok
    ? `Accepted ${method} for ${user} from ${ip} port ${port} ssh2`
    : `Failed password for ${user === 'root' ? '' : 'invalid user '}${user} from ${ip} port ${port} ssh2`
  return draft(
    at,
    'ssh',
    ip,
    HOSTS.bastion,
    user,
    ok ? 'auth_success' : 'auth_failure',
    `${syslogTime(at)} bastion sshd[${rng.int(1200, 9800)}]: ${text}`,
    { host: 'bastion', user, port, method, result: ok ? 'success' : 'failure', ...extra },
  )
}

export function systemLine(at: number, host: string, ip: string, event_type: string, proc: string, msg: string, parsed: Record<string, unknown> = {}): LogDraft {
  return draft(at, 'system', ip, null, null, event_type, `${syslogTime(at)} ${host} ${proc}: ${msg}`, { host, ...parsed })
}
