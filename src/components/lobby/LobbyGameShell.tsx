import { Link } from 'react-router-dom'
import { publicUrl } from '../../lib/publicUrl'
import { useSettingsStore } from '../../stores/settingsStore'
import type { Level } from '../../types/models'
import { WoodKachelPicture } from '../ui/WoodKachelPicture'
import { NewLevelCountdown } from './NewLevelCountdown'

/** true = nur Hintergrund; false = Level-Holztafel + Shell (Kacheln kommen aus LobbyFrogMenu) */
export const LOBBY_BG_ONLY = false

/** Vier große Menü-Kacheln im Shell (sonst nur LobbyFrogMenu) */
const LOBBY_SHOW_SHELL_NAV = false

/** Logo + Tagline oben mittig (wie Konzept) */
const LOBBY_SHOW_LOGO = true

/** Musik / Sound / Einstellungen oben rechts */
const LOBBY_SHOW_UTILS = true

/** Footer mit Event-/Community-Schildern (alte Kit-Grafiken entfernt) */
const LOBBY_SHOW_SHELL_FOOTER = false

/** Nur für LOBBY_SHOW_SHELL_NAV — `public/assets/ui/btn_*.png` */
const SHELL_NAV_IMG = {
  btnSpielen: publicUrl('assets/ui/btn_spielen.png'),
  btnHistorie: publicUrl('assets/ui/btn_historie.png'),
  btnEinstellungen: publicUrl('assets/ui/btn_einstellungen.png'),
  btnInfos: publicUrl('assets/ui/btn_infos.png'),
} as const

/** Holzschild unten links (Platzhalter-Fläche; Grafik ohne Text: `new_lvl.png` austauschen) */
const LOBBY_NEW_LVL_BOARD = publicUrl('assets/ui/new_lvl.png')

function UtilSvgMusic() {
  return (
    <svg className="lobby-fh__util-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
      />
    </svg>
  )
}

function UtilSvgSound() {
  return (
    <svg className="lobby-fh__util-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a3.5 3.5 0 0 0-2.5-3.35v6.7A3.5 3.5 0 0 0 16.5 12zM14 3.23v2.06c3.38.86 6 3.94 6 7.71s-2.62 6.85-6 7.71v2.06c4.47-.9 8-4.72 8-9.77 0-5.05-3.53-8.87-8-9.77z"
      />
    </svg>
  )
}

function UtilSvgSettings() {
  return (
    <svg className="lobby-fh__util-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96c-.5-.38-1.05-.7-1.65-.94l-.36-2.54a.5.5 0 0 0-.5-.43h-3.84a.5.5 0 0 0-.49.43l-.36 2.54c-.6.24-1.15.56-1.65.94l-2.39-.96a.5.5 0 0 0-.6.22L4.26 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.38 1.05.7 1.65.94l.36 2.54a.5.5 0 0 0 .49.43h3.84a.5.5 0 0 0 .49-.43l.36-2.54c.6-.24 1.15-.56 1.65-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
      />
    </svg>
  )
}

function LobbyUtilsBar() {
  const musicEnabled = useSettingsStore((s) => s.musicEnabled)
  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled)
  const setMusic = useSettingsStore((s) => s.setMusic)
  const setSfx = useSettingsStore((s) => s.setSfx)
  return (
    <div className="lobby-fh__utils-wrap">
      <div className="lobby-fh__utils-hit" role="group" aria-label="Audio & Einstellungen">
        <button
          type="button"
          className={`lobby-fh__util-hit ${!musicEnabled ? 'is-off' : ''}`}
          onClick={() => setMusic(!musicEnabled)}
          aria-pressed={musicEnabled}
          title="Musik"
        >
          <UtilSvgMusic />
        </button>
        <button
          type="button"
          className={`lobby-fh__util-hit ${!sfxEnabled ? 'is-off' : ''}`}
          onClick={() => setSfx(!sfxEnabled)}
          aria-pressed={sfxEnabled}
          title="Sound"
        >
          <UtilSvgSound />
        </button>
        <Link to="/settings" className="lobby-fh__util-hit" aria-label="Einstellungen" title="Einstellungen">
          <UtilSvgSettings />
        </Link>
      </div>
    </div>
  )
}

export interface LobbyGameShellProps {
  showAdminLink: boolean
  level: Level
}

