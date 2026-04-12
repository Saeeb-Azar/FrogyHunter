import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { MOCK_DEMO_MARKERS } from '../data/mockLevel'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import { LS_MARKERS, readJson, writeJson } from '../lib/mockStorage'
import type { FrogMarker } from '../types/models'

function seedMockMarkers(): Record<string, FrogMarker[]> {
  return { 'demo-moss-forest': [...MOCK_DEMO_MARKERS] }
}

function getMockMarkersMap(): Record<string, FrogMarker[]> {
  const stored = readJson<Record<string, FrogMarker[]>>(LS_MARKERS, {})
  const base = seedMockMarkers()
  const out = { ...base }
  for (const k of Object.keys(stored)) {
    out[k] = stored[k]
  }
  return out
}

function saveMockMarkersForLevel(levelId: string, markers: FrogMarker[]) {
  const map = getMockMarkersMap()
  map[levelId] = markers
  const base = seedMockMarkers()
  const custom: Record<string, FrogMarker[]> = {}
  for (const k of Object.keys(map)) {
    if (base[k] && JSON.stringify(map[k]) === JSON.stringify(base[k])) continue
    custom[k] = map[k]
  }
  writeJson(LS_MARKERS, custom)
}

export async function getMarkers(levelId: string): Promise<FrogMarker[]> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    const m = getMockMarkersMap()
    return m[levelId] ?? []
  }
  const db = getFirebaseDb()!
  const ref = doc(db, 'levelMarkers', levelId)
  const s = await getDoc(ref)
  if (!s.exists()) return []
  const data = s.data() as { markers?: FrogMarker[] }
  return Array.isArray(data.markers) ? data.markers : []
}

export async function saveMarkers(levelId: string, markers: FrogMarker[]) {
  if (!isFirebaseConfigured() || !getFirebaseDb()) {
    saveMockMarkersForLevel(levelId, markers)
    return
  }
  const db = getFirebaseDb()!
  await setDoc(
    doc(db, 'levelMarkers', levelId),
    {
      levelId,
      markers,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
