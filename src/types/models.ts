export type LevelStatus = 'draft' | 'published'

export interface FrogMarker {
  id: string
  /** 0–1 relativ zur Bildbreite (links) */
  x: number
  /** 0–1 relativ zur Bildhöhe (oben) */
  y: number
  /** Radius relativ zur Anzeige-Bildbreite (0–1), Hit-Test in Pixeln: r * width */
  radius: number
}

export interface Level {
  id: string
  title: string
  imageUrl: string
  status: LevelStatus
  publishAt: number | null
  frogCount: number
  createdAt: number
  updatedAt: number
  testedSignature?: string | null
}

export interface UserProgress {
  uid: string
  levelId: string
  startedAt: number
  completedAt: number | null
  durationMs: number | null
  clicks: number
  misses: number
  foundFroggys: string[]
  completed: boolean
  hintsUsed?: number
  bestDurationMs?: number | null
  xp?: number
  attempts?: number
  lastAttemptId?: string
  activeAttempt?: GameRun | null
}

export interface GameRun {
  id: string
  startedAt: number
  durationMs: number
  clicks: number
  misses: number
  hintsUsed: number
  foundFroggys: string[]
  completed: boolean
}

export interface AppUser {
  uid: string
  name: string | null
  email: string | null
  photoURL: string | null
  createdAt: number
}

export interface LevelCompletionStats {
  levelId: string
  completions: number
  totalDurationMs: number
  totalClicks: number
  updatedAt: number
}

export interface UserSettings {
  musicEnabled: boolean
  sfxEnabled: boolean
  volume: number
  reduceMotion: boolean
  theme: 'dark' | 'light'
}
