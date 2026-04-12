import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import { LS_PROGRESS, readJson, writeJson } from '../lib/mockStorage'
import type { UserProgress } from '../types/models'

function progressDocId(uid: string, levelId: string) {
  return `${uid}__${levelId}`
}

type ProgressMap = Record<string, UserProgress>

function getMockProgress(): ProgressMap {
  return readJson(LS_PROGRESS, {})
}

function setMockProgress(p: UserProgress) {
  const m = getMockProgress()
  m[progressDocId(p.uid, p.levelId)] = p
  writeJson(LS_PROGRESS, m)
}

export async function getProgress(uid: string, levelId: string): Promise<UserProgress | null> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const m = getMockProgress()
    return m[progressDocId(uid, levelId)] ?? null
  }
  const db = getFirebaseDb()!
  const ref = doc(db, 'userProgress', progressDocId(uid, levelId))
  const s = await getDoc(ref)
  if (!s.exists()) return null
  const d = s.data() as Record<string, unknown>
  return {
    uid: String(d.uid),
    levelId: String(d.levelId),
    startedAt: Number(d.startedAt),
    completedAt: d.completedAt == null ? null : Number(d.completedAt),
    durationMs: d.durationMs == null ? null : Number(d.durationMs),
    clicks: Number(d.clicks ?? 0),
    misses: Number(d.misses ?? 0),
    foundFroggys: Array.isArray(d.foundFroggys) ? (d.foundFroggys as string[]) : [],
    completed: Boolean(d.completed),
  }
}

export async function ensureStarted(uid: string, levelId: string): Promise<UserProgress> {
  const existing = await getProgress(uid, levelId)
  if (existing && !existing.completed) return existing
  if (existing?.completed) return existing
  const t = Date.now()
  const fresh: UserProgress = {
    uid,
    levelId,
    startedAt: t,
    completedAt: null,
    durationMs: null,
    clicks: 0,
    misses: 0,
    foundFroggys: [],
    completed: false,
  }
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    setMockProgress(fresh)
    return fresh
  }
  const db = getFirebaseDb()!
  const id = progressDocId(uid, levelId)
  await setDoc(doc(db, 'userProgress', id), {
    ...fresh,
    updatedAt: serverTimestamp(),
  })
  return fresh
}

export async function recordClick(uid: string, levelId: string, isMiss: boolean) {
  const cur = (await getProgress(uid, levelId)) ?? (await ensureStarted(uid, levelId))
  const next: UserProgress = {
    ...cur,
    clicks: cur.clicks + 1,
    misses: cur.misses + (isMiss ? 1 : 0),
  }
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    setMockProgress(next)
    return
  }
  const db = getFirebaseDb()!
  await updateDoc(doc(db, 'userProgress', progressDocId(uid, levelId)), {
    clicks: next.clicks,
    misses: next.misses,
    updatedAt: serverTimestamp(),
  })
}

export async function recordFound(uid: string, levelId: string, markerId: string) {
  const cur = (await getProgress(uid, levelId)) ?? (await ensureStarted(uid, levelId))
  if (cur.foundFroggys.includes(markerId)) return cur
  const foundFroggys = [...cur.foundFroggys, markerId]
  const next: UserProgress = { ...cur, foundFroggys }
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    setMockProgress(next)
    return next
  }
  const db = getFirebaseDb()!
  await updateDoc(doc(db, 'userProgress', progressDocId(uid, levelId)), {
    foundFroggys,
    updatedAt: serverTimestamp(),
  })
  return next
}

export async function completeLevel(uid: string, levelId: string, durationMs: number) {
  const cur = (await getProgress(uid, levelId)) ?? (await ensureStarted(uid, levelId))
  const end = Date.now()
  const next: UserProgress = {
    ...cur,
    completed: true,
    completedAt: end,
    durationMs,
  }
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    setMockProgress(next)
    return
  }
  const db = getFirebaseDb()!
  await updateDoc(doc(db, 'userProgress', progressDocId(uid, levelId)), {
    completed: true,
    completedAt: end,
    durationMs,
    updatedAt: serverTimestamp(),
  })
}

export async function listCompletedForUser(uid: string): Promise<UserProgress[]> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    return Object.values(getMockProgress()).filter((p) => p.uid === uid && p.completed)
  }
  const db = getFirebaseDb()!
  const qy = query(collection(db, 'userProgress'), where('uid', '==', uid))
  const snap = await getDocs(qy)
  return snap.docs
    .map((x) => {
      const d = x.data() as Record<string, unknown>
      return {
        uid: String(d.uid),
        levelId: String(d.levelId),
        startedAt: Number(d.startedAt),
        completedAt: d.completedAt == null ? null : Number(d.completedAt),
        durationMs: d.durationMs == null ? null : Number(d.durationMs),
        clicks: Number(d.clicks ?? 0),
        misses: Number(d.misses ?? 0),
        foundFroggys: Array.isArray(d.foundFroggys) ? (d.foundFroggys as string[]) : [],
        completed: Boolean(d.completed),
      }
    })
    .filter((p) => p.completed)
}

export async function resetProgress(uid: string, levelId: string) {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const m = getMockProgress()
    delete m[progressDocId(uid, levelId)]
    writeJson(LS_PROGRESS, m)
    return
  }
  const db = getFirebaseDb()!
  await setDoc(doc(db, 'userProgress', progressDocId(uid, levelId)), {
    uid,
    levelId,
    startedAt: Date.now(),
    completedAt: null,
    durationMs: null,
    clicks: 0,
    misses: 0,
    foundFroggys: [],
    completed: false,
    updatedAt: serverTimestamp(),
  })
}
