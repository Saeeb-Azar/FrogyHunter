import { useEffect, useState } from 'react'
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

export function PlayTimeBar({ startedAt, frozenDurationMs }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (frozenDurationMs != null) return
    if (startedAt == null) return
    const id = window.setInterval(() => setTick((t) => t + 1), 250)
    return () => clearInterval(id)
  }, [startedAt, frozenDurationMs])

  const ms =
    frozenDurationMs != null
      ? frozenDurationMs
      : startedAt != null
        ? Date.now() - startedAt
        : 0

  void tick

  return (
    <div className="play-time-bar" role="timer" aria-live="polite" aria-label={`Spielzeit ${fmt(ms)}`}>
      <div className="play-time-bar__inner">
        <img className="play-time-bar__plate" src={TIME_IMG} alt="" decoding="async" />
        <span className="play-time-bar__text">{fmt(ms)}</span>
      </div>
    </div>
  )
}
