import { createBrowserRouter } from 'react-router-dom'
import Alerts from '@/pages/Alerts'
import Approvals from '@/pages/Approvals'
import Dashboard from '@/pages/Dashboard'
import Investigations from '@/pages/Investigations'
import Landing from '@/pages/Landing'
import Logs from '@/pages/Logs'
import Settings from '@/pages/Settings'
import { AppLayout } from './AppLayout'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'alerts', element: <Alerts /> },
      { path: 'investigations', element: <Investigations /> },
      { path: 'investigations/:id', element: <Investigations /> },
      { path: 'approvals', element: <Approvals /> },
      { path: 'logs', element: <Logs /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])
