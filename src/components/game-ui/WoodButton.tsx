import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Icon = 'back' | 'music' | 'sound' | 'hint' | 'home' | 'map' | 'close' | 'lock' | 'replay'

const PATHS: Record<Icon, string> = {
  back: 'M15.5 4.5 8 12l7.5 7.5',
  home: 'M4 11.5 12 4.5l8 7M6.5 10v9.5h4v-5h3v5h4V10',
  map: 'M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2zM9 4.5v13M15 6.5v13',
  close: 'M6 6l12 12M18 6 6 18',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z',
  replay: 'M5 12a7 7 0 1 0 2.1-5M5 4v4h4',
  hint: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  music: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 9 18zm10-2a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 19 16z',
  sound: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11',
}

export function WoodIcon({ icon }: { icon: Icon }) {
  return (
    <svg viewBox="0 0 24 24" className="wood-icon" aria-hidden>
      <path d={PATHS[icon]} />
    </svg>
  )
}

interface BtnProps {
  icon: Icon
  label: string
  onClick?: () => void
  to?: string
  off?: boolean
  pressed?: boolean
  badge?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md'
}

/** Runder Holz-Knopf im Stil von pause.png / zoom.png (für Icons ohne eigene Grafik). */
export function WoodRoundButton({ icon, label, onClick, to, off, pressed, badge, disabled, size = 'md' }: BtnProps) {
  const cls = `wood-round wood-round--${size}${off ? ' is-off' : ''}`
  const inner = <><WoodIcon icon={icon} />{off && <span className="wood-round__slash" aria-hidden />}{badge != null && <span className="wood-round__badge">{badge}</span>}</>
  if (to) return <Link to={to} className={cls} aria-label={label} title={label}>{inner}</Link>
  return <button type="button" className={cls} onClick={onClick} aria-label={label} title={label} aria-pressed={pressed} disabled={disabled}>{inner}</button>
}

/** Rundknopf mit Original-Grafik (pause / zoom / fullscreen). */
export function AssetRoundButton({ src, label, onClick, disabled, badge, active }: { src: string; label: string; onClick?: () => void; disabled?: boolean; badge?: ReactNode; active?: boolean }) {
  return (
    <button type="button" className={`asset-round${active ? ' is-active' : ''}`} onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      <img src={src} alt="" draggable={false} />
      {badge != null && <span className="wood-round__badge">{badge}</span>}
    </button>
  )
}
