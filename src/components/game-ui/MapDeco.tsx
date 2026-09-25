/** Kleine Deko-Elemente für die Level-Karte – passend zu Seerosen, Blüten und Pilzen im Hintergrund. */
export function LilyPad({ size = 46, rot = 0 }: { size?: number; rot?: number }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <ellipse cx="50" cy="34" rx="48" ry="26" fill="#1b5e2a" opacity=".45" />
      <path d="M50 31 L96 24 A48 26 0 1 1 90 16 Z" fill="#5fae3e" stroke="#2f6f1c" strokeWidth="2.5" />
      <path d="M50 31 L20 20 M50 31 L14 38 M50 31 L40 54 M50 31 L70 54 M50 31 L90 40" stroke="#3f8a2c" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="36" cy="20" rx="14" ry="4" fill="#fff" opacity=".22" />
    </svg>
  )
}

export function Lotus({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 60 48" aria-hidden>
      <ellipse cx="30" cy="40" rx="26" ry="7" fill="#5fae3e" stroke="#2f6f1c" strokeWidth="2" />
      {[-40, -20, 0, 20, 40].map(a => <path key={a} d="M30 40 C22 30 24 16 30 8 C36 16 38 30 30 40Z" fill="#ff9ec5" stroke="#c2477a" strokeWidth="1.6" transform={`rotate(${a} 30 40)`} />)}
      <circle cx="30" cy="31" r="4" fill="#ffd23f" />
    </svg>
  )
}

export function Mushroom({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path d="M15 22h10l2 14H13z" fill="#fff1d6" stroke="#6b3b17" strokeWidth="2" />
      <path d="M3 23C3 10 12 4 20 4s17 6 17 19z" fill="#e0402d" stroke="#6b1b10" strokeWidth="2.2" />
      <circle cx="12" cy="15" r="3" fill="#fff" /><circle cx="23" cy="10" r="2.5" fill="#fff" /><circle cx="29" cy="18" r="2.8" fill="#fff" />
    </svg>
  )
}

export function Stone({ w = 30, moss = false }: { w?: number; moss?: boolean }) {
  return (
    <svg width={w} height={w * 0.6} viewBox="0 0 50 30" aria-hidden>
      <ellipse cx="25" cy="18" rx="24" ry="11" fill="#0b2a2b" opacity=".45" />
      <ellipse cx="25" cy="14" rx="23" ry="12" fill="#b8ab8f" stroke="#4d4332" strokeWidth="2.2" />
      <ellipse cx="20" cy="10" rx="12" ry="4.5" fill="#e6dcc3" />
      {moss && <path d="M6 14c6-6 12 2 18-3s10 1 14 4" fill="none" stroke="#6fb33a" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  )
}
