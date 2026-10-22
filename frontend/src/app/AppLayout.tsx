import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useLiveCache } from '@/features/live/useLiveCache'
import { useLiveConnection } from '@/lib/live'

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 md:px-8 md:py-8">
      <div className="h-24 animate-pulse rounded-2xl bg-card/50" />
      <div className="h-72 animate-pulse rounded-2xl bg-card/50" />
    </div>
  )
}

export function AppLayout() {
  const { pathname } = useLocation()
  useLiveConnection()
  useLiveCache()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1"
        >
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </motion.main>
      </div>
    </div>
  )
}
