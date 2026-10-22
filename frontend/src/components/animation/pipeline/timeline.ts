// The whole scene is a pure function of loop time t, so it loops seamlessly
// and any frame can be rendered on its own (reduced motion, screenshots).
import { BIRD_HOME, D_HIT, D_PLATFORM, EYE, S_SWITCH, loop, spur, type Pose } from './track'

export const LOOP_SECONDS = 11
/** Every Nth loop the gate is unsure and a human approves instead. */
export const HUMAN_EVERY = 3

const V = loop.length / LOOP_SECONDS // one lap per loop keeps the ambient train seamless
const SLOTS = 5
const S0 = S_SWITCH - V * 5.6 // rogue slot reaches the switch at t = 5.6

const SHARED = {
  spot: 1.5,
  birdIn: 2.0,
  birdLand: 2.6,
  tag: 3.2,
  birdOut: 4.4,
  tagOut: 4.9,
  birdHome: 5.0,
  dial: 4.0,
  dialFull: 5.0,
  switchAt: 5.6,
  respawn: 9.8,
}
const AUTO = { hit: 6.8, drain: 8.5, confidence: 0.92 }
const HUMAN = { wake: 6.4, stop: 7.3, approve: 7.8, go: 8.4, hit: 9.2, drain: 10.2, confidence: 0.64 }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
const smooth = (p: number) => p * p * (3 - 2 * p)
const easeOut = (p: number) => 1 - (1 - p) ** 3
const backOut = (p: number) => 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2
const lerp = (a: number, b: number, p: number) => a + (b - a) * p
/** Fade in over `fi` from a, fade out over `fo` ending at b. */
const pulse = (t: number, a: number, b: number, fi: number, fo: number) =>
  smooth(prog(t, a, a + fi)) * (1 - smooth(prog(t, b - fo, b)))
/** Cubic Hermite: position from d0 to d1 with start/end velocities m0/m1 (per unit p). */
const hermite = (p: number, d0: number, d1: number, m0: number, m1: number) => {
  const p2 = p * p
  const p3 = p2 * p
  return (2 * p3 - 3 * p2 + 1) * d0 + (p3 - 2 * p2 + p) * m0 + (-2 * p3 + 3 * p2) * d1 + (p3 - p2) * m1
}
const blinkAt = (t: number, times: number[]) =>
  Math.max(0, ...times.map((b) => Math.sin(Math.PI * prog(t, b, b + 0.22))))

function spurDistance(t: number, human: boolean): number {
  const a = SHARED.switchAt
  if (!human && t < AUTO.hit) {
    const dur = AUTO.hit - a
    return hermite(prog(t, a, AUTO.hit), 0, D_HIT, V * dur, V * dur * 1.6)
  }
  if (human && t < HUMAN.hit) {
    if (t < HUMAN.stop) {
      const dur = HUMAN.stop - a
      return hermite(prog(t, a, HUMAN.stop), 0, D_PLATFORM, V * dur, 0)
    }
    if (t < HUMAN.go) return D_PLATFORM
    return hermite(prog(t, HUMAN.go, HUMAN.hit), D_PLATFORM, D_HIT, 0, (D_HIT - D_PLATFORM) * 2)
  }
  const hit = human ? HUMAN.hit : AUTO.hit
  return D_HIT - 9 * Math.sin(Math.PI * prog(t, hit, hit + 0.45)) // rebound off the buffer
}

export interface SceneState {
  ambient: Pose[]
  rogue: { pose: Pose; threat: number; opacity: number; scale: number } | null
  fresh: { pose: Pose; opacity: number } | null
  burst: { x: number; y: number; p: number } | null
  impact: number | null
  eye: { dx: number; dy: number; pupil: number; blink: number; lock: number }
  sight: { x: number; y: number; opacity: number }
  bird: { x: number; y: number; facing: 1 | -1; loupe: number }
  tag: { x: number; y: number; opacity: number; scale: number }
  dial: { value: number; human: boolean }
  switchThrown: number
  bouncer: { squash: number; squint: number }
  analyst: { awake: number; approve: number }
  lamp: number
}

