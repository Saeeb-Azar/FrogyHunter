/**
 * Aggregierte Level-Statistiken (Vorbereitung für Analytics).
 * Schreiben bei Level-Abschluss optional aufrufen, sobald Reporting live geht.
 */
import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import type { LevelCompletionStats } from '../types/models'

export async function recordCompletionAggregate(levelId: string, durationMs: number, clicks: number) {
  if (!isFirebaseConfigured() || !getFirebaseDb()) return
  const db = getFirebaseDb()!
  const ref = doc(db, 'levelStats', levelId)
  await setDoc(
    ref,
    {
      levelId,
      completions: increment(1),
      totalDurationMs: increment(durationMs),
      totalClicks: increment(clicks),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function getLevelStats(levelId: string): Promise<LevelCompletionStats | null> {
  if (!isFirebaseConfigured() || !getFirebaseDb()) return null
  const db = getFirebaseDb()!
  const snap = await getDoc(doc(db, 'levelStats', levelId))
  if (!snap.exists()) return null
  const d = snap.data() as Record<string, unknown>
  return {
    levelId,
    completions: Number(d.completions ?? 0),
    totalDurationMs: Number(d.totalDurationMs ?? 0),
    totalClicks: Number(d.totalClicks ?? 0),
    updatedAt: Date.now(),
  }
}
