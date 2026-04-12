import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { MOCK_DEMO_LEVEL } from '../data/mockLevel'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import { LS_LEVELS, readJson, writeJson } from '../lib/mockStorage'
import type { Level, LevelStatus } from '../types/models'

function seedMockLevels(): Record<string, Level> {
  return { [MOCK_DEMO_LEVEL.id]: { ...MOCK_DEMO_LEVEL } }
}

function getMockLevelsMap(): Record<string, Level> {
  const stored = readJson<Record<string, Level>>(LS_LEVELS, {})
  const base = seedMockLevels()
  return { ...base, ...stored }
}

function saveMockLevelsMap(m: Record<string, Level>) {
  const base = seedMockLevels()
  const custom: Record<string, Level> = {}
  for (const k of Object.keys(m)) {
    if (!base[k]) custom[k] = m[k]
    else if (JSON.stringify(m[k]) !== JSON.stringify(base[k])) custom[k] = m[k]
  }
  writeJson(LS_LEVELS, custom)
}

function fireTs(n: unknown): number {
  if (n && typeof n === 'object' && 'toMillis' in n && typeof (n as Timestamp).toMillis === 'function') {
    return (n as Timestamp).toMillis()
  }
  if (typeof n === 'number') return n
  return Date.now()
}

function docToLevel(id: string, d: Record<string, unknown>): Level {
  return {
    id,
    title: String(d.title ?? ''),
    imageUrl: String(d.imageUrl ?? ''),
    status: (d.status === 'draft' ? 'draft' : 'published') as LevelStatus,
    publishAt: d.publishAt == null ? null : fireTs(d.publishAt),
    frogCount: Number(d.frogCount ?? 0),
    createdAt: fireTs(d.createdAt),
    updatedAt: fireTs(d.updatedAt),
  }
}

export async function listLevelsForAdmin(): Promise<Level[]> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const m = getMockLevelsMap()
    return Object.values(m).sort((a, b) => b.updatedAt - a.updatedAt)
  }
  const db = getFirebaseDb()!
  const snap = await getDocs(collection(db, 'levels'))
  return snap.docs.map((x) => docToLevel(x.id, x.data() as Record<string, unknown>))
}

export async function listPublishedLevels(): Promise<Level[]> {
  const now = Date.now()
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    return Object.values(getMockLevelsMap())
      .filter((l) => l.status === 'published' && (l.publishAt == null || l.publishAt <= now))
      .sort((a, b) => (a.publishAt ?? 0) - (b.publishAt ?? 0))
  }
  const db = getFirebaseDb()!
  const snap = await getDocs(collection(db, 'levels'))
  return snap.docs
    .map((x) => docToLevel(x.id, x.data() as Record<string, unknown>))
    .filter((l) => l.status === 'published')
    .filter((l) => l.publishAt == null || l.publishAt <= now)
    .sort((a, b) => (a.publishAt ?? 0) - (b.publishAt ?? 0))
}

export async function getLevel(levelId: string): Promise<Level | null> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const m = getMockLevelsMap()
    return m[levelId] ?? null
  }
  const db = getFirebaseDb()!
  const ref = doc(db, 'levels', levelId)
  const s = await getDoc(ref)
  if (!s.exists()) return null
  return docToLevel(s.id, s.data() as Record<string, unknown>)
}

export async function createLevelDraft(input: {
  title: string
  imageUrl: string
  publishAt: number | null
  status: LevelStatus
}): Promise<string> {
  const t = Date.now()
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const id = `lvl_${t}`
    const level: Level = {
      id,
      title: input.title,
      imageUrl: input.imageUrl,
      status: input.status,
      publishAt: input.publishAt,
      frogCount: 0,
      createdAt: t,
      updatedAt: t,
    }
    const m = getMockLevelsMap()
    m[id] = level
    saveMockLevelsMap(m)
    return id
  }
  const db = getFirebaseDb()!
  const ref = await addDoc(collection(db, 'levels'), {
    title: input.title,
    imageUrl: input.imageUrl,
    status: input.status,
    publishAt: input.publishAt,
    frogCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateLevel(
  levelId: string,
  patch: Partial<Pick<Level, 'title' | 'imageUrl' | 'status' | 'publishAt' | 'frogCount'>>
) {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const m = getMockLevelsMap()
    const cur = m[levelId]
    if (!cur) return
    m[levelId] = { ...cur, ...patch, updatedAt: Date.now() }
    saveMockLevelsMap(m)
    return
  }
  const db = getFirebaseDb()!
  await updateDoc(doc(db, 'levels', levelId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function setLevelImageUrl(levelId: string, imageUrl: string) {
  await updateLevel(levelId, { imageUrl })
}