export function sceneAt(t: number, human: boolean): SceneState {
  const k = human ? HUMAN : AUTO
  const L = loop.length

  const ambient = [1, 2, 3, 4].map((i) => loop.at(S0 + (i * L) / SLOTS + V * t))

  // Rogue carriage: on the loop until the switch, then down the spur.
  const onLoop = loop.at(S0 + V * t)
  const raw = t < SHARED.switchAt ? onLoop : spur.at(spurDistance(t, human))
  const shake = Math.sin(t * 90) * 1.6 * pulse(t, k.hit + 0.35, k.hit + 0.75, 0.05, 0.1)
  const dissolve = prog(t, k.hit + 0.8, k.hit + 1.3)
  const threat = smooth(prog(t, SHARED.spot, SHARED.spot + 0.4))
  const rogue =
    dissolve < 1
      ? { pose: { ...raw, x: raw.x + shake }, threat, opacity: 1 - dissolve, scale: 1 - 0.4 * dissolve }
      : null
  const burstP = prog(t, k.hit + 0.8, k.hit + 1.5)
  const impactP = prog(t, k.hit, k.hit + 0.5)

  const fresh =
    t >= SHARED.respawn
      ? { pose: loop.at(S0 + V * (t - LOOP_SECONDS)), opacity: smooth(prog(t, SHARED.respawn, LOOP_SECONDS)) }
      : null

  // Watcher eye: idly follows a carriage, then locks onto the rogue.
  const lock =
    smooth(prog(t, SHARED.spot, SHARED.spot + 0.4)) * (1 - smooth(prog(t, k.hit + 0.9, k.hit + 1.5)))
  const idle = ambient[1]
  const tx = lerp(idle.x, raw.x, lock) - EYE.x
  const ty = lerp(idle.y, raw.y, lock) - EYE.y
  const dist = Math.hypot(tx, ty) || 1
  const reach = Math.min(dist / 70, 1)
  const blinks = human ? [0.7, HUMAN.approve + 0.1, k.hit + 0.25] : [0.7, k.hit + 0.25]

  // Detective bird: flies to the rogue, rides it with a loupe, flies home.
  const roof = { x: onLoop.x, y: onLoop.y - 10 }
  let bird: SceneState['bird'] = { x: BIRD_HOME.x, y: BIRD_HOME.y + Math.sin(t * 2) * 0.6, facing: -1, loupe: 0 }
  if (t >= SHARED.birdIn && t < SHARED.birdLand) {
    const p = smooth(prog(t, SHARED.birdIn, SHARED.birdLand))
    bird = {
      x: lerp(BIRD_HOME.x, roof.x, p),
      y: lerp(BIRD_HOME.y, roof.y, p) - 16 * Math.sin(Math.PI * p),
      facing: roof.x < BIRD_HOME.x ? -1 : 1,
      loupe: 0,
    }
  } else if (t >= SHARED.birdLand && t < SHARED.birdOut) {
    bird = {
      x: roof.x,
      y: roof.y + Math.sin(t * 12) * 0.8,
      facing: Math.cos((onLoop.angle * Math.PI) / 180) >= 0 ? 1 : -1,
      loupe: Math.sin(t * 7) * 22,
    }
  } else if (t >= SHARED.birdOut && t < SHARED.birdHome) {
    const p = smooth(prog(t, SHARED.birdOut, SHARED.birdHome))
    bird = {
      x: lerp(roof.x, BIRD_HOME.x, p),
      y: lerp(roof.y, BIRD_HOME.y, p) - 16 * Math.sin(Math.PI * p),
      facing: BIRD_HOME.x > roof.x ? 1 : -1,
      loupe: 0,
    }
  }

  const drainOut = (pad: number) => 1 - smooth(prog(t, k.drain, k.drain + pad))

  return {
    ambient,
    rogue,
    fresh,
    burst: burstP > 0 && burstP < 1 ? { x: raw.x, y: raw.y, p: burstP } : null,
    impact: impactP > 0 && impactP < 1 ? impactP : null,
    eye: {
      dx: (tx / dist) * reach * 9,
      dy: (ty / dist) * reach * 5,
      pupil: lerp(6, 3.6, lock),
      blink: blinkAt(t, blinks),
      lock,
    },
    sight: {
      x: raw.x,
      y: raw.y,
      opacity: lock * (1 - smooth(prog(t, SHARED.switchAt - 0.2, SHARED.switchAt + 0.4))) * 0.7,
    },
    bird,
    tag: {
      x: onLoop.x,
      y: onLoop.y - 28,
      opacity: pulse(t, SHARED.tag, SHARED.tagOut, 0.3, 0.3),
      scale: backOut(prog(t, SHARED.tag, SHARED.tag + 0.35)),
    },
    dial: {
      value: k.confidence * easeOut(prog(t, SHARED.dial, SHARED.dialFull)) * drainOut(0.6),
      human,
    },
    switchThrown: smooth(prog(t, SHARED.dialFull, SHARED.dialFull + 0.3)) * drainOut(0.3),
    bouncer: {
      squash: Math.sin(Math.PI * prog(t, k.hit, k.hit + 0.3)),
      squint: pulse(t, k.hit - 0.2, k.hit + 0.9, 0.1, 0.2),
    },
    analyst: {
      awake: human ? pulse(t, HUMAN.wake, HUMAN.go + 0.5, 0.3, 0.4) : 0,
      approve: human ? pulse(t, HUMAN.approve, HUMAN.approve + 1.1, 0.15, 0.3) : 0,
    },
    lamp: human ? pulse(t, SHARED.switchAt + 0.5, HUMAN.go + 0.2, 0.2, 0.2) : 0,
  }
}

/** A representative still frame for reduced motion: rogue on the spur, gate at 92%. */
export const STILL_FRAME = 6.3
