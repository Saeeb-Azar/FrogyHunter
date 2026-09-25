import { Link } from 'react-router-dom'
import { ASSET } from '../../lib/gameAssets'
import { profileLevel } from '../../lib/gameRules'

function FrogFace() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="32" cy="40" rx="25" ry="18" fill="#8fd13a" stroke="#2f6f1c" strokeWidth="2.5" />
      <circle cx="20" cy="22" r="10" fill="#8fd13a" stroke="#2f6f1c" strokeWidth="2.5" />
      <circle cx="44" cy="22" r="10" fill="#8fd13a" stroke="#2f6f1c" strokeWidth="2.5" />
      <circle cx="20" cy="22" r="6" fill="#fff" /><circle cx="44" cy="22" r="6" fill="#fff" />
      <circle cx="21" cy="23" r="3.6" fill="#10201a" /><circle cx="45" cy="23" r="3.6" fill="#10201a" />
      <circle cx="19.6" cy="21.4" r="1.3" fill="#fff" /><circle cx="43.6" cy="21.4" r="1.3" fill="#fff" />
      <path d="M18 42q14 10 28 0" fill="none" stroke="#2f6f1c" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="14" cy="40" rx="4" ry="2.4" fill="#f6918a" opacity=".8" /><ellipse cx="50" cy="40" rx="4" ry="2.4" fill="#f6918a" opacity=".8" />
    </svg>
  )
}

/** profile-panel.png: Avatar-Fenster, Name, Profil-Level, XP-Balken. */
export function ProfilePanel({ name, xp, photoURL }: { name: string; xp: number; photoURL?: string | null }) {
  const { level, into, per } = profileLevel(xp)
  return (
    <Link to="/settings" className="profile-panel" aria-label={`Profil von ${name}, Level ${level}, ${xp} XP – Einstellungen öffnen`}>
      <img src={ASSET.profilePanel} alt="" draggable={false} />
      <span className="profile-panel__avatar">{photoURL ? <img src={photoURL} alt="" referrerPolicy="no-referrer" /> : <FrogFace />}</span>
      <span className="profile-panel__text">
        <span className="profile-panel__name">{name}</span>
        <span className="profile-panel__lvl">LEVEL {level} · {xp} XP</span>
        <span className="profile-panel__xp"><i style={{ width: `${(into / per) * 100}%` }} /><b>{into}/{per}</b></span>
      </span>
    </Link>
  )
}
