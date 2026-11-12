import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { currentSeason, type Season } from '../../lib/season'
import { useSettingsStore } from '../../stores/settingsStore'

export type StageScene = 'lobby' | 'forest' | 'play'

interface Props {
  scene?: StageScene
  children: ReactNode
  className?: string
  /** Breitere Bühne (Spielansicht / Admin) */
  wide?: boolean
}

/** Deterministischer Zufall, damit die Verteilung natürlich wirkt, aber nicht bei jedem Render springt. */
function rand(seed: number) {
  let t = seed + 0x6d2b79f5
  return () => { t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
type Kind = 'pink' | 'blossom' | 'leaf' | 'gold' | 'maple' | 'oak' | 'snow' | 'flake'
/** Was je Jahreszeit vom Himmel fällt */
const SEASON_KINDS: Record<Season, Kind[]> = {
  spring: ['pink', 'pink', 'pink', 'blossom', 'blossom', 'leaf'],
  summer: ['leaf', 'leaf', 'gold', 'pink'],
  autumn: ['maple', 'maple', 'oak', 'oak', 'gold', 'maple'],
  winter: ['snow', 'snow', 'snow', 'snow', 'flake'],
}
const SEASON_COUNT: Record<Season, number> = { spring: 18, summer: 10, autumn: 22, winter: 46 }
function makeParticles(season: Season) {
  const r = rand(42)
  const kinds = SEASON_KINDS[season]
  const snow = season === 'winter'
  return Array.from({ length: SEASON_COUNT[season] }, (_, i) => {
    const dur = snow ? 10 + r() * 12 : 9 + r() * 10
    return {
      i, kind: kinds[Math.floor(r() * kinds.length)],
      style: {
        left: `${(r() * 110 - 5).toFixed(1)}%`,
        animationDuration: `${dur.toFixed(1)}s, ${(2.4 + r() * 2.2).toFixed(1)}s`,
        animationDelay: `${(-r() * dur).toFixed(1)}s, ${(-r() * 3).toFixed(1)}s`,
        '--sway': `${Math.round((snow ? 8 : 18) + r() * (snow ? 24 : 50))}px`,
        '--drift': `${Math.round((r() - 0.5) * (snow ? 60 : 120))}px`,
        '--size': (snow ? 0.4 + r() * 1.1 : 0.6 + r() * 0.9).toFixed(2),
        '--spin': `${Math.round((r() > 0.5 ? 1 : -1) * (240 + r() * 500))}deg`,
      } as React.CSSProperties,
    }
  })
}
const r = rand(7)
const FIREFLIES = Array.from({ length: 12 }, (_, i) => ({
  i,
  style: {
    left: `${(4 + r() * 92).toFixed(1)}%`, top: `${(30 + r() * 62).toFixed(1)}%`,
    animationDuration: `${(4 + r() * 5).toFixed(1)}s`, animationDelay: `${(-r() * 8).toFixed(1)}s`,
    '--fx': `${Math.round((r() - 0.5) * 70)}px`, '--fy': `${Math.round(-20 - r() * 50)}px`,
  } as React.CSSProperties,
}))

/**
 * Gemeinsame Spielbühne für alle Screens: derselbe Waldhintergrund, Lichtstrahlen,
 * Jahreszeiten-Effekte (Blüten, Sommer, Herbstlaub, Schnee) und Glühwürmchen – so sehen alle Screens gleich aus.
 */
export function GameStage({ scene = 'forest', children, className, wide }: Props) {
  const reduceMotion = useSettingsStore(s => s.reduceMotion)
  const season = useMemo(() => currentSeason(), [])
  const particles = useMemo(() => makeParticles(season), [season])
  return (
    <div className={`stage-root stage-root--${scene} season-${season}${reduceMotion ? ' is-still' : ''}`}>
      <div className="stage-backdrop" aria-hidden />
      <div className={`stage${wide ? ' stage--wide' : ''}${className ? ` ${className}` : ''}`}>
        <div className="stage-bg" aria-hidden />
        <div className="stage-season" aria-hidden />
        <div className="stage-rays" aria-hidden />
        {!reduceMotion && (
          <div className="stage-ambient" aria-hidden>
            {particles.map(p => <span key={`p${p.i}`} className={`stage-petal stage-petal--${p.kind}`} style={p.style}><i /></span>)}
            {season !== 'winter' && FIREFLIES.map(f => <span key={`f${f.i}`} className="stage-firefly" style={f.style} />)}
          </div>
        )}
        <div className="stage-content">{children}</div>
      </div>
    </div>
  )
}
