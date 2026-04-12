import { MAP_SNAKE_PATH } from './mapSnake'

interface Props {
  parallaxY: number
}

export function MapBackground({ parallaxY }: Props) {
  return (
    <div
      className="map-background map-background--procedural"
      style={{ transform: `translateY(${-parallaxY * 0.18}px)` }}
    >
      <svg
        className="map-snake-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="mapGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8f0ff" />
            <stop offset="35%" stopColor="#e2ffe8" />
            <stop offset="100%" stopColor="#a8e86e" />
          </linearGradient>
          <linearGradient id="mapRoad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#c9a06e" />
            <stop offset="55%" stopColor="#e8c9a0" />
            <stop offset="100%" stopColor="#f2dcc0" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#mapGrass)" />
        {/* Rand / Gras unter dem Weg */}
        <path
          d={MAP_SNAKE_PATH}
          fill="none"
          stroke="rgba(90, 140, 75, 0.45)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sandweg */}
        <path
          d={MAP_SNAKE_PATH}
          fill="none"
          stroke="url(#mapRoad)"
          strokeWidth={6.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Mittellinie (cartoon) */}
        <path
          d={MAP_SNAKE_PATH}
          fill="none"
          stroke="rgba(255, 248, 230, 0.55)"
          strokeWidth={0.9}
          strokeDasharray="2 3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
