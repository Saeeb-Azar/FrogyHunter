import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AmbientBackground } from '../components/layout/AmbientBackground'

export function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-shell">
        <AmbientBackground />
        <div className="app-main">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
