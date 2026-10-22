import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Placeholder. The hero PipelineScene lands in Phase 1 (components/animation).
export default function Landing() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Eye className="mx-auto size-10 text-primary-glow" />
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">Drishti</h1>
        <p className="mt-2 text-text-muted">The AI That Fights Back.</p>
        <Link to="/dashboard" className={cn(buttonVariants(), 'mt-8')}>
          Open Dashboard
        </Link>
      </motion.div>
    </main>
  )
}
