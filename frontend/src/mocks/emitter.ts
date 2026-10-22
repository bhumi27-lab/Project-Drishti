// Mock of /api/v1/ws/events. Streams normal traffic and walks fresh incidents through
// the same pipeline steps as the seed, pausing between stages so the UI can be watched.
import type { IncidentDetail, LiveEvent, ScenarioId, Stage } from '@/types'
import { db } from './db'
import { act, answerContext, askContext, conclude, raiseAlert, retrieve, route, score, storeLogs, toSummary } from './pipeline'
import { createRng } from './random'
import { SCENARIOS, normalLog, type ScenarioRun, type Variant } from './scenarios'

type Listener = (e: LiveEvent) => void
type Live = Exclude<ScenarioId, 'normal'>

const listeners = new Set<Listener>()
const rng = createRng(Date.now() >>> 0)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let trafficTimer = 0
let incidentTimer = 0
let inFlight = false

export function emit(e: LiveEvent) {
  for (const l of listeners) l(structuredClone(e))
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  if (listeners.size === 1) start()
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0) stop()
  }
}

/** Run one scenario now, regardless of the schedule (Settings → Run now). */
export function inject(scenario: ScenarioId | 'mixed') {
  const pick = pickScenario(scenario)
  if (pick) void runIncident(...pick)
}

function start() {
  scheduleTraffic()
  incidentTimer = window.setTimeout(nextIncident, 6000) // something to watch soon after opening
}

function stop() {
  clearTimeout(trafficTimer)
  clearTimeout(incidentTimer)
}

function scheduleTraffic() {
  trafficTimer = window.setTimeout(() => {
    if (db.settings.simulator.running) {
      const [log] = storeLogs(db, [normalLog(rng, Date.now())])
      emit({ type: 'log', data: log })
    }
    scheduleTraffic()
  }, rng.int(700, 1800))
}

function nextIncident() {
  const pick = db.settings.simulator.running && !inFlight ? pickScenario(db.settings.simulator.scenario) : null
  if (pick) void runIncident(...pick)
  incidentTimer = window.setTimeout(nextIncident, rng.int(18_000, 30_000))
}

function pickScenario(s: ScenarioId | 'mixed'): [Live, Variant | undefined] | null {
  if (s === 'normal') return null
  const live: Live =
    s === 'mixed'
      ? rng.pick<Live>(['ssh_bruteforce', 'ssh_bruteforce', 'ssh_bruteforce', 'port_scan', 'port_scan', 'sql_injection', 'sql_injection', 'odd_login', 'unknown'])
      : s
  const variant: Variant | undefined =
    live === 'sql_injection' ? rng.pick<Variant>(['loud', 'loud', 'quiet']) : live === 'unknown' ? rng.pick<Variant>(['escalate', 'benign']) : live === 'odd_login' ? 'priya' : undefined
  return [live, variant]
}

const summary = toSummary

function moved(inc: IncidentDetail, from: Stage | null) {
  emit({ type: 'stage_change', data: { incident: summary(inc), from, to: inc.stage } })
}

async function runIncident(scenario: Live, variant?: Variant) {
  inFlight = true
  try {
    // The attack happened over the last minute or so; Watcher has just seen enough of it.
    const quick = scenario === 'odd_login' || scenario === 'unknown'
    const run: ScenarioRun = SCENARIOS[scenario].run(rng, Date.now() - (quick ? 20_000 : 100_000), variant)
    const logs = storeLogs(db, run.logs)
    for (const l of logs.slice(-40)) {
      emit({ type: 'log', data: l })
      await sleep(40)
    }

    const inc = raiseAlert(db, scenario, run, logs, Date.now())
    emit({ type: 'alert', data: inc.alert })
    moved(inc, null)

    await sleep(1600)
    retrieve(db, inc, run, Date.now())
    moved(inc, 'watcher')

    for (const c of run.context) {
      await sleep(1300)
      askContext(db, inc, c, Date.now())
      moved(inc, 'detective')
      await sleep(1300)
      answerContext(db, inc, c, Date.now())
      moved(inc, 'watcher')
    }

    await sleep(2400)
    conclude(db, inc, run, Date.now())
    await sleep(700)
    score(db, inc, run, Date.now())
    moved(inc, 'detective')

    await sleep(1300)
    route(db, inc, Date.now())
    moved(inc, 'gate')
    if (inc.decision === 'human') emit({ type: 'approval_needed', data: summary(inc) })
    if (inc.decision === 'dismiss') emit({ type: 'incident_closed', data: summary(inc) })
    if (inc.decision === 'auto') {
      await sleep(1100)
      act(db, inc, Date.now())
      emit({ type: 'incident_closed', data: summary(inc) })
    }
  } finally {
    inFlight = false
  }
}
