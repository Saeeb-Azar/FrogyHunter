const PAUSE_IMG = '/assets/ui/pause.png'

export function PlayPauseCorner() {
  return (
    <div className="play-pause-corner">
      <button type="button" className="play-pause-corner__btn" aria-label="Pause">
        <img className="play-pause-corner__img" src={PAUSE_IMG} alt="" decoding="async" />
      </button>
    </div>
  )
}
