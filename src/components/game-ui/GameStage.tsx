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

const PETALS = Array.from({ length: 14 }, (_, i) => i)
const FIREFLIES = Array.from({ length: 10 }, (_, i) => i)

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
            {PETALS.map(i => <span key={`p${i}`} className="stage-petal" style={{ '--i': i } as React.CSSProperties} />)}
            {FIREFLIES.map(i => <span key={`f${i}`} className="stage-firefly" style={{ '--i': i } as React.CSSProperties} />)}
          </div>
        )}
        <div className="stage-content">{children}</div>
      </div>
    </div>
  )
}
