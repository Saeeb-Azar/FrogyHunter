import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AmbientBackground } from './AmbientBackground'

interface Props {
  children: ReactNode
  showBack?: boolean
  backTo?: string
  /** Zusätzliche Klassen für die Hauptspalte (z. B. game-home Lobby). */
  mainClass?: string
  /** Zusätzliche Klassen für die äußere Shell. */
  shellClass?: string
  /** Vollbild-Lobby mit eigenem Hintergrund – Standard-Himmel ausblenden. */
  hideAmbient?: boolean
}

export function AppLayout({ children, showBack, backTo = '/', mainClass, shellClass, hideAmbient }: Props) {
  return (
    <div className={`app-shell${shellClass ? ` ${shellClass}` : ''}`}>
      {!hideAmbient && <AmbientBackground />}
      <div className={`app-main${mainClass ? ` ${mainClass}` : ''}`}>
        {showBack && (
          <div className="nav-back">
            <Link to={backTo} className="btn btn--ghost btn--sm">
              ← Zurück
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
