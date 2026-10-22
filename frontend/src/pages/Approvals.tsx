import { AnimatePresence, motion } from 'framer-motion'
import { EmptyState } from '@/components/common/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { ApprovalCard } from '@/features/approvals/ApprovalCard'
import { useApprovals } from '@/features/approvals/hooks'
import { useNow } from '@/hooks/useNow'

export default function Approvals() {
  const { data, isError } = useApprovals()
  const now = useNow()

  return (
    <PageShell>
      {isError ? (
        <EmptyState agent="analyst" title="Can't load the queue" />
      ) : !data ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-card/50" />
          <div className="h-72 animate-pulse rounded-2xl bg-card/50" />
        </div>
      ) : data.length === 0 ? (
        <EmptyState agent="analyst" title="All clear">
          Nothing needs you right now.
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {data.map((i) => (
              <motion.div
                key={i.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ApprovalCard incident={i} now={now} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageShell>
  )
}
