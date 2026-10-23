// Geometry for the hero strands / Watcher iris. Positions are computed on the GPU
// (shaders.ts); here we only lay out per-vertex parameters and per-strand randoms.
import * as THREE from 'three'

export interface Quality {
  strands: number
  segments: number
  beads: number
  halo: boolean
  dpr: number
}

export const QUALITY: Record<'high' | 'low', Quality> = {
  high: { strands: 160, segments: 48, beads: 360, halo: true, dpr: 1.5 },
  low: { strands: 70, segments: 28, beads: 120, halo: false, dpr: 1 },
}

export const SPOKES = 32
export const TAU = Math.PI * 2

/** Deterministic per-strand randoms in 0..1 (same on every load). */
export const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function strandRands(n: number): THREE.Vector4[] {
  return Array.from({ length: n }, (_, i) => new THREE.Vector4(rand(i, 1), rand(i, 2), rand(i, 3), rand(i, 4)))
}

/** Angle of strand i once it has become an iris fibre (mirrors iris() in the shader). */
export const irisAngle = (i: number, r: THREE.Vector4, n: number) => ((i + r.x * 0.6) / n) * TAU

/** One ribbon per strand: (segments + 1) × 2 vertices, two triangles per segment. */
export function ribbonGeometry(q: Quality, rands: THREE.Vector4[]) {
  const n = q.strands
  const m = q.segments
  const verts = n * (m + 1) * 2
  const strand = new Float32Array(verts)
  const rnd = new Float32Array(verts * 4)
  const t = new Float32Array(verts)
  const side = new Float32Array(verts)
  const index: number[] = []
  let v = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= m; j++) {
      for (const s of [-1, 1]) {
        strand[v] = i
        rands[i].toArray(rnd, v * 4)
        t[v] = j / m
        side[v] = s
        v++
      }
      if (j < m) {
        const a = (i * (m + 1) + j) * 2
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts * 3), 3)) // unused, keeps three happy
  g.setAttribute('aStrand', new THREE.BufferAttribute(strand, 1))
  g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
  g.setAttribute('aT', new THREE.BufferAttribute(t, 1))
  g.setAttribute('aSide', new THREE.BufferAttribute(side, 1))
  g.setIndex(index)
  return g
}

/** Glowing fibre tips: one point per strand. */
export function tipGeometry(rands: THREE.Vector4[]) {
  const n = rands.length
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  g.setAttribute('aStrand', new THREE.BufferAttribute(Float32Array.from({ length: n }, (_, i) => i), 1))
  const rnd = new Float32Array(n * 4)
  rands.forEach((r, i) => r.toArray(rnd, i * 4))
  g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
  return g
}

/** Log-event beads riding random strands at random speeds. */
export function beadGeometry(q: Quality, rands: THREE.Vector4[]) {
  const k = q.beads
  const strand = new Float32Array(k)
  const rnd = new Float32Array(k * 4)
  const bead = new Float32Array(k * 3) // speed, phase, size
  for (let b = 0; b < k; b++) {
    const s = Math.floor(rand(b, 9) * q.strands)
    strand[b] = s
    rands[s].toArray(rnd, b * 4)
    bead[b * 3] = 0.05 + rand(b, 10) * 0.12
    bead[b * 3 + 1] = rand(b, 11)
    bead[b * 3 + 2] = 0.6 + rand(b, 12) * 0.8
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(k * 3), 3))
  g.setAttribute('aStrand', new THREE.BufferAttribute(strand, 1))
  g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
  g.setAttribute('aBead', new THREE.BufferAttribute(bead, 3))
  return g
}

/** The ring's spokes: one quad each, corner = (across -1..1, along 0..1). */
export function spokeGeometry() {
  const idx = new Float32Array(SPOKES * 4)
  const corner = new Float32Array(SPOKES * 8)
  const index: number[] = []
  for (let k = 0; k < SPOKES; k++) {
    const c = [-1, 0, 1, 0, -1, 1, 1, 1]
    for (let v = 0; v < 4; v++) {
      idx[k * 4 + v] = k
      corner[(k * 4 + v) * 2] = c[v * 2]
      corner[(k * 4 + v) * 2 + 1] = c[v * 2 + 1]
    }
    const a = k * 4
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPOKES * 12), 3))
  g.setAttribute('aIdx', new THREE.BufferAttribute(idx, 1))
  g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 2))
  g.setIndex(index)
  return g
}

/** A quad for the ring circles, pupil rim and iris haze. */
export function frameGeometry() {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]), 3))
  g.setIndex([0, 1, 2, 1, 3, 2])
  return g
}
