import { useEffect, useState } from 'react'
import { formatWednesdayCountdownDe, msUntilNextWednesdayBerlin } from '../../lib/wednesdayCountdownBerlin'

/** Live-Countdown bis zum nächsten Mittwoch 00:00 Europe/Berlin. */
export function NewLevelCountdown() {
  const [text, setText] = useState(() => formatWednesdayCountdownDe(msUntilNextWednesdayBerlin()))

  useEffect(() => {
    const tick = () => {
      setText(formatWednesdayCountdownDe(msUntilNextWednesdayBerlin()))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <p className="lobby-fh__newlvl-countdown" aria-live="polite" aria-atomic="true">
      {text}
    </p>
  )
}
