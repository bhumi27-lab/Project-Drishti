import { lazy } from 'react'

// App pages load on demand, so the landing page never ships the dashboard (or Recharts).
export const Dashboard = lazy(() => import('@/pages/Dashboard'))
export const Alerts = lazy(() => import('@/pages/Alerts'))
export const Investigations = lazy(() => import('@/pages/Investigations'))
export const Investigation = lazy(() => import('@/pages/Investigation'))
export const Approvals = lazy(() => import('@/pages/Approvals'))
export const Logs = lazy(() => import('@/pages/Logs'))
export const Settings = lazy(() => import('@/pages/Settings'))
