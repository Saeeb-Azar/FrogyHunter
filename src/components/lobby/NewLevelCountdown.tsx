import { useEffect, useState } from 'react'
import { formatWednesdayCountdownDe, msUntilNextWednesdayBerlin } from '../../lib/wednesdayCountdownBerlin'

/** Live-Countdown bis zum nächsten Mittwoch 18:00 Europe/Berlin. */
export function NewLevelCountdown({ className = 'countdown' }: { className?: string }) {
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
    <span className={className} role="timer">
      {text}
    </span>
  )
}
