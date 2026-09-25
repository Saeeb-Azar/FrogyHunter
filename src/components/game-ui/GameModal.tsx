import { useEffect, useRef, type ReactNode } from 'react'
import { WoodRoundButton } from './WoodButton'

interface Props {
  open: boolean
  label: string
  title?: string
  children: ReactNode
  onClose?: () => void
}

/** Holz-Dialog (star_box.png) mit Titelbrett. Escape/Schließen-Knopf nur, wenn onClose gesetzt ist. */
export function GameModal({ open, label, title, children, onClose }: Props) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    box.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && onClose) { e.preventDefault(); onClose() } }
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('keydown', key); prev?.focus?.() }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="game-modal" role="dialog" aria-modal="true" aria-label={label} onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="game-modal__box wood-panel" ref={box} tabIndex={-1}>
        <div className="wood-panel__inner">
          {onClose && <div className="game-modal__close"><WoodRoundButton icon="close" label="Schließen" onClick={onClose} size="sm" /></div>}
          {title && <div className="game-modal__head"><div className="plank-title"><span>{title}</span></div></div>}
          {children}
        </div>
      </div>
    </div>
  )
}
