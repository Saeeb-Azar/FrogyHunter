import { getLevel, listPublishedLevels } from '../services/levelsService'
import { getProgress } from '../services/progressService'
import type { Level } from '../types/models'

export interface CurrentLevelResult {
  level: Level | null
  isReplay: boolean
  allComplete: boolean
}

export async function resolveCurrentLevel(uid: string): Promise<CurrentLevelResult> {
  const levels = await listPublishedLevels()
  if (!levels.length) return { level: null, isReplay: false, allComplete: true }

  const last = levels[levels.length - 1]
  const p = await getProgress(uid, last.id)
  return { level: last, isReplay: Boolean(p?.completed), allComplete: Boolean(p?.completed) }
}

export async function enrichLevel(level: Level): Promise<Level> {
  const fresh = await getLevel(level.id)
  return fresh ?? level
}
