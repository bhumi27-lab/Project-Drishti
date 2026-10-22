// The only data entry point for the UI. Mock store when VITE_USE_MOCKS is on,
// real /api/v1 otherwise, same shapes either way (docs/PROJECT_PLAN.md 7.5).
import type {
  Action, Alert, AlertQuery, ApprovalRequest, Incident, IncidentDetail, IncidentQuery, Log, LogQuery, Page, ScenarioId, Settings, Stats,
} from '@/types'
import { API_BASE, USE_MOCKS } from './constants'

type Store = typeof import('@/mocks/store')

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

function qs(params: object): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue
    for (const item of Array.isArray(v) ? v : [v]) sp.append(k, String(item))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Mock call: lazy-loads the store (kept out of the real bundle path), adds latency, returns a copy. */
async function mock<T>(fn: (store: Store) => T): Promise<T> {
  const store = await import('@/mocks/store')
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 180))
  return structuredClone(fn(store))
}

const post = (body: unknown, method = 'POST'): RequestInit => ({ method, body: JSON.stringify(body) })

export const api = {
  logs: (q: LogQuery = {}) => (USE_MOCKS ? mock((s) => s.listLogs(q)) : http<Page<Log>>(`/logs${qs(q)}`)),
  alerts: (q: AlertQuery = {}) => (USE_MOCKS ? mock((s) => s.listAlerts(q)) : http<Alert[]>(`/alerts${qs(q)}`)),
  incidents: (q: IncidentQuery = {}) => (USE_MOCKS ? mock((s) => s.listIncidents(q)) : http<Incident[]>(`/incidents${qs(q)}`)),
  incident: (id: string) => (USE_MOCKS ? mock((s) => s.getIncident(id)) : http<IncidentDetail>(`/incidents/${id}`)),
  approvals: () => (USE_MOCKS ? mock((s) => s.listApprovals()) : http<Incident[]>('/approvals')),
  decide: (id: string, body: ApprovalRequest) =>
    USE_MOCKS ? mock((s) => s.decide(id, body)) : http<Incident>(`/approvals/${id}`, post(body)),
  actions: () => (USE_MOCKS ? mock((s) => s.listActions()) : http<Action[]>('/actions')),
  stats: () => (USE_MOCKS ? mock((s) => s.getStats()) : http<Stats>('/stats')),
  settings: () => (USE_MOCKS ? mock((s) => s.getSettings()) : http<Settings>('/settings')),
  updateSettings: (patch: Partial<Settings>) =>
    USE_MOCKS ? mock((s) => s.updateSettings(patch)) : http<Settings>('/settings', post(patch, 'PUT')),
  injectScenario: (scenario: ScenarioId | 'mixed') =>
    USE_MOCKS ? mock((s) => s.injectScenario(scenario)) : http<{ ok: true }>('/simulator/inject', post({ scenario })),
}
