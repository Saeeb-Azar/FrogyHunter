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

  for (const l of levels) {
    const p = await getProgress(uid, l.id)
    if (!p || !p.completed) return { level: l, isReplay: false, allComplete: false }
  }

  const last = levels[levels.length - 1]
  return { level: last, isReplay: true, allComplete: true }
}

export async function enrichLevel(level: Level): Promise<Level> {
  const fresh = await getLevel(level.id)
  return fresh ?? level
}
