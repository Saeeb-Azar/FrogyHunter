import { ASSET } from '../../lib/gameAssets'
import { AVATAR_PRESETS } from '../../lib/avatars'

type Preset = (typeof AVATAR_PRESETS)[number]

function FrogFace({ body, dark, cheek }: { body: string; dark: string; cheek: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="avatar-svg">
      <ellipse cx="32" cy="40" rx="25" ry="18" fill={body} stroke={dark} strokeWidth="2.5" />
      <circle cx="20" cy="22" r="10" fill={body} stroke={dark} strokeWidth="2.5" />
      <circle cx="44" cy="22" r="10" fill={body} stroke={dark} strokeWidth="2.5" />
      <circle cx="20" cy="22" r="6.5" fill="#e8b23a" /><circle cx="44" cy="22" r="6.5" fill="#e8b23a" />
      <ellipse cx="20" cy="22.5" rx="4.6" ry="2.6" fill="#10201a" /><ellipse cx="44" cy="22.5" rx="4.6" ry="2.6" fill="#10201a" />
      <circle cx="17.8" cy="20" r="1.6" fill="#fff" /><circle cx="41.8" cy="20" r="1.6" fill="#fff" />
      <path d="M18 42q14 10 28 0" fill="none" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="14" cy="40" rx="4" ry="2.4" fill={cheek} opacity=".7" /><ellipse cx="50" cy="40" rx="4" ry="2.4" fill={cheek} opacity=".7" />
    </svg>
  )
}

/** Zeigt ein Profilbild: 'preset:<id>', data-/http-URL oder Standard-Froggy. */
export function Avatar({ value, fallbackUrl }: { value?: string | null; fallbackUrl?: string | null }) {
  const v = value || (fallbackUrl ? fallbackUrl : 'preset:froggy')
  if (v.startsWith('preset:')) {
    const p = (AVATAR_PRESETS.find(a => a.id === v.slice(7)) ?? AVATAR_PRESETS[0]) as Preset
    if (!('body' in p)) return <img className="avatar-froggy" src={ASSET.froggyFound} alt="" draggable={false} />
    return <FrogFace body={p.body} dark={p.dark} cheek={p.cheek} />
  }
  return <img className="avatar-photo" src={v} alt="" referrerPolicy="no-referrer" draggable={false} />
}
