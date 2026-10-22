// Live events on /api/v1/ws/events. The mock emitter produces the same shapes.
import type { Alert, Incident, Log, Stage } from './domain'

export type LiveEvent =
  | { type: 'log'; data: Log }
  | { type: 'alert'; data: Alert }
  | { type: 'stage_change'; data: { incident: Incident; from: Stage | null; to: Stage } }
  | { type: 'approval_needed'; data: Incident }
  | { type: 'incident_closed'; data: Incident }

export type LiveEventType = LiveEvent['type']
