// Seeded PRNG (mulberry32) so mock data is identical on every reload.

export interface Rng {
  next: () => number
  int: (min: number, max: number) => number
  float: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T
  chance: (p: number) => boolean
  /** v ± amount, clamped to 0..1. */
  jitter: (v: number, amount: number) => number
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    float: (min, max) => min + next() * (max - min),
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (p) => next() < p,
    jitter: (v, amount) => Math.min(1, Math.max(0, v + (next() * 2 - 1) * amount)),
  }
}
