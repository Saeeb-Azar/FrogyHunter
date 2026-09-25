import type { FrogMarker, GameRun, UserProgress } from '../types/models'

export const MAX_HINTS = 3
export function createRun(): GameRun {
  return { id: crypto.randomUUID(), startedAt: Date.now(), durationMs: 0, clicks: 0, misses: 0, hintsUsed: 0, foundFroggys: [], completed: false }
}
export function scoreRun(run: Pick<GameRun, 'durationMs' | 'misses' | 'hintsUsed'>) {
  return 100 + Math.max(0, 60 - Math.floor(run.durationMs / 1000)) + Math.max(0, 30 - run.misses * 5) + (run.hintsUsed === 0 ? 20 : 0)
}
export function formatTime(ms: number) {
  const sec = Math.floor(Math.max(0, ms) / 1000)
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
}
export function validateMarkers(markers: FrogMarker[]) {
  return markers.length > 0 && markers.length <= 50 && new Set(markers.map(m => m.id)).size === markers.length && markers.every(m =>
    m.id && Number.isFinite(m.x) && Number.isFinite(m.y) && Number.isFinite(m.radius) &&
    m.x >= 0 && m.x <= 1 && m.y >= 0 && m.y <= 1 && m.radius >= .005 && m.radius <= .2)
}
/** Preserve the completed result while a new attempt is in progress. Replays never farm XP. */
export function mergeRun(previous: UserProgress | null, uid: string, levelId: string, run: GameRun, now = Date.now()): UserProgress {
  const base: UserProgress = previous ?? { uid, levelId, startedAt: run.startedAt, completedAt: null, durationMs: null, clicks: 0, misses: 0, foundFroggys: [], completed: false }
  if (!run.completed) return { ...base, activeAttempt: run }
  if (base.lastAttemptId === run.id) return base
  const best = base.bestDurationMs ?? (base.completed ? base.durationMs : null)
  return { ...base, startedAt: run.startedAt, durationMs: run.durationMs, clicks: run.clicks, misses: run.misses,
    foundFroggys: [...run.foundFroggys], hintsUsed: run.hintsUsed, completed: true,
    completedAt: now, bestDurationMs: best == null ? run.durationMs : Math.min(best, run.durationMs),
    xp: base.xp ?? (base.completed ? 100 : scoreRun(run)), attempts: (base.attempts ?? (base.completed ? 1 : 0)) + 1,
    lastAttemptId: run.id, activeAttempt: null }
}
/** 1–3 Sterne: ohne Hinweise und mit wenigen Fehlklicks gibt es alle drei. */
export function starsForRun(run: { misses: number; hintsUsed?: number | null }) {
  const hints = run.hintsUsed ?? 0
  if (hints === 0 && run.misses <= 3) return 3
  if (hints <= 1 && run.misses <= 8) return 2
  return 1
}
/** Profil-Level aus XP (250 XP pro Stufe). */
export function profileLevel(xp: number) {
  return { level: 1 + Math.floor(xp / 250), into: xp % 250, per: 250 }
}
