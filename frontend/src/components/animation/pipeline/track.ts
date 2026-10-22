// Scene geometry for the hero animation. All units are SVG viewBox units.

export const VIEWBOX = { w: 400, h: 310 }

export interface Pose {
  x: number
  y: number
  angle: number // degrees
}

interface Point {
  x: number
  y: number
}

export interface Track {
  d: string
  length: number
  at: (distance: number) => Pose
}

/** Polyline with arc-length lookup. Closed tracks wrap; open ones clamp. */
function makeTrack(points: Point[], closed: boolean): Track {
  const pts = closed ? [...points, points[0]] : points
  const cum = [0]
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  }
  const length = cum[cum.length - 1]

  const at = (distance: number): Pose => {
    const s = closed
      ? ((distance % length) + length) % length
      : Math.min(Math.max(distance, 0), length)
    let lo = 0
    let hi = cum.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (cum[mid] <= s) lo = mid
      else hi = mid
    }
    const a = pts[lo]
    const b = pts[hi]
    const f = (s - cum[lo]) / (cum[hi] - cum[lo] || 1)
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
    }
  }

  const d =
    pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') +
    (closed ? 'Z' : '')
  return { d, length, at }
}

// Main loop: a stadium, travelled clockwise from its top-left corner.
const CX = 200
const CY = 130
const HALF = 90
const R = 72
const STEPS = 40

function stadium(): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < STEPS; i++) pts.push({ x: CX - HALF + (2 * HALF * i) / STEPS, y: CY - R })
  for (let i = 0; i < STEPS; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / STEPS
    pts.push({ x: CX + HALF + R * Math.cos(a), y: CY + R * Math.sin(a) })
  }
  for (let i = 0; i < STEPS; i++) pts.push({ x: CX + HALF - (2 * HALF * i) / STEPS, y: CY + R })
  for (let i = 0; i < STEPS; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / STEPS
    pts.push({ x: CX - HALF + R * Math.cos(a), y: CY + R * Math.sin(a) })
  }
  return pts
}

export const loop = makeTrack(stadium(), true)

// Spur: leaves the bottom straight at the switch, curves down, runs left to the buffer.
const SWITCH_X = 250
const SPUR_Y = 258
const SPUR_END_X = 76

function spurPoints(): Point[] {
  const p0 = { x: SWITCH_X, y: CY + R }
  const p1 = { x: SWITCH_X - 28, y: CY + R }
  const p2 = { x: SWITCH_X - 28, y: SPUR_Y }
  const p3 = { x: SWITCH_X - 56, y: SPUR_Y }
  const pts: Point[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const u = 1 - t
    pts.push({
      x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
      y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
    })
  }
  pts.push({ x: SPUR_END_X, y: SPUR_Y })
  return pts
}

export const spur = makeTrack(spurPoints(), false)

/** Distance along the loop where the switch sits (the bottom straight starts at length / 2). */
export const S_SWITCH = loop.length / 2 + (CX + HALF - SWITCH_X)

const spurDistanceAtX = (x: number) => spur.length - (x - SPUR_END_X)

export const CAR_HALF = 13
export const BUFFER = { x: 62, y: SPUR_Y, contactX: 78 }
export const PLATFORM_X = 150
export const D_HIT = spurDistanceAtX(BUFFER.contactX + CAR_HALF)
export const D_PLATFORM = spurDistanceAtX(PLATFORM_X)

export const EYE = { x: CX, y: 118 }
export const SWITCH_LEVER = { x: SWITCH_X + 16, y: CY + R + 16 }
export const DIAL = { x: 306, y: 256 }
export const BIRD_HOME = { x: 376, y: 45 }
export const ANALYST = { x: PLATFORM_X, y: 288 }
