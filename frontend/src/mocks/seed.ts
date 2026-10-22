// Builds ~24 h of believable history from the scenarios. Deterministic content,
// timestamps relative to "now" so the dashboard always looks current.
import type { ScenarioId } from '@/types'
import { act, answerContext, askContext, conclude, nextId, raiseAlert, resolve, retrieve, route, score, storeLogs, type MockDb, type Resolution } from './pipeline'
import { createRng, type Rng } from './random'
import { SCENARIOS, normalLog, type Variant } from './scenarios'

export type Outcome = Resolution | 'pending'

const MIN = 60_000
const HOUR = 60 * MIN
const ANALYSTS = ['Bhumi', 'Vedang', 'Lakshyaveer']
const COMMENTS: Partial<Record<ScenarioId, Partial<Record<Resolution, string>>>> = {
  sql_injection: { approved: 'Manual probing. Block.' },
  odd_login: { rejected: 'Travelling, confirmed on call.' },
  unknown: { escalated: 'Needs forensics on app-02.' },
}

/** Run one scenario through every stage at once (history). */
function buildIncident(db: MockDb, rng: Rng, scenario: Exclude<ScenarioId, 'normal'>, at: number, variant?: Variant, outcome: Outcome = 'approved') {
  const run = SCENARIOS[scenario].run(rng, at, variant)
  const logs = storeLogs(db, run.logs, null, false)
  let t = Math.max(...logs.map((l) => Date.parse(l.timestamp))) + 2000

  const inc = raiseAlert(db, scenario, run, logs, t, false)
  retrieve(db, inc, run, (t += 1200))
  for (const c of run.context) {
    askContext(db, inc, c, (t += 1800))
    answerContext(db, inc, c, (t += 1100))
  }
  conclude(db, inc, run, (t += rng.int(3500, 7000)))
  score(db, inc, run, (t += 400))
  route(db, inc, (t += 200))
  if (inc.decision === 'auto') act(db, inc, t + 800)
  else if (inc.decision === 'human' && outcome !== 'pending') {
    resolve(db, inc, outcome, rng.pick(ANALYSTS), COMMENTS[scenario]?.[outcome] ?? null, t + rng.int(4, 40) * MIN)
  }
}

/** Most recent past occurrence of hh:mm local time. */
function lastAt(now: number, h: number, m: number): number {
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  if (d.getTime() > now - 20 * MIN) d.setDate(d.getDate() - 1)
  return d.getTime()
}

export function seed(now: number): MockDb {
  const rng = createRng(2027)
  const db: MockDb = {
    logs: [],
    alerts: [],
    incidents: [],
    scenarioOf: new Map(),
    settings: { confidence_threshold: 0.8, mitigation_mode: 'simulated', simulator: { running: true, scenario: 'mixed' } },
    seq: {},
  }

  type Entry = [at: number, scenario: Exclude<ScenarioId, 'normal'>, variant?: Variant, outcome?: Outcome]
  const ago = (h: number) => now - h * HOUR
  const plan: Entry[] = [
    [ago(23.2), 'port_scan'],
    [ago(21.5), 'ssh_bruteforce'],
    [ago(19.8), 'sql_injection', 'loud'],
    [ago(18.1), 'unknown', 'benign'],
    [ago(12.3), 'sql_injection', 'quiet', 'approved'],
    [lastAt(now, 2, 41), 'odd_login', 'arjun', 'rejected'],
    [lastAt(now, 3, 12), 'odd_login', 'priya', 'pending'],
    [ago(5.1), 'unknown', 'escalate', 'escalated'],
    [ago(0.4), 'sql_injection', 'quiet', 'pending'],
  ]
  // Background noise: the internet never stops knocking.
  const filler = ['ssh_bruteforce', 'ssh_bruteforce', 'port_scan', 'port_scan', 'sql_injection'] as const
  for (let i = 0; i < 16; i++) {
    const s = rng.pick(filler)
    plan.push([ago(rng.float(0.8, 23.5)), s, s === 'sql_injection' ? 'loud' : undefined])
  }
  plan.sort((a, b) => a[0] - b[0])
  for (const [at, scenario, variant, outcome] of plan) buildIncident(db, rng, scenario, at, variant, outcome)

  // Normal traffic, busier during the day.
  let made = 0
  while (made < 2600) {
    const at = now - rng.float(0, 24 * HOUR)
    const h = new Date(at).getHours()
    if (!rng.chance(h >= 8 && h <= 22 ? 1 : 0.35)) continue
    db.logs.push({ ...normalLog(rng, at), id: nextId(db, 'LOG'), alert_id: null })
    made++
  }

  db.logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return db
}
