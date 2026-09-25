import { useEffect, useRef, useState } from 'react'
import { playSound } from '../audio/soundManager'
import { Avatar } from '../components/game-ui/Avatar'
import { AVATAR_PRESETS, fileToAvatar } from '../lib/avatars'
import { useAuth } from '../contexts/AuthContext'
import { GameStage } from '../components/game-ui/GameStage'
import { StoneButton } from '../components/game-ui/PlayButtons'
import { ScreenHeader } from '../components/game-ui/ScreenHeader'
import { WoodIcon } from '../components/game-ui/WoodButton'
import { isUserAdmin, setMockAdminFlag } from '../services/adminService'
import { loadUserSettingsRemote, saveUserSettingsRemote, saveDisplayName } from '../services/usersService'
import { useSettingsStore } from '../stores/settingsStore'

/** Holzschalter. Die ganze Zeile ist die Tippfläche (label), damit er sofort reagiert. */
function WoodSwitch({ checked }: { checked: boolean }) {
  return (
    <span className={`wood-switch${checked ? ' is-on' : ''}`} aria-hidden>
      <span className="wood-switch__track" />
      <span className="wood-switch__knob" />
    </span>
  )
}

function Row({ icon, label, sub, checked, onChange }: { icon?: Parameters<typeof WoodIcon>[0]['icon']; label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="setting-row setting-row--toggle">
      <input type="checkbox" role="switch" className="sr-only" checked={checked} onChange={e => { onChange(e.target.checked); playSound('tap') }} />
      <span className="setting-row__label">{icon && <span className="setting-icon"><WoodIcon icon={icon} /></span>}<span>{label}{sub && <small>{sub}</small>}</span></span>
      <WoodSwitch checked={checked} />
    </label>
  )
}

