import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { GameStage } from '../components/game-ui/GameStage'
import { StoneButton } from '../components/game-ui/PlayButtons'
import { ScreenHeader } from '../components/game-ui/ScreenHeader'
import { WoodIcon } from '../components/game-ui/WoodButton'
import { isUserAdmin, setMockAdminFlag } from '../services/adminService'
import { loadUserSettingsRemote, saveUserSettingsRemote, saveDisplayName } from '../services/usersService'
import { useSettingsStore } from '../stores/settingsStore'

function WoodSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <span className="wood-switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="wood-switch__track" aria-hidden />
      <span className="wood-switch__knob" aria-hidden />
    </span>
  )
}

function Row({ icon, label, sub, checked, onChange }: { icon: Parameters<typeof WoodIcon>[0]['icon']; label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="setting-row">
      <span className="setting-row__label"><span className="setting-icon"><WoodIcon icon={icon} /></span><span>{label}{sub && <small>{sub}</small>}</span></span>
      <WoodSwitch label={label} checked={checked} onChange={onChange} />
    </div>
  )
}

export function SettingsPage() {
  const { user, demoMode, signOut } = useAuth()
  const [name, setName] = useState(user?.displayName ?? '')
  const [message, setMessage] = useState('')
  const [admin, setAdmin] = useState(false)
  const [mockAdmin, setMockAdmin] = useState(() => localStorage.getItem('froggy_mock_is_admin') === '1')
  const s = useSettingsStore()

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
    void saveUserSettingsRemote(user.uid, { musicEnabled: st.musicEnabled, sfxEnabled: st.sfxEnabled, volume: st.volume, reduceMotion: st.reduceMotion, theme: st.theme })
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
            <Row icon="replay" label="Animationen reduzieren" sub="Weniger Bewegung & Effekte" checked={s.reduceMotion} onChange={v => change(() => s.setReduceMotion(v))} />
            {message && <p className="panel-status" role="status">{message}</p>}
          </div>
        </section>

        <section className="wood-panel" aria-label="Profil">
          <div className="wood-panel__inner">
            <h2 className="panel-heading">Dein Profil</h2>
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
            {demoMode && <div className="setting-row" style={{ marginTop: 10 }}>
              <span className="setting-row__label" style={{ fontSize: 15 }}><span>Lokaler Admin-Modus<small>Nur Demo: Level Studio freischalten</small></span></span>
              <WoodSwitch label="Lokaler Admin-Modus" checked={mockAdmin} onChange={v => { setMockAdminFlag(v); setMockAdmin(v); setAdmin(v) }} />
            </div>}
          </div>
        </section>
      </div>
    </GameStage>
  )
}
