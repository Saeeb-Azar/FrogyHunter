import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { FroggyHero } from '../components/lobby/FroggyHero'
import { resolveCurrentLevel } from '../lib/currentLevel'
import { publicUrl } from '../lib/publicUrl'
import { formatTime } from '../lib/gameRules'
import { NewLevelCountdown } from '../components/lobby/NewLevelCountdown'
import { isUserAdmin } from '../services/adminService'
import { getProgress, listCompletedForUser } from '../services/progressService'
import { useSettingsStore } from '../stores/settingsStore'
import type { Level, UserProgress } from '../types/models'

export function LobbyPage() {
  const { user, demoMode } = useAuth()
  const [level, setLevel] = useState<Level | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [xp, setXp] = useState(0)
  const [admin, setAdmin] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const music = useSettingsStore(s => s.musicEnabled)
  const toggleMusic = useSettingsStore(s => s.setMusic)
  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const [r, adm, completed] = await Promise.all([resolveCurrentLevel(user.uid), isUserAdmin(user.uid), listCompletedForUser(user.uid)])
        const p = r.level ? await getProgress(user.uid, r.level.id) : null
        if (active) { setLevel(r.level); setProgress(p); setAdmin(adm); setXp(completed.reduce((n, p) => n + (p.xp ?? 100), 0)); setError(false) }
      } catch { if (active) setError(true) }
      finally { if (active) setLoading(false) }
    }
    void load()
    const timer = setInterval(() => { if (!document.hidden) void load() }, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [user])
  return <AppLayout mainClass="hunt-lobby" shellClass="hunt-world" hideAmbient>
    <header className="hunt-profile-row">
      <Link to="/settings" className="hunt-profile"><span className="hunt-avatar" aria-hidden>🐸</span><span><strong>{user?.displayName ?? 'Froschfreund'}</strong><small>Level {1 + Math.floor(xp / 250)} · {xp} XP</small><progress value={xp % 250} max={250} aria-label="Fortschritt zum nächsten Profil Level" /></span></Link>
      <button className="hunt-icon-button" onClick={() => toggleMusic(!music)} aria-pressed={music} aria-label="Musik umschalten">{music ? '♫' : '♪'}</button>
    </header>
    <div className="hunt-brand"><span>FroggySmill</span><h1>HUNT</h1><p>Ein Wald voller kleiner Geheimnisse.</p></div>
    <FroggyHero />
    <div className="hunt-lobby-bottom">
      {loading ? <div className="hunt-notice">Dein Abenteuer lädt …</div> : error ? <div className="hunt-notice" role="alert">Die Level konnten nicht geladen werden. <button onClick={() => location.reload()}>Erneut versuchen</button></div> : level ? <>
        <section className="hunt-week-card" aria-label="Aktuelles Wochenlevel">
          <img src={level.imageUrl} alt="" />
          <div><span className="hunt-eyebrow">AKTUELLES ABENTEUER</span><h2>{level.title}</h2><p>{level.frogCount} versteckte Froggys{progress?.completed ? ` · Bestzeit ${formatTime(progress.bestDurationMs ?? progress.durationMs ?? 0)}` : ''}</p></div>
          {progress?.completed && <span className="hunt-completed-check" aria-label="Abgeschlossen">✓</span>}
        </section>
        <Link to="/play" className="hunt-primary hunt-play-cta">{progress?.activeAttempt ? 'WEITERSUCHEN' : progress?.completed ? 'NOCH MAL SPIELEN' : 'SPIELEN'} <span aria-hidden>▶</span></Link>
      </> : <p className="hunt-notice">Dein erstes Wochenabenteuer erscheint bald.</p>}
      <div className="hunt-countdown"><span>NEUES LEVEL JEDEN MITTWOCH · 18 UHR</span><NewLevelCountdown /></div>
      <nav className="hunt-menu" aria-label="Hauptmenü">
        {[['history', 'historie', 'Meine Reise'], ['settings', 'einstellungen', 'Einstellungen'], ['info', 'infos', 'Infos']].map(([route, asset, label]) => <Link key={route} to={`/${route}`}><img src={publicUrl(`assets/ui/btn_${asset}.png`)} alt="" /><span>{label}</span></Link>)}
      </nav>
      <p className="hunt-community">Willkommen in der Froggy Community <span aria-hidden>♥</span></p>
      {demoMode && <p className="hunt-demo-label">Demo · Fortschritt nur auf diesem Gerät</p>}
      {admin && <Link to="/admin" className="hunt-admin-link">Level Studio öffnen</Link>}
    </div>
  </AppLayout>
}