function LobbyGameShellFull({ showAdminLink, level }: LobbyGameShellProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)

  return (
    <div className={`lobby-fh${!LOBBY_SHOW_SHELL_NAV ? ' lobby-fh--floating-level' : ''}`}>
      <div className="lobby-fh__bg" aria-hidden />

      {!LOBBY_SHOW_SHELL_NAV && (
        <div className="lobby-fh__newlvl-board" role="region" aria-label="Neues Level">
          <div className="lobby-fh__newlvl-inner">
            <img src={LOBBY_NEW_LVL_BOARD} alt="" decoding="async" />
            <div className="lobby-fh__newlvl-copy">
              <p className="lobby-fh__newlvl-title">NEUES LEVEL</p>
              <p className="lobby-fh__newlvl-sub">JEDEN MITTWOCH</p>
              <NewLevelCountdown />
            </div>
          </div>
        </div>
      )}

      <div className="lobby-fh__content">
        {LOBBY_SHOW_LOGO && (
          <div className="lobby-fh__top-logo">
            <div className="lobby-fh__logo-block">
              <span className="lobby-fh__logo-text">FROGGY HUNT</span>
              <p className="lobby-fh__logo-tagline">FINDE SIE ALLE!</p>
            </div>
          </div>
        )}

        {LOBBY_SHOW_UTILS && (
          <div className="lobby-fh__top-utils">
            <LobbyUtilsBar />
          </div>
        )}

        <div
          className={`lobby-fh__mid${!LOBBY_SHOW_SHELL_NAV ? ' lobby-fh__mid--no-nav lobby-fh__mid--floating-level' : ''}`}
        >
          <aside
            className={`lvl-card-root lvl-card-root--graphic-only${reduceMotion ? ' lvl-card-root--reduce-motion' : ''}`}
            aria-label="Level-Karte"
          >
            <div
              className={
                !reduceMotion ? 'lvl-card-root__breathe-wrap lvl-card-root--animate' : 'lvl-card-root__breathe-wrap'
              }
            >
              <WoodKachelPicture
                pictureClassName="lvl-card-root__picture"
                imgClassName="lvl-card-root__wood"
              />
            </div>
            <p className="lvl-card-root__header-label">AKTUELLES LEVEL</p>
            <div className="lvl-card-root__preview-stack">
              <p className="lvl-card-root__level-title">{level.title.toUpperCase()}</p>
              <div className="lvl-card-root__preview" role="presentation">
                {level.imageUrl ? (
                  <img
                    className="lvl-card-root__preview-img"
                    src={level.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="lvl-card-root__preview-placeholder" aria-hidden>
                    🐸
                  </span>
                )}
              </div>
              <p className="lvl-card-root__frog-count" role="status">
                <span className="lvl-card-root__frog-count-num">{level.frogCount}</span>
                <span className="lvl-card-root__frog-count-icon" aria-hidden>
                  🐸
                </span>
                <span className="lvl-card-root__frog-count-label">VERSTECKTE FROGGYS</span>
              </p>
            </div>
            <Link to="/play" className="lvl-card-root__cta">
              <span className="lvl-card-root__cta-label">WEITER SPIELEN</span>
              <span className="lvl-card-root__cta-icon" aria-hidden>
                <span className="lvl-card-root__cta-arrow">→</span>
              </span>
            </Link>
          </aside>

          {LOBBY_SHOW_SHELL_NAV && (
            <nav className="lobby-fh__nav" aria-label="Hauptmenü">
              <Link to="/play" className="lobby-fh__nav-link" aria-label="Spielen">
                <img className="lobby-fh__nav-img" src={SHELL_NAV_IMG.btnSpielen} alt="" />
              </Link>
              <Link to="/history" className="lobby-fh__nav-link" aria-label="Historie">
                <img className="lobby-fh__nav-img" src={SHELL_NAV_IMG.btnHistorie} alt="" />
              </Link>
              <Link to="/settings" className="lobby-fh__nav-link" aria-label="Einstellungen">
                <img className="lobby-fh__nav-img" src={SHELL_NAV_IMG.btnEinstellungen} alt="" />
              </Link>
              <Link to="/info" className="lobby-fh__nav-link" aria-label="Infos">
                <img className="lobby-fh__nav-img" src={SHELL_NAV_IMG.btnInfos} alt="" />
              </Link>
            </nav>
          )}
        </div>

        {LOBBY_SHOW_SHELL_FOOTER && (
          <footer className="lobby-fh__footer">
            <div className="lobby-fh__sign-wrap">
              <div className="lobby-fh__sign-countdown" aria-live="polite">
                —
              </div>
            </div>
          </footer>
        )}

        {showAdminLink && (
          <div className="lobby-fh__admin">
            <Link to="/admin" className="lobby-fh__admin-link">
              Admin
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export function LobbyGameShell(props: LobbyGameShellProps) {
  if (LOBBY_BG_ONLY) {
    return (
      <div className="lobby-fh lobby-fh--bg-only" role="presentation">
        <div className="lobby-fh__content lobby-fh__content--empty" />
      </div>
    )
  }
  return <LobbyGameShellFull {...props} />
}
