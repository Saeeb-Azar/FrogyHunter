import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { PageTransition } from '../components/ui/PageTransition'

export function LoginPage() {
  const { user, loading, demoMode, signInWithGoogle, signInDemo } = useAuth()
  const [err, setErr] = useState<string | null>(null)

  if (loading) {
    return (
      <AppLayout>
        <div className="spinner" />
      </AppLayout>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <AppLayout>
      <PageTransition>
        <motion.div
          className="card card--pad login-card"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-card__mark" aria-hidden>
            🐸
          </div>
          <h1 className="h1">
            Froggy <span>Hunt</span>
          </h1>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Einmal anmelden – dein Fortschritt bleibt im Moos gespeichert.
          </p>
          {demoMode && (
            <p className="badge badge--warn" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              Demo-Modus aktiv
            </p>
          )}
          {err && (
            <p className="muted" style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }} role="alert">
              {err}
            </p>
          )}
          {!demoMode && (
            <button
              type="button"
              className="btn btn--primary btn--lg btn--block"
              style={{ marginBottom: '0.65rem' }}
              onClick={() => {
                setErr(null)
                void signInWithGoogle().catch(() => setErr('Google-Anmeldung fehlgeschlagen.'))
              }}
            >
              Mit Google anmelden
            </button>
          )}
          {demoMode && (
            <button type="button" className="btn btn--primary btn--lg btn--block" style={{ marginBottom: '0.65rem' }} onClick={signInDemo}>
              Demo starten
            </button>
          )}
          <p className="muted" style={{ fontSize: '0.78rem', marginTop: '1.1rem', lineHeight: 1.5 }}>
            Kein Zugriff auf dein Gmail-Postfach – nur sicherer Sign-In über Google.
          </p>
          {!demoMode && (
            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
              Ohne Anmeldung ist die Lobby nicht erreichbar.
            </p>
          )}
        </motion.div>
      </PageTransition>
    </AppLayout>
  )
}
