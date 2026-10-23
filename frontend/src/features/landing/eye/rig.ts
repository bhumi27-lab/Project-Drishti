// The GPU side of the hero strands / Watcher iris: geometries, materials with shared
// uniforms, and the per-frame logic (threat scheduling, ring scan-and-lock). Plain TS,
// owned by one React component; React never sees these objects change.
import * as THREE from 'three'
import { SPOKES, TAU, beadGeometry, frameGeometry, irisAngle, ribbonGeometry, spokeGeometry, strandRands, tipGeometry, type Quality } from './layout'
import { beadVert, dotFrag, frameFrag, frameVert, ribbonFrag, ribbonVert, spokeFrag, spokeVert, threatVert, tipVert } from './shaders'

export interface Still {
  time: number
  progress: number
}

export interface FrameInput {
  time: number
  dt: number
  progress: number // scroll 0..1 through the pinned section
  width: number
  height: number
  dpr: number
  pointer: THREE.Vector2 | null // shader units
  still?: Still
}

const TRAVEL = 3.6 // seconds a threat bead takes along its fibre
const CYCLE = 5.2
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => x * x * (3 - 2 * x)
const token = (name: string) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim())

function material(vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>, defines?: Record<string, string>) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    ...(defines && { defines }),
    transparent: true,
    side: THREE.DoubleSide, // ribbon winding flips with the strand's direction
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

export function createRig(q: Quality) {
  const rands = strandRands(q.strands)
  const c = { deep: token('--primary-deep'), primary: token('--primary'), light: token('--primary-light'), text: token('--text'), threat: token('--threat') }

  // Shared uniform objects: one value change reaches every material holding it.
  const shared = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uAspect: { value: 1 },
    uScale: { value: 1 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uGaze: { value: new THREE.Vector2() },
    uCount: { value: q.strands },
  }
  const ring = { uRot: { value: 0 }, uShow: { value: 0 }, uLockIdx: { value: -1 }, uLock: { value: 0 } }
  const threat = { uThreatStrand: { value: 0 }, uThreatRand: { value: rands[0].clone() }, uThreatT: { value: 0 } }
  const size = { tip: { value: 20 }, bead: { value: 5 }, threat: { value: 16 } }

  const geometry = {
    ribbon: ribbonGeometry(q, rands),
    tips: tipGeometry(rands),
    beads: beadGeometry(q, rands),
    spokes: spokeGeometry(),
    frame: frameGeometry(),
    point: new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)),
  }
  const materials = {
    halo: material(ribbonVert, ribbonFrag, { ...shared, uWidth: { value: 0.012 }, uAlpha: { value: 0.16 }, uColA: { value: c.deep }, uColB: { value: c.primary } }),
    core: material(ribbonVert, ribbonFrag, { ...shared, uWidth: { value: 0.0022 }, uAlpha: { value: 0.95 }, uColA: { value: c.deep }, uColB: { value: c.light } }),
    tip: material(tipVert, dotFrag, { ...shared, uSize: size.tip, uAlpha: { value: 1 }, uColA: { value: c.light }, uColB: { value: c.text } }),
    bead: material(beadVert, dotFrag, { ...shared, uSize: size.bead, uAlpha: { value: 0.9 }, uColA: { value: c.light }, uColB: { value: c.text } }, { FADE: '' }),
    threat: material(
      threatVert,
      dotFrag,
      { ...shared, ...threat, uSize: size.threat, uAlpha: { value: 1 }, uColA: { value: c.threat }, uColB: { value: c.threat.clone().lerp(c.text, 0.5) } },
      { FADE: '' },
    ),
    spoke: material(spokeVert, spokeFrag, { ...shared, ...ring, uColA: { value: c.text }, uThreat: { value: c.threat } }),
    frame: material(frameVert, frameFrag, { ...shared, ...ring, uColA: { value: c.deep }, uColB: { value: c.primary }, uRing: { value: c.text.clone() } }),
  }

  let threatStart = -CYCLE
  let strand = 0

  function update(f: FrameInput) {
    const k = 1 - Math.exp(-f.dt * 6)
    const aspect = f.width / f.height
    shared.uTime.value = f.time
    shared.uMorph.value = clamp01((f.progress - 0.16) / 0.5)
    shared.uAspect.value = aspect
    shared.uScale.value = Math.min(1, aspect * 1.05) // portrait: shrink so the ring fits the width
    if (f.pointer) {
      shared.uMouse.value.lerp(f.pointer, k)
      const gaze = f.pointer.clone()
      if (gaze.length() > 1) gaze.normalize()
      shared.uGaze.value.lerp(gaze, k)
    }

    const px = (f.height * f.dpr) / 900
    size.tip.value = 30 * px
    size.bead.value = 6 * px
    size.threat.value = 30 * px

    // A new threat every cycle, on a random fibre (fixed in still mode).
    if (f.still) {
      strand = Math.floor(q.strands * 0.37)
      threat.uThreatT.value = 0.62
    } else {
      if (f.time - threatStart > CYCLE) {
        threatStart = f.time
        strand = Math.floor(Math.random() * q.strands)
      }
      threat.uThreatT.value = clamp01((f.time - threatStart) / TRAVEL)
    }
    threat.uThreatStrand.value = strand
    threat.uThreatRand.value.copy(rands[strand])

    // The ring scans, then turns so a spoke faces the threat bead, and locks (that spoke goes coral).
    ring.uShow.value = smooth(clamp01((f.progress - 0.58) / 0.2))
    const step = TAU / SPOKES
    const t = threat.uThreatT.value
    if (ring.uShow.value > 0.6 && t > 0 && t < 0.97) {
      const theta = irisAngle(strand, rands[strand], q.strands)
      const n = Math.round((theta - ring.uRot.value) / step)
      const target = theta - n * step
      ring.uRot.value = f.still ? target : ring.uRot.value + (target - ring.uRot.value) * (1 - Math.exp(-f.dt * 5))
      ring.uLockIdx.value = ((n % SPOKES) + SPOKES) % SPOKES
      const close = Math.abs(target - ring.uRot.value) < 0.02 ? 1 : 0
      ring.uLock.value = f.still ? 1 : ring.uLock.value + (close - ring.uLock.value) * k
    } else {
      ring.uRot.value += f.dt * 0.35
      ring.uLock.value += (0 - ring.uLock.value) * k
    }
  }

  function dispose() {
    Object.values(geometry).forEach((g) => g.dispose())
    Object.values(materials).forEach((m) => m.dispose())
  }

  return { geometry, materials, halo: q.halo, update, dispose }
}

export type Rig = ReturnType<typeof createRig>
