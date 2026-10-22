import { LayoutGrid, ScanEye, ScrollText, Search, Settings2, UserCheck, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApprovals } from '@/features/approvals/hooks'
import { cn } from '@/lib/utils'

const NAV: { to: string; label: string; icon: LucideIcon; badge?: boolean }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/alerts', label: 'Alerts', icon: ScanEye },
  { to: '/investigations', label: 'Investigations', icon: Search },
  { to: '/approvals', label: 'Approvals', icon: UserCheck, badge: true },
  { to: '/logs', label: 'Logs', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings2 },
]

/** `rail`: icons only at md, labels from lg. The mobile sheet always shows labels. */
export function NavLinks({ rail = false, onNavigate }: { rail?: boolean; onNavigate?: () => void }) {
  const { data: approvals } = useApprovals()
  const pending = approvals?.length ?? 0

  return (
    <ul className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, badge }) => (
        <li key={to}>
          <NavLink
            to={to}
            onClick={onNavigate}
            title={label}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                rail && 'md:justify-center lg:justify-start',
                isActive ? 'bg-card text-text ring-1 ring-border' : 'text-text-muted hover:bg-card/50 hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-primary-glow" />}
                <Icon className={cn('size-[18px] shrink-0', isActive && 'text-primary-glow')} />
                <span className={cn(rail && 'md:hidden lg:inline')}>{label}</span>
                {badge && pending > 0 && (
                  <span
                    className={cn(
                      'ml-auto min-w-5 rounded-full bg-warning/15 px-1.5 text-center text-[11px] font-medium text-warning tabular-nums',
                      rail && 'md:absolute md:top-1 md:right-1 md:ml-0 lg:static lg:ml-auto',
                    )}
                  >
                    {pending}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
