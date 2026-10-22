import { createBrowserRouter } from 'react-router-dom'
import type { RouteHandle } from '@/components/layout/usePageTitle'
import Landing from '@/pages/Landing'
import { AppLayout } from './AppLayout'
import { Alerts, Approvals, Dashboard, Investigation, Investigations, Logs, Settings } from './lazyPages'

const title = (t: RouteHandle['title']): RouteHandle => ({ title: t })

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard />, handle: title('Dashboard') },
      { path: 'alerts', element: <Alerts />, handle: title('Alerts') },
      { path: 'investigations', element: <Investigations />, handle: title('Investigations') },
      { path: 'investigations/:id', element: <Investigation />, handle: title((p) => p.id ?? 'Investigation') },
      { path: 'approvals', element: <Approvals />, handle: title('Approvals') },
      { path: 'logs', element: <Logs />, handle: title('Logs') },
      { path: 'settings', element: <Settings />, handle: title('Settings') },
    ],
  },
])
