import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { mergeRun } from '../lib/gameRules'
import { readJson, writeJson, LS_PROGRESS } from '../lib/mockStorage'
import { checkDbError, supabase } from '../lib/supabase'
import type { GameRun, UserProgress } from '../types/models'

export async function saveRun(uid: string, levelId: string, run: GameRun): Promise<void> {
  if (supabase) {
    const { error } = await supabase.rpc('save_game_run', { p_level_id: levelId, p_run: run })
    checkDbError(error)
    return
  }
  const db = getFirebaseDb()
  const id = `${uid}__${levelId}`
  if (!db) {
    const all = readJson<Record<string, UserProgress>>(LS_PROGRESS, {})
    all[id] = mergeRun(all[id] ?? null, uid, levelId, run)
    writeJson(LS_PROGRESS, all)
    return
  }
  await runTransaction(db, async tx => {
    const ref = doc(db, 'userProgress', id)
    const snap = await tx.get(ref)
    const previous = snap.exists() ? snap.data() as UserProgress : null
    const next = mergeRun(previous, uid, levelId, run)
    tx.set(ref, { ...next, updatedAt: serverTimestamp() })
    if (run.completed) tx.set(doc(db, 'levelAttempts', `${uid}__${run.id}`), { uid, levelId, ...run })
  })
}
