// The four agents as shown on the landing page's How it works cards.
import type { AgentId } from '@/types'

export type Route = 'auto' | 'human'

export type Tone = 'threat' | 'success' | 'warning'
type Example = { text: string; tone?: Tone }[]

export interface Stage {
  id: AgentId
  verb: string
  name: string
  line: string
  example: Record<Route, Example>
  /** Scene time (timeline.ts) when the railway reaches this stage. */
  at: Record<Route, number>
}

const same = (e: Example): Record<Route, Example> => ({ auto: e, human: e })

export const STAGES: Stage[] = [
  {
    id: 'watcher',
    verb: 'SEE',
    name: 'Watcher',
    line: "Reads every log, filters the noise and flags what breaks the pattern, with the IP's history attached.",
    example: same([{ text: '203.0.113.7', tone: 'threat' }, { text: ' · 47 failed SSH logins in 60s' }]),
    at: { auto: 1.5, human: 1.5 },
  },
  {
    id: 'detective',
    verb: 'UNDERSTAND',
    name: 'Detective',
    line: 'Matches the alert to MITRE ATT&CK and reasons with a local LLM. Asks for more context if unsure.',
    example: same([{ text: 'T1110', tone: 'threat' }, { text: ' · Brute Force' }]),
    at: { auto: 2.2, human: 2.2 },
  },
  {
    id: 'gate',
    verb: 'DECIDE',
    name: 'Confidence Gate',
    line: 'Turns the evidence into one score. Above 80% it acts alone; below, it asks an analyst.',
    example: {
      auto: [{ text: 'Confidence ' }, { text: '92%', tone: 'success' }, { text: ' · auto' }],
      human: [{ text: 'Confidence ' }, { text: '64%', tone: 'warning' }, { text: ' · asks analyst' }],
    },
    at: { auto: 4.2, human: 4.2 },
  },
  {
    id: 'bouncer',
    verb: 'DEFEND',
    name: 'Bouncer',
    line: 'Blocks the source, simulated by default, and writes every step to the audit trail.',
    example: {
      auto: [{ text: 'IP blocked', tone: 'threat' }, { text: ' · logged' }],
      human: [{ text: 'Approved', tone: 'success' }, { text: ' · ' }, { text: 'IP blocked', tone: 'threat' }, { text: ' · logged' }],
    },
    at: { auto: 6.8, human: 9.2 },
  },
]
