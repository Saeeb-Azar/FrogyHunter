import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'
import { PlayFullscreenCorner } from './PlayFullscreenCorner'

interface Props {
  imgRef: RefObject<HTMLImageElement | null>
  active: boolean
  onToggle: () => void
}

/**
 * Kachel-Fokus-Button: außerhalb von .play-center-pic (z-index über Frosch-Leiste).
 * Offsets skalieren auf schmalen Viewports (Mobile-First), damit der Button auf der Kachel bleibt.
 */
export function PlayTileFocusButton({ imgRef, active, onToggle }: Props) {
  const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({
    visibility: 'hidden',
    pointerEvents: 'none',
  })

  useLayoutEffect(() => {
    const img = imgRef.current
    if (!img) return

    const update = () => {
      const r = img.getBoundingClientRect()
      if (r.width < 16 || r.height < 16) {
        setWrapperStyle({ visibility: 'hidden', pointerEvents: 'none' })
        return
      }
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const k = Math.min(1, window.innerWidth / 620)
      const OFFSET_X = (300 + (active ? 55 : 0)) * k
      const OFFSET_Y = (205 + (active ? 45 : 0)) * k
      setWrapperStyle({
        position: 'fixed',
        left: cx + OFFSET_X,
        top: cy + OFFSET_Y,
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        zIndex: 120,
        visibility: 'visible',
        pointerEvents: 'auto',
      })
    }

    update()
    const rafId = requestAnimationFrame(update)
    img.addEventListener('load', update)
    const ro = new ResizeObserver(update)
    ro.observe(img)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(rafId)
      img.removeEventListener('load', update)
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [imgRef, active])

  return <PlayFullscreenCorner active={active} onToggle={onToggle} wrapperStyle={wrapperStyle} />
}
