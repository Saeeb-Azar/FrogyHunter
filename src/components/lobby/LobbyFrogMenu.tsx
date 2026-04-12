import { Link } from 'react-router-dom'

const BTN = {
  spielen: '/assets/ui/btn_spielen.png',
  historie: '/assets/ui/btn_historie.png',
  einstellungen: '/assets/ui/btn_einstellungen.png',
  infos: '/assets/ui/btn_infos.png',
} as const

const PLAY_PHONE = '/assets/ui/extra-phone/play-button.png' as const
const LVL_SHOW_PHONE = '/assets/ui/extra-phone/lvl-show.png' as const

/** Intrinsische Maße der Button-PNGs (Ordner „Design ohne Titel (4)“) */
const BTN_IMG_W = 3470
const BTN_IMG_H = 1812

export interface LobbyFrogMenuProps {
  /** Szene des aktuellen Levels (wie Desktop-Kachel) */
  levelImageUrl: string
  levelTitle: string
  frogCount: number
}

/** Vier Kacheln (rechts, Höhe wie Profil-/Lvl-Leiste); große Holztafel kommt aus LobbyGameShell. */
export function LobbyFrogMenu({ levelImageUrl, levelTitle, frogCount }: LobbyFrogMenuProps) {
  const hasScene = Boolean(levelImageUrl?.trim())

  return (
    <nav className="lobby-frog-menu" aria-label="Hauptmenü">
      <div className="lobby-frog-menu__buttons">
        <div className="lobby-frog-menu__grid">
          <Link
            to="/play"
            className="lobby-frog-menu__hit lobby-frog-menu__hit--spielen"
            aria-label="Spielen"
          >
            <img src={BTN.spielen} alt="" width={BTN_IMG_W} height={BTN_IMG_H} decoding="async" />
          </Link>
          <Link to="/history" className="lobby-frog-menu__hit" aria-label="Historie">
            <img src={BTN.historie} alt="" width={BTN_IMG_W} height={BTN_IMG_H} decoding="async" />
          </Link>
          <Link to="/settings" className="lobby-frog-menu__hit" aria-label="Einstellungen">
            <img src={BTN.einstellungen} alt="" width={BTN_IMG_W} height={BTN_IMG_H} decoding="async" />
          </Link>
          <Link to="/info" className="lobby-frog-menu__hit" aria-label="Infos">
            <img src={BTN.infos} alt="" width={BTN_IMG_W} height={BTN_IMG_H} decoding="async" />
          </Link>
        </div>
        <Link
          to="/play"
          className="lobby-frog-menu__phone-play"
          aria-label="Spielen"
        >
          <img src={PLAY_PHONE} alt="" decoding="async" />
        </Link>
        <div className="lobby-frog-menu__lvl-show">
          <div className="lobby-frog-menu__lvl-show-board">
            <img src={LVL_SHOW_PHONE} alt="" decoding="async" />
            <div className="lobby-frog-menu__lvl-placeholder">
              {hasScene ? (
                <img
                  className="lobby-frog-menu__lvl-placeholder-img"
                  src={levelImageUrl}
                  alt={levelTitle}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span
                  className="lobby-frog-menu__lvl-placeholder-fallback"
                  role="img"
                  aria-label={`Kein Vorschaubild — ${levelTitle}`}
                >
                  🐸
                </span>
              )}
            </div>
          </div>
          <p className="lobby-frog-menu__lvl-froggies-line" role="status">
            <span className="lobby-frog-menu__lvl-froggies-count">{frogCount}</span> versteckte Froggies
          </p>
        </div>
      </div>
    </nav>
  )
}
