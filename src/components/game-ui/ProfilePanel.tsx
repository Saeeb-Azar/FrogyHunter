import { Link } from 'react-router-dom'
import { ASSET } from '../../lib/gameAssets'
import { profileLevel } from '../../lib/gameRules'
import { useSettingsStore } from '../../stores/settingsStore'
import { Avatar } from './Avatar'

/** profile-panel.png: Avatar-Fenster, Name, Profil-Level, XP-Balken. */
export function ProfilePanel({ name, xp, photoURL }: { name: string; xp: number; photoURL?: string | null }) {
  const { level, into, per } = profileLevel(xp)
  const avatar = useSettingsStore(st => st.avatar)
  return (
    <Link to="/settings" className="profile-panel" aria-label={`Profil von ${name}, Level ${level}, ${xp} XP – Einstellungen öffnen`}>
      <img src={ASSET.profilePanel} alt="" draggable={false} />
      <span className="profile-panel__avatar"><Avatar value={avatar} fallbackUrl={photoURL} /></span>
      <span className="profile-panel__text">
        <span className="profile-panel__name">{name}</span>
        <span className="profile-panel__lvl">LEVEL {level} · {xp} XP</span>
        <span className="profile-panel__xp"><i style={{ width: `${(into / per) * 100}%` }} /><b>{into}/{per}</b></span>
      </span>
    </Link>
  )
}
