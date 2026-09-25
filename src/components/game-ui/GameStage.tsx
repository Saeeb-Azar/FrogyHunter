import type { ReactNode } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

export type StageScene = 'lobby' | 'forest' | 'play'

interface Props {
  scene?: StageScene
  children: ReactNode
  className?: string
  /** Breitere Bühne (Spielansicht / Admin) */
  wide?: boolean
}

/** Deterministischer Zufall, damit die Verteilung natürlich wirkt, aber nicht bei jedem Render springt. */
function rand(seed: number) {
  let t = seed + 0x6d2b79f5
  return () => { t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const r = rand(42)
const KINDS = ['pink', 'pink', 'pink', 'blossom', 'leaf', 'leaf', 'gold'] as const
const PETALS = Array.from({ length: 18 }, (_, i) => {
  const dur = 9 + r() * 10
  return {
    i, kind: KINDS[Math.floor(r() * KINDS.length)],
    style: {
      left: `${(r() * 110 - 5).toFixed(1)}%`,
      animationDuration: `${dur.toFixed(1)}s, ${(2.4 + r() * 2.2).toFixed(1)}s`,
      animationDelay: `${(-r() * dur).toFixed(1)}s, ${(-r() * 3).toFixed(1)}s`,
      '--sway': `${Math.round(18 + r() * 50)}px`,
      '--drift': `${Math.round((r() - 0.5) * 120)}px`,
      '--size': (0.6 + r() * 0.9).toFixed(2),
      '--spin': `${Math.round((r() > 0.5 ? 1 : -1) * (240 + r() * 500))}deg`,
    } as React.CSSProperties,
  }
})
const FIREFLIES = Array.from({ length: 12 }, (_, i) => ({
  i,
  style: {
    left: `${(4 + r() * 92).toFixed(1)}%`, top: `${(30 + r() * 62).toFixed(1)}%`,
    animationDuration: `${(4 + r() * 5).toFixed(1)}s`, animationDelay: `${(-r() * 8).toFixed(1)}s`,
    '--fx': `${Math.round((r() - 0.5) * 70)}px`, '--fy': `${Math.round(-20 - r() * 50)}px`,
  } as React.CSSProperties,
}))

/**
 * Gemeinsame Spielbühne für alle Screens: derselbe Waldhintergrund, Lichtstrahlen,
 * fallende Blütenblätter und Glühwürmchen – so sehen Lobby, Karte, Spiel und Einstellungen gleich aus.
 */
export function GameStage({ scene = 'forest', children, className, wide }: Props) {
  const reduceMotion = useSettingsStore(s => s.reduceMotion)
  return (
    <div className={`stage-root stage-root--${scene}${reduceMotion ? ' is-still' : ''}`}>
      <div className="stage-backdrop" aria-hidden />
      <div className={`stage${wide ? ' stage--wide' : ''}${className ? ` ${className}` : ''}`}>
        <div className="stage-bg" aria-hidden />
        <div className="stage-rays" aria-hidden />
        {!reduceMotion && (
          <div className="stage-ambient" aria-hidden>
            {PETALS.map(p => <span key={`p${p.i}`} className={`stage-petal stage-petal--${p.kind}`} style={p.style}><i /></span>)}
            {FIREFLIES.map(f => <span key={`f${f.i}`} className="stage-firefly" style={f.style} />)}
          </div>
        )}
        <div className="stage-content">{children}</div>
      </div>
    </div>
  )
}
