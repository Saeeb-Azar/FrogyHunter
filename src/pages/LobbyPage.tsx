import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { LobbyGameShell, LOBBY_BG_ONLY } from '../components/lobby/LobbyGameShell'
import { LobbyFrogMenu } from '../components/lobby/LobbyFrogMenu'
import { LobbyProfilePanelPlaceholder } from '../components/lobby/LobbyProfilePanelPlaceholder'
import { PageTransition } from '../components/ui/PageTransition'
import { resolveCurrentLevel } from '../lib/currentLevel'
import { isUserAdmin } from '../services/adminService'
import { getProgress } from '../services/progressService'
import { listPublishedLevels } from '../services/levelsService'
import type { Level, UserProgress } from '../types/models'

/** true = nur leere weiße Fläche; Level/Admin/Fortschritt werden weiter geladen, UI-Komponenten nicht gerendert. */
export const LOBBY_BLANK_UI = false

export function LobbyPage() {
  const { user } = useAuth()
  const [level, setLevel] = useState<Level | null | undefined>(undefined)
  const [admin, setAdmin] = useState(false)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [levelNumber, setLevelNumber] = useState(1)
  const [profileProgress, setProfileProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    if (!user) return
    void (async () => {
      try {
        const [r, isAdm, published] = await Promise.all([
          resolveCurrentLevel(user.uid),
          isUserAdmin(user.uid),
          listPublishedLevels(),
        ])
        setLoadErr(null)
        setLevel(r.level)
        setAdmin(isAdm)
        if (r.level) {
          const idx = published.findIndex((l) => l.id === r.level!.id)
          setLevelNumber(idx >= 0 ? idx + 1 : 1)
          setProfileProgress(await getProgress(user.uid, r.level.id))
        } else {
          setLevelNumber(1)
          setProfileProgress(null)
        }
      } catch (e) {
        console.error(e)
        setLoadErr('Daten konnten nicht geladen werden (Netzwerk/Firebase).')
        setLevel(null)
        setProfileProgress(null)
      }
    })()
  }, [user])

  return (
    <AppLayout
      mainClass={LOBBY_BLANK_UI ? 'app-main--lobby-blank' : 'app-main--fh app-main--lobby'}
      shellClass={LOBBY_BLANK_UI ? 'app-shell--lobby-blank' : 'app-shell--fh'}
      hideAmbient
    >
      <div className={`lobby-page-root${LOBBY_BLANK_UI ? ' lobby-page-root--blank' : ''}`}>
        {LOBBY_BLANK_UI ? (
          <div className="lobby-page-blank" aria-label="Lobby" />
        ) : (
          <>
            {/* fixed UI außerhalb motion: sonst falscher Bezug für position:fixed */}
            <PageTransition>
              <>
                {level === undefined &&
                  (LOBBY_BG_ONLY ? (
                    <div className="lobby-fh lobby-fh--bg-only" role="presentation">
                      <div className="lobby-fh__content lobby-fh__content--empty" />
                    </div>
                  ) : (
                    <div className="lobby-fh lobby-fh--loading">
                      <div className="spinner" />
                    </div>
                  ))}

                {level === null &&
                  (LOBBY_BG_ONLY ? (
                    <div className="lobby-fh lobby-fh--bg-only" role="presentation">
                      <div className="lobby-fh__content lobby-fh__content--empty" />
                    </div>
                  ) : (
                    <div className="lobby-fh lobby-fh--loading">
                      <div className="card card--pad" style={{ marginTop: '1rem' }}>
                        {loadErr ? (
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--danger)', margin: 0 }}>
                            {loadErr}
                          </p>
                        ) : (
                          <>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#14532d', margin: 0 }}>
                              Aktuell ist kein veröffentlichtes Level verfügbar.
                            </p>
                            <p className="muted" style={{ marginTop: '0.5rem' }}>
                              Schau später wieder rein – neue Level erscheinen regelmäßig.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </>
            </PageTransition>

            {user && level ? (
              <>
                <LobbyGameShell showAdminLink={admin} level={level} />
                <LobbyProfilePanelPlaceholder
                  level={level}
                  levelNumber={levelNumber}
                  progress={profileProgress}
                />
                <LobbyFrogMenu
                  levelImageUrl={level.imageUrl}
                  levelTitle={level.title}
                  frogCount={level.frogCount}
                />
              </>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  )
}
