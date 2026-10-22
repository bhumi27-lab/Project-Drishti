// Live events (/api/v1/ws/events). One connection for the whole app; components
// listen through useLiveEvent. In mock mode the emitter stands in for the socket.
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { LiveEvent } from '@/types'
import { API_BASE, USE_MOCKS } from './constants'

type Handler = (e: LiveEvent) => void

const handlers = new Set<Handler>()
const statusListeners = new Set<() => void>()
let connected = false

function setConnected(v: boolean) {
  connected = v
  for (const l of statusListeners) l()
}

const dispatch = (e: LiveEvent) => {
  for (const h of handlers) h(e)
}

function connect(): () => void {
  if (USE_MOCKS) {
    let unsubscribe = () => {}
    let cancelled = false
    void import('@/mocks/emitter').then((m) => {
      if (cancelled) return
      unsubscribe = m.subscribe(dispatch)
      setConnected(true)
    })
    return () => {
      cancelled = true
      unsubscribe()
      setConnected(false)
    }
  }

  let ws: WebSocket | null = null
  let closed = false
  let retry = 0
  let timer = 0
  const open = () => {
    ws = new WebSocket(`${API_BASE.replace(/^http/, 'ws')}/api/v1/ws/events`)
    ws.onopen = () => {
      retry = 0
      setConnected(true)
    }
    ws.onmessage = (m) => {
      try {
        dispatch(JSON.parse(String(m.data)) as LiveEvent)
      } catch {
        // ignore malformed frames
      }
    }
    ws.onclose = () => {
      setConnected(false)
      if (!closed) timer = window.setTimeout(open, Math.min(30_000, 1000 * 2 ** retry++))
    }
  }
  open()
  return () => {
    closed = true
    clearTimeout(timer)
    ws?.close()
  }
}

/** Mount once (AppLayout). Opens the stream while the app shell is on screen. */
export function useLiveConnection() {
  useEffect(() => connect(), [])
}

/** Call `handler` for every live event while `enabled`. The latest handler is always used. */
export function useLiveEvent(handler: Handler, enabled = true) {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    if (!enabled) return
    const h: Handler = (e) => ref.current(e)
    handlers.add(h)
    return () => {
      handlers.delete(h)
    }
  }, [enabled])
}

export function useLiveStatus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      statusListeners.add(cb)
      return () => statusListeners.delete(cb)
    },
    () => connected,
  )
}
