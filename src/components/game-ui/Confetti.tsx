const COLORS = ['#ffd23f', '#ff6f91', '#7bd8ff', '#9dff6a', '#fff4d6', '#ffa94d']

/** Einmaliger Konfetti-Regen (reines CSS). */
export function Confetti({ count = 60 }: { count?: number }) {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{
          '--x': `${(i * 37) % 100}%`, '--d': `${(i % 7) * 0.12}s`, '--r': `${(i * 53) % 360}deg`,
          '--s': `${0.8 + (i % 5) * 0.12}`, '--dur': `${2.2 + (i % 6) * 0.25}s`, background: COLORS[i % COLORS.length],
        } as React.CSSProperties} />
      ))}
    </div>
  )
}
