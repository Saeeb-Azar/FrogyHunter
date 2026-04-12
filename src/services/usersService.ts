import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import type { UserSettings } from '../types/models'

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
  if (!isFirebaseConfigured() || !getFirebaseDb()) return null
  const db = getFirebaseDb()!
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const p = (snap.data() as { preferences?: UserSettings }).preferences
  return p ?? null
}
