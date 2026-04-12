import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AmbientBackground } from '../components/layout/AmbientBackground'
import { isUserAdmin } from '../services/adminService'

export function AdminGuard() {
  const { user, loading } = useAuth()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) {
      setChecking(false)
      setAllowed(false)
      return
    }
    setChecking(true)
    void (async () => {
      try {
        const ok = await isUserAdmin(user.uid)
        setAllowed(ok)
      } catch (e) {
        console.error('isUserAdmin', e)
        setAllowed(false)
      } finally {
        setChecking(false)
      }
    })()
  }, [user])

  if (loading || checking) {
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

  if (!allowed) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
