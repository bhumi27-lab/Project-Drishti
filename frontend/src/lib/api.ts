import { API_BASE } from './constants'

// TODO: typed endpoints per docs/PROJECT_PLAN.md section 7.5.
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}
