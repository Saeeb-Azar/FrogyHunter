import type { CSSProperties } from 'react'

const FS_IMG = `${import.meta.env.BASE_URL}assets/ui/fullscreen.png`

interface Props {
  /** Kachel-Fokus: größere Kachel + Milchglas drumherum (kein Browser-Vollbild). */
  active: boolean
  onToggle: () => void
  /** z. B. fixed + Position von PlayTileFocusButton (über Frosch-Leiste). */
  wrapperStyle?: CSSProperties
}

export function PlayFullscreenCorner({ active, onToggle, wrapperStyle }: Props) {
  return (
    <div
      className={`play-fullscreen-corner${active ? ' play-fullscreen-corner--active' : ''}`}
      style={wrapperStyle}
    >
      <button
        type="button"
        className="play-fullscreen-corner__btn"
        aria-label={active ? 'Kachel-Ansicht schließen' : 'Kachel vergrößern (Fokus auf die Mitte)'}
        aria-pressed={active}
        onClick={onToggle}
      >
        <img className="play-fullscreen-corner__img" src={FS_IMG} alt="" decoding="async" />
      </button>
    </div>
  )
}