export function SettingsPage() {
  const { user, demoMode, signOut } = useAuth()
  const [name, setName] = useState(user?.displayName ?? '')
  const [message, setMessage] = useState('')
  const [admin, setAdmin] = useState(false)
  const [mockAdmin, setMockAdmin] = useState(() => localStorage.getItem('froggy_mock_is_admin') === '1')
  const s = useSettingsStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const pickAvatar = (v: string | null) => { change(() => s.setAvatar(v)); playSound('found'); setMessage('Profilbild gespeichert ✓') }

  useEffect(() => {
    if (!user) return
    void isUserAdmin(user.uid).then(setAdmin).catch(() => setAdmin(false))
    if (demoMode) return
    void loadUserSettingsRemote(user.uid).then(remote => { if (remote) s.hydrateFromRemote(remote) }).catch(() => setMessage('Einstellungen konnten nicht vom Konto geladen werden.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, demoMode])

  const persistRemote = () => {
    if (!user || demoMode) return
    const st = useSettingsStore.getState()
    void saveUserSettingsRemote(user.uid, { musicEnabled: st.musicEnabled, sfxEnabled: st.sfxEnabled, volume: st.volume, reduceMotion: false, theme: st.theme, avatar: st.avatar })
      .then(() => setMessage('Einstellungen gespeichert ✓')).catch(() => setMessage('Auf diesem Gerät gespeichert. Die Synchronisierung ist fehlgeschlagen.'))
  }
  const change = (fn: () => void) => { fn(); persistRemote() }

  return (
    <GameStage scene="forest">
      <div className="sub-screen">
        <ScreenHeader title="EINSTELLUNGEN" />

        <section className="wood-panel" aria-label="Ton und Bewegung">
          <div className="wood-panel__inner">
            <h2 className="panel-heading">Ton & Spielgefühl</h2>
            <Row icon="music" label="Musik" sub="Fröhliche Waldmelodie" checked={s.musicEnabled} onChange={v => change(() => s.setMusic(v))} />
            <Row icon="sound" label="Soundeffekte" sub="Quaken, Treffer, Jubel" checked={s.sfxEnabled} onChange={v => change(() => s.setSfx(v))} />
            <div className="volume-block">
              <label className="setting-row__label" htmlFor="vol"><span>Lautstärke</span><span className="wood-text" style={{ fontSize: 16 }}>{Math.round(s.volume * 100)} %</span></label>
              <input id="vol" type="range" min={0} max={1} step={0.05} value={s.volume} className="wood-range" style={{ '--v': `${s.volume * 100}%` } as React.CSSProperties}
                onChange={e => change(() => s.setVolume(Number(e.target.value)))} />
            </div>
            {message && <p className="panel-status" role="status">{message}</p>}
          </div>
        </section>

        <section className="wood-panel" aria-label="Profil">
          <div className="wood-panel__inner">
            <h2 className="panel-heading">Dein Profil</h2>
            <div className="avatar-current">
              <span className="avatar-frame"><Avatar value={s.avatar} fallbackUrl={user?.photoURL} /></span>
              <span className="avatar-current__text">Profilbild<small>Wähle einen Froggy oder lade ein eigenes Foto hoch.</small></span>
            </div>
            <div className="avatar-grid" role="radiogroup" aria-label="Profilbild wählen">
              {AVATAR_PRESETS.map(a => {
                const v = `preset:${a.id}`
                const active = (s.avatar ?? (user?.photoURL ? null : 'preset:froggy')) === v
                return <button key={a.id} type="button" role="radio" aria-checked={active} aria-label={a.label} className={`avatar-choice${active ? ' is-active' : ''}`} onClick={() => pickAvatar(v)}><Avatar value={v} /></button>
              })}
              {user?.photoURL && <button type="button" role="radio" aria-checked={!s.avatar} aria-label="Google-Foto" className={`avatar-choice${!s.avatar ? ' is-active' : ''}`} onClick={() => pickAvatar(null)}><Avatar value={user.photoURL} /></button>}
              {s.avatar?.startsWith('data:') && <button type="button" role="radio" aria-checked className="avatar-choice is-active" aria-label="Eigenes Foto"><Avatar value={s.avatar} /></button>}
              <button type="button" className="avatar-choice avatar-choice--upload" onClick={() => fileRef.current?.click()} aria-label="Eigenes Foto hochladen">📷<small>Foto</small></button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                if (f.size > 15 * 1024 * 1024) { setMessage('Das Bild ist zu groß (max. 15 MB).'); return }
                void fileToAvatar(f).then(pickAvatar).catch(() => setMessage('Das Bild konnte nicht gelesen werden.'))
              }} />
            </div>
            <label className="setting-row__label" htmlFor="display-name" style={{ fontSize: 15 }}>Anzeigename</label>
            <div className="name-row">
              <input id="display-name" className="wood-input" value={name} maxLength={30} onChange={e => setName(e.target.value)} />
              <StoneButton size="sm" disabled={!name.trim() || name === user?.displayName}
                onClick={() => { if (user) void saveDisplayName(user.uid, name.trim()).then(() => location.reload()).catch(() => setMessage('Der Name konnte nicht gespeichert werden.')) }}>Speichern</StoneButton>
            </div>
            <p className="panel-note">{demoMode ? 'Demo · Dein Fortschritt bleibt nur auf diesem Gerät.' : user?.email ?? ''}</p>
            <div className="game-modal__row" style={{ marginTop: 12 }}>
              {admin && <StoneButton tone="gold" size="sm" to="/admin">Level Studio</StoneButton>}
              <StoneButton tone="wood" size="sm" onClick={() => void signOut()}>Abmelden</StoneButton>
            </div>
            {demoMode && <Row label="Lokaler Admin-Modus" sub="Nur Demo: Level Studio freischalten" checked={mockAdmin} onChange={v => { setMockAdminFlag(v); setMockAdmin(v); setAdmin(v) }} />}
          </div>
        </section>
      </div>
    </GameStage>
  )
}
