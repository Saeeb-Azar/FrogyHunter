import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GameStage } from '../components/game-ui/GameStage'

export function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <GameStage scene="lobby"><div className="loading-frog"><i aria-hidden className="froggy-head" />Froggy Hunt lädt …</div></GameStage>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
