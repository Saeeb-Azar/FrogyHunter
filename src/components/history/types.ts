export type MapLevelStatus = 'completed' | 'current' | 'locked'

export interface MapLevelNode {
  id: string
  levelNumber: number
  title: string
  x: number
  y: number
  status: MapLevelStatus
  completedAt: number | null
  durationMs: number | null
  clicks: number
  misses: number
  foundCount: number
}

export interface LevelCoordinate {
  x: number
  y: number
}

