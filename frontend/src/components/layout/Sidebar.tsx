import { AlertTriangle, FileText, LayoutDashboard, Search, Settings, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/investigations', label: 'Investigations', icon: Search },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/logs', label: 'Logs', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <nav className="hidden w-56 shrink-0 border-r border-border bg-surface/80 p-3 backdrop-blur md:block">
      <NavLink to="/" className="mb-4 block px-3 py-2 text-lg font-semibold text-primary-glow">
        Drishti
      </NavLink>
      <ul className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-card text-text' : 'text-text-muted hover:text-text'
                }`
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
