import { useMemo } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

/** Sehr dezente „Moossporen“ – nur wenn Motion erlaubt. */
export function AmbientParticles() {
  const reduce = useSettingsStore((s) => s.reduceMotion)

  const bits = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        key: i,
        left: ((i * 41 + 7) % 100) + (i % 3) * 0.4,
        top: ((i * 29 + 13) % 100) + ((i * 5) % 7) * 0.3,
        delay: (i % 14) * 0.7,
        dur: 14 + (i % 5) * 2,
        size: 1.5 + (i % 4) * 0.45,
        opacity: 0.12 + (i % 4) * 0.04,
      })),
    []
  )

  if (reduce) return null

  return (
    <div className="ambient-dust" aria-hidden>
      {bits.map((b) => (
        <span
          key={b.key}
          className="ambient-dust__bit"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
