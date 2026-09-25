import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GameStage } from '../components/game-ui/GameStage'
import { isUserAdmin } from '../services/adminService'

export function AdminGuard() {
  const { user, loading } = useAuth()
  /** Ergebnis gilt nur für die geprüfte uid – verhindert eine vorschnelle Umleitung, solange die Prüfung läuft. */
  const [result, setResult] = useState<{ uid: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    isUserAdmin(user.uid)
      .then(ok => { if (active) setResult({ uid: user.uid, ok }) })
      .catch(e => { console.error('isUserAdmin', e); if (active) setResult({ uid: user.uid, ok: false }) })
    return () => { active = false }
  }, [user])

  if (!loading && !user) return <Navigate to="/login" replace />
  if (loading || !user || result?.uid !== user.uid) {
    return <GameStage scene="forest"><div className="loading-frog"><i aria-hidden>🐸</i>Level Studio lädt …</div></GameStage>
  }
  if (!result.ok) return <Navigate to="/" replace />
  return <Outlet />
}
