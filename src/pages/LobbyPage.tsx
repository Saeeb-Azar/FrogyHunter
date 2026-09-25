import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GameStage } from '../components/game-ui/GameStage'
import { Froggy3D, type Froggy3DHandle } from '../components/game-ui/Froggy3D'
import { PlayAssetButton, StoneButton } from '../components/game-ui/PlayButtons'
import { ProfilePanel } from '../components/game-ui/ProfilePanel'
import { Stars } from '../components/game-ui/Stars'
import { WoodRoundButton } from '../components/game-ui/WoodButton'
import { NewLevelCountdown } from '../components/lobby/NewLevelCountdown'
import { ASSET } from '../lib/gameAssets'
import { resolveCurrentLevel } from '../lib/currentLevel'
import { formatTime, starsForRun } from '../lib/gameRules'
import { playSound } from '../audio/soundManager'
import { isUserAdmin } from '../services/adminService'
import { getProgress, listCompletedForUser } from '../services/progressService'
import { loadUserSettingsRemote } from '../services/usersService'
import { useSettingsStore } from '../stores/settingsStore'
import type { Level, UserProgress } from '../types/models'

const GREETINGS = ['Quak! 💚', 'Such mit mir!', 'Hihi, kitzelig!', 'Mittwoch = Froschtag!', 'Findest du alle?']

export function LobbyPage() {
  const { user, demoMode } = useAuth()
  const [level, setLevel] = useState<Level | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [xp, setXp] = useState(0)
  const [admin, setAdmin] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [greet, setGreet] = useState(0)
  const frog = useRef<Froggy3DHandle>(null)
  const music = useSettingsStore(s => s.musicEnabled)
  const sfx = useSettingsStore(s => s.sfxEnabled)
  const setMusic = useSettingsStore(s => s.setMusic)
  const setSfx = useSettingsStore(s => s.setSfx)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const [r, adm, completed] = await Promise.all([resolveCurrentLevel(user.uid), isUserAdmin(user.uid), listCompletedForUser(user.uid)])
        const p = r.level ? await getProgress(user.uid, r.level.id) : null
        if (active) { setLevel(r.level); setProgress(p); setAdmin(adm); setXp(completed.reduce((n, c) => n + (c.xp ?? 100), 0)); setError(false) }
      } catch { if (active) setError(true) }
      finally { if (active) setLoading(false) }
    }
    void load()
    const timer = setInterval(() => { if (!document.hidden) void load() }, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [user])

  // Profilbild & Einstellungen vom Konto übernehmen (anderes Gerät)
  useEffect(() => {
    if (!user || demoMode) return
    void loadUserSettingsRemote(user.uid).then(r => { if (r) useSettingsStore.getState().hydrateFromRemote({ ...r, reduceMotion: false }) }).catch(() => {})
  }, [user, demoMode])
  useEffect(() => {
    const t = setTimeout(() => frog.current?.celebrate(), 1400)
    return () => clearTimeout(t)
  }, [])
  const poke = () => { frog.current?.celebrate(); playSound('found'); setGreet(g => g + 1) }
  const ribbon = progress?.activeAttempt ? 'WEITERSUCHEN' : progress?.completed ? 'NOCHMAL SPIELEN' : undefined
  const stars = progress?.completed ? starsForRun(progress) : 0

  return (
    <GameStage scene="lobby">
      <div className="lobby">
        <div className="lobby-top">
          <ProfilePanel name={user?.displayName ?? 'Froschfreund'} xp={xp} photoURL={user?.photoURL} />
          <div className="lobby-audio">
            <WoodRoundButton icon="music" label={music ? 'Musik aus' : 'Musik an'} off={!music} pressed={music} onClick={() => setMusic(!music)} size="sm" />
            <WoodRoundButton icon="sound" label={sfx ? 'Soundeffekte aus' : 'Soundeffekte an'} off={!sfx} pressed={sfx} onClick={() => setSfx(!sfx)} size="sm" />
          </div>
        </div>

        <div className="lobby-logo">
          <span className="game-title">FROGGY <span className="game-title game-title--green">HUNT</span></span>
          <span className="lobby-logo__tag">FINDE SIE ALLE!</span>
        </div>

        {loading ? <div className="lobby-notice wood-panel"><div className="loading-frog"><i aria-hidden>🐸</i>Dein Abenteuer lädt …</div></div>
          : error ? <div className="lobby-notice wood-panel" role="alert"><p>Die Level konnten nicht geladen werden.</p><StoneButton size="sm" onClick={() => location.reload()}>Erneut versuchen</StoneButton></div>
          : level ? <>
            <Link to="/play" className="lvl-card" aria-label={`Aktuelles Level: ${level.title}, ${level.frogCount} versteckte Froggys`}>
              <span className="lvl-card__window"><img src={level.imageUrl} alt="" /></span>
              <img className="lvl-card__frame" src={ASSET.lvlShow} alt="" draggable={false} />
              <span className="lvl-card__title">{level.title}</span>
              <span className="lvl-card__plank lvl-card__plank--1">
                {progress?.completed
                  ? <><Stars count={stars} className="lvl-card__stars" /> Bestzeit {formatTime(progress.bestDurationMs ?? progress.durationMs ?? 0)}</>
                  : <>🐸 {level.frogCount} versteckte Froggys</>}
              </span>
              <span className="lvl-card__plank lvl-card__plank--2">Neues Level in&nbsp;<NewLevelCountdown /></span>
              {progress?.completed && <span className="lvl-card__badge">GE-<br />SCHAFFT</span>}
              {!progress && <span className="lvl-card__new">NEU!</span>}
            </Link>
            <div className="lobby-play"><PlayAssetButton to="/play" ribbon={ribbon} label={ribbon ?? 'Spielen'} /></div>
          </> : <div className="lobby-notice wood-panel"><p>Dein erstes Wochenabenteuer erscheint bald.</p><p>Neues Level in <NewLevelCountdown /></p></div>}

        <nav className="lobby-menu" aria-label="Hauptmenü">
          <Link to="/history" className="menu-btn" aria-label="Historie – Level-Karte"><img src={ASSET.btnHistorie} alt="" draggable={false} /></Link>
          <Link to="/settings" className="menu-btn" aria-label="Einstellungen"><img src={ASSET.btnEinstellungen} alt="" draggable={false} /></Link>
          <Link to="/info" className="menu-btn" aria-label="Infos"><img src={ASSET.btnInfos} alt="" draggable={false} /></Link>
        </nav>

        <div className="lobby-frog">
          <Froggy3D ref={frog} variant="hero" fallback={<span className="froggy-fallback" aria-hidden>🐸</span>} />
          <button type="button" className="lobby-frog__tap" onClick={poke} aria-label="Froggy anstupsen" />
          <span key={greet} className="lobby-frog__bubble" aria-hidden>{GREETINGS[greet % GREETINGS.length]}</span>
        </div>
        {admin && <div className="lobby-admin"><StoneButton to="/admin" tone="gold" size="sm">Level Studio</StoneButton></div>}
        {demoMode && <p className="lobby-demo">Demo · Fortschritt nur auf diesem Gerät</p>}
      </div>
    </GameStage>
  )
}
