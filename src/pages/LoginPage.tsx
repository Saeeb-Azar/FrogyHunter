import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Froggy3D } from '../components/game-ui/Froggy3D'
import { GameStage } from '../components/game-ui/GameStage'
import { StoneButton } from '../components/game-ui/PlayButtons'

export function LoginPage() {
  const { user, loading, demoMode, signInWithGoogle, signInDemo } = useAuth()
  const [err, setErr] = useState<string | null>(null)
  if (loading) return <GameStage scene="lobby"><div className="loading-frog"><i aria-hidden className="froggy-head" />Einen Moment …</div></GameStage>
  if (user) return <Navigate to="/" replace />
  return (
    <GameStage scene="lobby">
      <div className="login">
        <div className="lobby-logo">
          <span className="game-title" style={{ fontSize: 'min(13vw, 60px)' }}>FROGGY <span className="game-title game-title--green">HUNT</span></span>
          <span className="lobby-logo__tag">FINDE SIE ALLE!</span>
        </div>
        <div className="login-frog"><Froggy3D variant="hero" /></div>
        <div className="wood-panel">
          <div className="wood-panel__inner">
            {demoMode && <span className="demo-pill">DEMO-MODUS</span>}
            <p>{demoMode ? 'Finde die versteckten Froggys! Die Demo speichert deine Reise auf diesem Gerät.' : 'Einmal anmelden – deine Reise, Sterne und Bestzeiten bleiben bei dir.'}</p>
            {err && <p role="alert" style={{ color: '#ffb4a0' }}>{err}</p>}
            {demoMode
              ? <StoneButton size="lg" onClick={signInDemo}>Demo starten</StoneButton>
              : <StoneButton size="lg" onClick={() => { setErr(null); void signInWithGoogle().catch(() => setErr('Google-Anmeldung fehlgeschlagen.')) }}>Mit Google anmelden</StoneButton>}
            <small>Kein Zugriff auf dein Gmail-Postfach – nur sicherer Sign-In über Google.</small>
          </div>
        </div>
      </div>
    </GameStage>
  )
}
