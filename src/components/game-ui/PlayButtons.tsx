import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ASSET } from '../../lib/gameAssets'

interface PlayProps {
  to?: string
  onClick?: () => void
  label?: string
  disabled?: boolean
  className?: string
  /** Kleines Holzschild über dem Button (z. B. „Weitersuchen“) */
  ribbon?: string
}

/** Der grüne Original-SPIELEN-Button (extra-phone/play-button.png) mit Puls und Glanz. */
export function PlayAssetButton({ to, onClick, label = 'Spielen', disabled, className, ribbon }: PlayProps) {
  const cls = `play-asset${disabled ? ' is-disabled' : ''}${className ? ` ${className}` : ''}`
  const inner = <>
    {ribbon && <span className="play-asset__ribbon">{ribbon}</span>}
    <img src={ASSET.playButton} alt="" draggable={false} />
    <span className="play-asset__shine" aria-hidden />
  </>
  if (to && !disabled) return <Link to={to} className={cls} aria-label={label}>{inner}</Link>
  return <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-label={label}>{inner}</button>
}

interface StoneProps {
  children: ReactNode
  to?: string
  onClick?: () => void
  disabled?: boolean
  tone?: 'green' | 'wood' | 'gold'
  size?: 'md' | 'lg' | 'sm'
  type?: 'button' | 'submit'
  className?: string
}

/** Text-Button im gleichen Stein-/Ranken-Stil wie der SPIELEN-Button – für alle übrigen Aktionen. */
export function StoneButton({ children, to, onClick, disabled, tone = 'green', size = 'md', type = 'button', className }: StoneProps) {
  const cls = `stone-btn stone-btn--${tone} stone-btn--${size}${className ? ` ${className}` : ''}`
  const inner = <span className="stone-btn__face">{children}</span>
  if (to && !disabled) return <Link to={to} className={cls}>{inner}</Link>
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{inner}</button>
}
