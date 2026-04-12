import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'

const LS_ADMIN = 'froggy_mock_is_admin'

function envAdminUids(): Set<string> {
  const raw = import.meta.env.VITE_ADMIN_UIDS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  )
}

export async function isUserAdmin(uid: string): Promise<boolean> {
  if (envAdminUids().has(uid)) return true
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    return localStorage.getItem(LS_ADMIN) === '1'
  }
  const db = getFirebaseDb()!
  const snap = await getDoc(doc(db, 'admins', uid))
  if (!snap.exists()) return false
  const role = (snap.data() as { role?: string }).role
  return role === 'admin' || role === 'superadmin'
}

/** Nur Demo / lokales Testen: Admin-Toggle ohne Firebase */
export function setMockAdminFlag(on: boolean) {
  if (on) localStorage.setItem(LS_ADMIN, '1')
  else localStorage.removeItem(LS_ADMIN)
}
