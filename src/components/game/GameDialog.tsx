import { useEffect, useRef, type ReactNode } from 'react'
export function GameDialog({ open, label, children, onCancel }: { open: boolean; label: string; children: ReactNode; onCancel?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
    return () => { if (el.open) el.close() }
  }, [open])
  return <dialog ref={ref} className="hunt-dialog" aria-label={label} onCancel={e => { e.preventDefault(); onCancel?.() }}>{children}</dialog>
}
