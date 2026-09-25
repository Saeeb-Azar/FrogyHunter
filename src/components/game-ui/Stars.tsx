const STAR = 'M12 2.2l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17l-6 3.3 1.3-6.6-4.9-4.6 6.7-.8z'

export function StarIcon({ on }: { on: boolean }) {
  return <svg viewBox="0 0 24 24" className={`star${on ? ' is-on' : ''}`} aria-hidden><path d={STAR} /></svg>
}

export function Stars({ count, max = 3, className }: { count: number; max?: number; className?: string }) {
  return (
    <span className={className} role="img" aria-label={`${count} von ${max} Sternen`}>
      {Array.from({ length: max }, (_, i) => <StarIcon key={i} on={i < count} />)}
    </span>
  )
}
