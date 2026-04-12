import { forwardRef } from 'react'

const PLAY_PIC = `${import.meta.env.BASE_URL}assets/ui/play_pic.png`

interface Props {
  /** Größere Kachel + Milchglas (gesteuert von PlayPage). */
  tileFocus?: boolean
}

/** Illustration mittig im Viewport (Play-Ansicht). */
export const PlayCenterPic = forwardRef<HTMLImageElement, Props>(function PlayCenterPic({ tileFocus = false }, ref) {
  return (
    <div className={`play-center-pic${tileFocus ? ' play-center-pic--tile-focus' : ''}`} aria-hidden>
      <div className="play-center-pic__tile-wrap">
        <img ref={ref} className="play-center-pic__img" src={PLAY_PIC} alt="" decoding="async" />
        <div className="play-center-pic__photo-placeholder" aria-hidden>
          <span className="play-center-pic__photo-placeholder-inner">Bild folgt</span>
        </div>
      </div>
    </div>
  )
})
