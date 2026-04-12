const ZOOM_IMG = `${import.meta.env.BASE_URL}assets/ui/zoom.png`

interface Props {
  active: boolean
  onToggle: () => void
}

export function PlayZoomCorner({ active, onToggle }: Props) {
  return (
    <div className={`play-zoom-corner${active ? ' play-zoom-corner--active' : ''}`}>
      <button type="button" className="play-zoom-corner__btn" aria-label={active ? 'Zoom aus' : 'Zoom ein'} aria-pressed={active} onClick={onToggle}>
        <img className="play-zoom-corner__img" src={ZOOM_IMG} alt="" decoding="async" />
      </button>
    </div>
  )
}
