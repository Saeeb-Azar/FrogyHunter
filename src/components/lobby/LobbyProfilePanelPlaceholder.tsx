import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { Level, UserProgress } from '../../types/models'

export interface LobbyProfilePanelPlaceholderProps {
  level: Level
  levelNumber: number
  progress: UserProgress | null
}

/**
 * Lvl-/Profil-Leiste oben links (`/assets/profile-panel.png`, mit Transparenz).
 * Profilbild im Rahmen links; Name, Level-Nr. und Frosch-Fortschritt rechts daneben.
 */
export function LobbyProfilePanelPlaceholder({
  level,
  levelNumber,
  progress,
}: LobbyProfilePanelPlaceholderProps) {
  const { user } = useAuth()
  const displayName = user?.displayName?.trim() || 'Spieler'

  const totalFrogs = level.frogCount
  const foundRaw = progress?.completed
    ? totalFrogs
    : (progress?.foundFroggys.length ?? 0)
  const found = totalFrogs > 0 ? Math.min(foundRaw, totalFrogs) : foundRaw
  const pct =
    totalFrogs <= 0 ? 0 : Math.min(100, Math.round((found / totalFrogs) * 100))

  return (
    <div className="lobby-profile-panel">
      <img src="/assets/profile-panel.png" alt="" width={1735} height={906} decoding="async" />
      <div
        className="lobby-profile-panel__avatar-slot"
        aria-label={user?.photoURL ? 'Profilbild' : 'Profilbild-Platzhalter'}
      >
        {user?.photoURL ? (
          <img
            className="lobby-profile-panel__avatar-img"
            src={user.photoURL}
            alt=""
            decoding="async"
          />
        ) : (
          <span className="lobby-profile-panel__avatar-placeholder" aria-hidden>
            🐸
          </span>
        )}
      </div>

      <div className="lobby-profile-panel__meta">
        <div className="lobby-profile-panel__name-row">
          <span className="lobby-profile-panel__name">{displayName}</span>
          <Link
            to="/settings"
            className="lobby-profile-panel__edit"
            aria-label="Profil bearbeiten"
            title="Einstellungen"
          >
            <span className="lobby-profile-panel__edit-icon" aria-hidden>
              ✎
            </span>
          </Link>
        </div>
        <p className="lobby-profile-panel__level">Level {levelNumber}</p>
        <div className="lobby-profile-panel__xp-row">
          <div
            className="lobby-profile-panel__xp-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-valuetext={
              totalFrogs > 0 ? `${found} von ${totalFrogs} Fröschen` : 'Keine Frösche in diesem Level'
            }
          >
            <div className="lobby-profile-panel__xp-fill" style={{ width: `${pct}%` }} />
            <span className="lobby-profile-panel__xp-label">
              {totalFrogs > 0 ? `${found} / ${totalFrogs}` : '—'}
            </span>
          </div>
          <span className="lobby-profile-panel__xp-badge" aria-hidden>
            ★
          </span>
        </div>
      </div>
    </div>
  )
}
