import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { QUALITY, type Quality } from './layout'
import { createRig, type Still } from './rig'

interface SceneProps {
  progress: MotionValue<number>
  q: Quality
  still?: Still
  onFps?: (fps: number) => void
}

function Scene({ progress, q, still, onFps }: SceneProps) {
  const { size, gl } = useThree()
  const rig = useMemo(() => createRig(q), [q])
  useEffect(() => () => rig.dispose(), [rig])

  // Pointer in shader units (y -1..1, x -aspect..aspect). Window-level: the canvas ignores pointer events.
  const pointer = useRef<THREE.Vector2 | null>(null)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const aspect = window.innerWidth / window.innerHeight
      pointer.current = new THREE.Vector2(((e.clientX / window.innerWidth) * 2 - 1) * aspect, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const meter = useRef({ frames: 0, at: 0 })

  useFrame((frame, dt) => {
    const time = still ? still.time : frame.clock.elapsedTime
    rig.update({
      time,
      dt,
      progress: still ? still.progress : progress.get(),
      width: size.width,
      height: size.height,
      dpr: gl.getPixelRatio(),
      pointer: pointer.current,
      still,
    })
    if (onFps) {
      const m = meter.current
      m.frames++
      if (time - m.at > 0.5) {
        onFps(Math.round(m.frames / (time - m.at)))
        m.frames = 0
        m.at = time
      }
    }
  })

  const { geometry: g, materials: mat } = rig
  return (
    <>
      {rig.halo && <mesh geometry={g.ribbon} material={mat.halo} frustumCulled={false} renderOrder={1} />}
      <mesh geometry={g.ribbon} material={mat.core} frustumCulled={false} renderOrder={2} />
      <mesh geometry={g.frame} material={mat.frame} frustumCulled={false} renderOrder={3} />
      <points geometry={g.tips} material={mat.tip} frustumCulled={false} renderOrder={4} />
      <points geometry={g.beads} material={mat.bead} frustumCulled={false} renderOrder={5} />
      <mesh geometry={g.spokes} material={mat.spoke} frustumCulled={false} renderOrder={6} />
      <points geometry={g.point} material={mat.threat} frustumCulled={false} renderOrder={7} />
    </>
  )
}

interface FibreSceneProps {
  progress: MotionValue<number>
  active: boolean
  quality: keyof typeof QUALITY
  still?: Still
}

/** The hero strands that become the Watcher's iris as you scroll. Lazy-loaded (three.js). */
export default function FibreScene({ progress, active, quality, still }: FibreSceneProps) {
  const q = QUALITY[quality]
  const [fps, setFps] = useState(0)
  const showFps = import.meta.env.DEV && new URLSearchParams(window.location.search).has('fps')

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, q.dpr]}
        frameloop={active || still ? 'always' : 'never'}
        // Opaque, cleared to the page colour: additive glow needs a solid base to add onto.
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()), 1)}
        style={{ pointerEvents: 'none' }}
      >
        <Scene progress={progress} q={q} still={still} onFps={showFps ? setFps : undefined} />
      </Canvas>
      {showFps && <span className="fixed bottom-3 left-3 z-50 rounded bg-black/70 px-2 py-1 font-mono text-xs text-success">{fps} fps</span>}
    </div>
  )
}
