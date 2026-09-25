import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { FroggySceneHandle, FroggyVariant } from '../../lib/froggyScene'
import { useSettingsStore } from '../../stores/settingsStore'

export interface Froggy3DHandle {
  celebrate(): void
  hop(durationMs?: number): void
  face(angle: number): void
}

interface Props {
  variant: FroggyVariant
  className?: string
  /** Wird angezeigt, bis WebGL bereit ist bzw. wenn WebGL fehlt. */
  fallback?: React.ReactNode
}

/** Lädt Three.js bei Bedarf und hängt den prozeduralen 3D-Froggy ein. */
export const Froggy3D = forwardRef<Froggy3DHandle, Props>(function Froggy3D({ variant, className, fallback }, ref) {
  const container = useRef<HTMLDivElement>(null)
  const scene = useRef<FroggySceneHandle | null>(null)
  const [ready, setReady] = useState(false)
  const reduceMotion = useSettingsStore(s => s.reduceMotion)

  useImperativeHandle(ref, () => ({
    celebrate: () => scene.current?.celebrate(),
    hop: (ms?: number) => scene.current?.hop(ms),
    face: (a: number) => scene.current?.face(a),
  }), [])

  useEffect(() => {
    let cancelled = false
    setReady(false)
    void import('../../lib/froggyScene').then(({ mountFroggyScene }) => {
      if (cancelled || !container.current) return
      scene.current = mountFroggyScene(container.current, {
        variant,
        reduceMotion: reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches,
        onReady: () => setReady(true),
        onError: () => setReady(false),
      })
    }).catch(() => setReady(false))
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null }
  }, [variant, reduceMotion])

  return (
    <div ref={container} className={`froggy3d${ready ? ' is-ready' : ''}${className ? ` ${className}` : ''}`}>
      {!ready && fallback}
    </div>
  )
})
