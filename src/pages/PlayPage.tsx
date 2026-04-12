import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PlayCenterPic } from '../components/game/PlayCenterPic'
import { PlayTileFocusButton } from '../components/game/PlayTileFocusButton'
import { PlayView } from '../components/game/PlayView'
import { AppLayout } from '../components/layout/AppLayout'
import { UserBar } from '../components/layout/UserBar'
import { PageTransition } from '../components/ui/PageTransition'
import { resolveCurrentLevel } from '../lib/currentLevel'
import { getMarkers } from '../services/markersService'
import type { FrogMarker, Level } from '../types/models'

/** true = nur Hintergrundbild, kein Spiel-UI; Level/Marker laden weiter im Hintergrund. */
export const PLAY_BLANK_UI = false

/** true = Hintergrund (game_ui) + nur untere Frosch-Leiste; Rest kommt später. */
export const PLAY_BOTTOM_BAR_ONLY = true

export function PlayPage() {
  const { user } = useAuth()
  const playPicImgRef = useRef<HTMLImageElement>(null)
  const [tileFocus, setTileFocus] = useState(false)
  const [level, setLevel] = useState<Level | null>(null)
  const [markers, setMarkers] = useState<FrogMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    void (async () => {
      try {
        setLoading(true)
        const r = await resolveCurrentLevel(user.uid)
        if (!r.level) {
          setLevel(null)
          setMarkers([])
          setError(null)
          return
        }
        setLevel(r.level)
        const m = await getMarkers(r.level.id)
        setMarkers(m)
        if (!m.length) setError('Für dieses Level sind keine Fundstellen hinterlegt.')
        else setError(null)
      } catch {
        setError('Level konnte nicht geladen werden.')
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  useEffect(() => {
    if (!tileFocus) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTileFocus(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tileFocus])

  const playChromeBlank = PLAY_BLANK_UI || PLAY_BOTTOM_BAR_ONLY

  return (
    <AppLayout
      showBack={!playChromeBlank}
      backTo="/"
      mainClass={playChromeBlank ? 'app-main--play-blank' : undefined}
      shellClass={playChromeBlank ? 'app-shell--play-blank' : undefined}
      hideAmbient={playChromeBlank}
    >
      {PLAY_BLANK_UI ? (
        <div className="play-page-blank" aria-label="Spiel" />
      ) : PLAY_BOTTOM_BAR_ONLY ? (
        <>
          {tileFocus ? <div className="play-tile-focus-backdrop" aria-hidden /> : null}
          <PlayCenterPic ref={playPicImgRef} tileFocus={tileFocus} />
          <PlayTileFocusButton
            imgRef={playPicImgRef}
            active={tileFocus}
            onToggle={() => setTileFocus((v) => !v)}
          />
          {/* HUD auch wenn noch keine Marker (sonst keine Eck-Icons) */}
          {!loading && level && user && (
            <PlayView bottomBarOnly level={level} markers={markers} uid={user.uid} playPicImgRef={playPicImgRef} />
          )}
        </>
      ) : (
        <>
          <UserBar />
          <PageTransition>
            {loading && <div className="spinner" />}
            {!loading && !level && (
              <div className="empty-state card card--pad">
                <p>Kein aktives Level.</p>
                <Link to="/" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                  Zur Lobby
                </Link>
              </div>
            )}
            {!loading && level && (
              <>
                <h2 className="h2" style={{ marginBottom: '0.25rem' }}>
                  {level.title}
                </h2>
                {error && (
                  <p className="badge badge--warn" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                    {error}
                  </p>
                )}
                {user && <PlayView level={level} markers={markers} uid={user.uid} />}
              </>
            )}
          </PageTransition>
        </>
      )}
    </AppLayout>
  )
}
