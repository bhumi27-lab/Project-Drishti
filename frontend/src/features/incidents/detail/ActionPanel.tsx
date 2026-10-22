import { AgentGlyph } from '@/components/agents/AgentGlyph'
import { Panel } from '@/components/common/Panel'
import { shortDateTime } from '@/lib/format'
import { ACTION } from '@/lib/incident'
import type { IncidentDetail } from '@/types'

/** What the Bouncer did, or what it wants to do. */
export function ActionPanel({ incident: i }: { incident: IncidentDetail }) {
  const done = i.actions[0]
  const shown = done ?? i.proposed_action
  if (!shown) {
    return (
      <Panel title="Action" agent="bouncer">
        <p className="text-sm text-text-muted">None needed.</p>
      </Panel>
    )
  }
  const { label, icon: Icon } = ACTION[shown.type]

  return (
    <Panel title="Action" agent="bouncer" aside={done ? (done.mode === 'simulated' ? 'simulated' : 'real') : i.status === 'open' ? 'suggested' : 'not taken'}>
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${done ? 'bg-threat/10 text-threat' : 'bg-surface text-text-muted'}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-text">{label}</p>
          <p className="truncate font-mono text-xs text-text-muted">{shown.target}</p>
        </div>
      </div>
      {done && (
        <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <AgentGlyph agent={done.executed_by === 'analyst' ? 'analyst' : 'bouncer'} className="size-4" />
          {done.executed_by === 'analyst' ? 'After analyst approval' : 'Autonomous'} · {shortDateTime(done.created_at)}
        </p>
      )}
    </Panel>
  )
}
