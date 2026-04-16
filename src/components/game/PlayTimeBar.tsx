import { memo, useEffect, useState } from 'react'
import { publicUrl } from '../../lib/publicUrl'

const TIME_IMG = publicUrl('assets/ui/time.png')

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  const rs = s % 60
  return `${m}:${rs.toString().padStart(2, '0')}`
}

interface Props {
  startedAt: number | null
  /** Nach Abschluss: eingefrorene Anzeige */
  frozenDurationMs?: number | null
}

function computeMs(startedAt: number | null, frozenDurationMs: number | null | undefined) {
  if (frozenDurationMs != null) return frozenDurationMs
  if (startedAt != null) return Date.now() - startedAt
  return 0
}

function PlayTimeBarImpl({ startedAt, frozenDurationMs }: Props) {
  const [liveDisplay, setLiveDisplay] = useState(() => fmt(computeMs(startedAt, null)))

  useEffect(() => {
    if (frozenDurationMs != null || startedAt == null) return

    let raf = 0
    let last = ''
    const loop = () => {
      const next = fmt(Date.now() - startedAt)
      if (next !== last) {
        last = next
        setLiveDisplay(next)
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [startedAt, frozenDurationMs])

  const display = frozenDurationMs != null ? fmt(frozenDurationMs) : liveDisplay

  return (
    <div className="play-time-bar" role="timer" aria-live="polite" aria-label={`Spielzeit ${display}`}>
      <div className="play-time-bar__inner">
        <img className="play-time-bar__plate" src={TIME_IMG} alt="" decoding="async" />
        <span className="play-time-bar__text">{display}</span>
      </div>
    </div>
  )
}

export const PlayTimeBar = memo(PlayTimeBarImpl)
