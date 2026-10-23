import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { Panel } from '@/components/common/Panel'
import type { ContextRequest } from '@/types'

/** Bidirectional retrieval: the Detective asks, the Watcher answers from history. */
export function ContextThread({ requests }: { requests: ContextRequest[] }) {
  if (requests.length === 0) return null
  return (
    <Panel title="Context requests" aside={`${requests.length} of 2`}>
      <ol className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="space-y-2">
            <div className="flex items-start gap-2.5">
              <AgentGlyph agent="detective" title="Detective" className="mt-1 size-5" />
              <p className="rounded-2xl rounded-tl-sm bg-surface px-3 py-2 text-sm text-text">{r.query}</p>
            </div>
            <div className="flex items-start justify-end gap-2.5">
              <p className="rounded-2xl rounded-tr-sm border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-text">{r.result_summary}</p>
              <AgentGlyph agent="watcher" title="Watcher" className="mt-1 size-5" />
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
