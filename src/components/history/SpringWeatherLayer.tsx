import { useMemo } from 'react'

type Particle = {
  id: number
  left: number
  delay: number
  duration: number
  drift: number
  size: number
  kind: 'petal' | 'pollen'
}

const PARTICLE_COUNT = 32

export function SpringWeatherLayer() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * -12,
        duration: 10 + Math.random() * 16,
        drift: -24 + Math.random() * 48,
        size: 6 + Math.random() * 10,
        kind: Math.random() > 0.45 ? 'petal' : 'pollen',
      })),
    []
  )

  return (
    <>
      <div className="spring-light-beams" />
      <div className="spring-glow-spots" />
      <div className="spring-weather-layer" aria-hidden>
        {particles.map((particle) => (
          <span
            key={particle.id}
            className={`spring-particle spring-particle--${particle.kind}`}
            style={
              {
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                '--drift': `${particle.drift}px`,
                '--size': `${particle.size}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  )
}
