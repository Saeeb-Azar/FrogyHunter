import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { updateProfile } from 'firebase/auth'
import { getFirebaseAuth } from '../lib/firebase'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import type { UserSettings } from '../types/models'
import { checkDbError, supabase } from '../lib/supabase'

const LS_USER = 'froggy_mock_user_doc'

export async function upsertUserFromAuth(user: User): Promise<void> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    localStorage.setItem(
      LS_USER,
      JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: Date.now(),
      })
    )
    return
  }
  const db = getFirebaseDb()!
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
    })
  } else {
    await updateDoc(ref, {
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
    })
  }
}

export async function saveUserSettingsRemote(uid: string, settings: UserSettings): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('profiles').upsert({ uid, preferences: settings })
    checkDbError(error)
    return
  }
  if (!isFirebaseConfigured() || !getFirebaseDb()) return
  const db = getFirebaseDb()!
  await setDoc(
    doc(db, 'users', uid),
    {
      preferences: settings,
      preferencesUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function loadUserSettingsRemote(uid: string): Promise<UserSettings | null> {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('preferences').eq('uid', uid).maybeSingle()
    checkDbError(error)
    return data?.preferences ?? null
  }
  if (!isFirebaseConfigured() || !getFirebaseDb()) return null
  const db = getFirebaseDb()!
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const p = (snap.data() as { preferences?: UserSettings }).preferences
  return p ?? null
}

export async function saveDisplayName(uid: string, name: string) {
  const trimmed = name.trim().slice(0, 30)
  if (!trimmed) throw new Error('Bitte einen Namen angeben')
  if (supabase) {
    const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } })
    checkDbError(error)
    return
  }
  const db = getFirebaseDb()
  const currentUser = getFirebaseAuth()?.currentUser
  if (currentUser) await updateProfile(currentUser, { displayName: trimmed })
  if (db) await setDoc(doc(db, 'users', uid), { name: trimmed }, { merge: true })
  else localStorage.setItem('froggy_display_name', trimmed)
}
