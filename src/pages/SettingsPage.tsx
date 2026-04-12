import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { UserBar } from '../components/layout/UserBar'
import { PageTransition } from '../components/ui/PageTransition'
import { setMockAdminFlag } from '../services/adminService'
import { loadUserSettingsRemote, saveUserSettingsRemote } from '../services/usersService'
import { useSettingsStore } from '../stores/settingsStore'

export function SettingsPage() {
  const { user, demoMode } = useAuth()
  const musicEnabled = useSettingsStore((s) => s.musicEnabled)
  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled)
  const volume = useSettingsStore((s) => s.volume)
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)
  const theme = useSettingsStore((s) => s.theme)
  const setMusic = useSettingsStore((s) => s.setMusic)
  const setSfx = useSettingsStore((s) => s.setSfx)
  const setVolume = useSettingsStore((s) => s.setVolume)
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const hydrateFromRemote = useSettingsStore((s) => s.hydrateFromRemote)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!user || demoMode) return
    void (async () => {
      const remote = await loadUserSettingsRemote(user.uid)
      if (remote) hydrateFromRemote(remote)
    })()
  }, [user, demoMode, hydrateFromRemote])

  const persistRemote = () => {
    if (!user || demoMode) return
    void saveUserSettingsRemote(user.uid, {
      musicEnabled,
      sfxEnabled,
      volume,
      reduceMotion,
      theme,
    })
  }

  return (
    <AppLayout showBack backTo="/">
      <UserBar />
      <PageTransition>
        <h2 className="h2">Einstellungen</h2>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>
          Lokal gespeichert; mit Firebase werden Einstellungen zusätzlich mit dem Konto synchronisiert.
        </p>

        <div className="card card--pad" style={{ maxWidth: 520 }}>
          <ToggleRow
            label="Musik"
            checked={musicEnabled}
            onChange={(v) => {
              setMusic(v)
              persistRemote()
            }}
          />
          <ToggleRow
            label="Soundeffekte"
            checked={sfxEnabled}
            onChange={(v) => {
              setSfx(v)
              persistRemote()
            }}
          />
          <div className="field" style={{ marginTop: '1rem' }}>
            <label htmlFor="vol">Lautstärke</label>
            <input
              id="vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              className="range"
              onChange={(e) => {
                setVolume(Number(e.target.value))
                persistRemote()
              }}
            />
          </div>
          <ToggleRow
            label="Animationen reduzieren"
            checked={reduceMotion}
            onChange={(v) => {
              setReduceMotion(v)
              persistRemote()
            }}
          />
          <div className="field">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              className="select"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value as 'dark' | 'light')
                persistRemote()
              }}
            >
              <option value="dark">Dunkel (Standard)</option>
              <option value="light">Hell (Beta)</option>
            </select>
          </div>

          {demoMode && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Demo: Admin-Bereich freischalten (nur lokal)
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked={localStorage.getItem('froggy_mock_is_admin') === '1'}
                  onChange={(e) => setMockAdminFlag(e.target.checked)}
                />
                <span>Lokaler Admin-Modus</span>
              </label>
              <Link to="/admin" style={{ display: 'inline-block', marginTop: '0.75rem' }}>
                Zum Admin →
              </Link>
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.65rem 0',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}
