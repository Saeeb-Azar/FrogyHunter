import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import type { User as FbUser } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import { upsertUserFromAuth } from '../services/usersService'
import { supabase, checkDbError } from '../lib/supabase'

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

function mapFbUser(u: FbUser): AuthUser {
  return {
    uid: u.uid,
    displayName: u.displayName,
    email: u.email,
    photoURL: u.photoURL,
  }
}

interface AuthValue {
  user: AuthUser | null
  loading: boolean
  demoMode: boolean
  signInWithGoogle: () => Promise<void>
  signInDemo: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const DEMO_UID = 'local-demo-user'

function demoAuthUser(): AuthUser {
  return {
    uid: DEMO_UID,
    displayName: localStorage.getItem('froggy_display_name') ?? 'Demo-Froschfreund',
    email: 'demo@froggy.hunt',
    photoURL: null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const demoMode = !supabase && !isFirebaseConfigured()

  useEffect(() => {
    if (supabase) {
      const mapSession = (u: import('@supabase/supabase-js').User | undefined) => {
        setUser(u ? { uid: u.id, displayName: u.user_metadata.display_name ?? u.user_metadata.full_name ?? 'Froschfreund', email: u.email ?? null, photoURL: u.user_metadata.avatar_url ?? null } : null)
        setLoading(false)
      }
      void supabase.auth.getSession().then(({ data }) => mapSession(data.session?.user)).catch(() => setLoading(false))
      const { data } = supabase.auth.onAuthStateChange((_event, session) => mapSession(session?.user))
      return () => data.subscription.unsubscribe()
    }
    if (demoMode) {
      if (localStorage.getItem('froggy_demo_session') === '1') {
        setUser(demoAuthUser())
      }
      setLoading(false)
      return
    }
    let unsub: (() => void) | undefined
    try {
      const auth = getFirebaseAuth()
      if (!auth) {
        setLoading(false)
        return
      }
      unsub = onAuthStateChanged(auth, async (u) => {
        try {
          if (u) {
            try {
              await upsertUserFromAuth(u)
            } catch (e) {
              console.error('upsertUserFromAuth', e)
            }
            setUser(mapFbUser(u))
          } else {
            setUser(null)
          }
        } catch (e) {
          console.error('onAuthStateChanged handler', e)
          setUser(u ? mapFbUser(u) : null)
        } finally {
          setLoading(false)
        }
      })
    } catch (e) {
      console.error('Firebase Auth init', e)
      setLoading(false)
    }
    return () => unsub?.()
  }, [demoMode])

  const signInWithGoogle = useCallback(async () => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: new URL(import.meta.env.BASE_URL, location.origin).href } })
      checkDbError(error)
      return
    }
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase nicht konfiguriert')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }, [])

  const signInDemo = useCallback(() => {
    localStorage.setItem('froggy_demo_session', '1')
    setUser(demoAuthUser())
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) { const { error } = await supabase.auth.signOut(); checkDbError(error); setUser(null); return }
    if (demoMode) {
      localStorage.removeItem('froggy_demo_session')
      setUser(null)
      return
    }
    const auth = getFirebaseAuth()
    if (auth) await fbSignOut(auth)
    setUser(null)
  }, [demoMode])

  const value = useMemo(
    () => ({
      user,
      loading,
      demoMode,
      signInWithGoogle,
      signInDemo,
      signOut,
    }),
    [user, loading, demoMode, signInWithGoogle, signInDemo, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth außerhalb AuthProvider')
  return ctx
}
