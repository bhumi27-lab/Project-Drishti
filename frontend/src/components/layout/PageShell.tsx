import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Page content container. The page title lives in the Topbar (route `handle.title`). */
export function PageShell({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8', className)}>{children}</div>
}
