import { useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { publicUrl } from '../../lib/publicUrl'
export function FroggyHero() {
  const container = useRef<HTMLDivElement>(null)
  const scene = useRef<{ dispose(): void; celebrate(): void } | null>(null)
  const [ready, setReady] = useState(false)
  const reduceMotion = useSettingsStore(s => s.reduceMotion)
  useEffect(() => {
    let cancelled = false
    setReady(false)
    void import('../../lib/froggyScene').then(({ mountFroggyScene }) => {
      if (cancelled || !container.current) return
      scene.current = mountFroggyScene(container.current, { reduceMotion: reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches,
        onReady: () => setReady(true), onError: () => setReady(false) })
    }).catch(() => setReady(false))
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null }
  }, [reduceMotion])
  return <div className="froggy-hero" ref={container}>
    {!ready && <img className="froggy-hero-fallback" src={publicUrl('assets/game-scene-bg.png')} alt="Froggy am Waldteich" />}
    <button className="froggy-greet" onClick={() => scene.current?.celebrate()} aria-label="Froggy begrüßen">Hallo, Froggy! <span aria-hidden>♡</span></button>
  </div>
}
