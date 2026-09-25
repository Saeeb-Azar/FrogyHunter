import type { FrogMarker, Level } from '../types/models'
import { publicUrl } from '../lib/publicUrl'

const now = Date.now()
const DAY = 86400000

/** Demo-Level 1: Waldteich (Hochformat) */
export const MOCK_DEMO_LEVEL: Level = {
  id: 'demo-pond-v1',
  title: 'Das Flüstern am Waldteich',
  imageUrl: publicUrl('assets/demo-pond-v1.webp'),
  status: 'published',
  publishAt: now - 8 * DAY,
  frogCount: 5,
  createdAt: now - 9 * DAY,
  updatedAt: now - 8 * DAY,
}

/**
 * Normalisierte Positionen – passend zum Demo-Bild.
 * Im Admin-Editor neu setzen, wenn du ein anderes Bild verwendest.
 */
export const MOCK_DEMO_MARKERS: FrogMarker[] = [
  { id: 'f1', x: 0.195, y: 0.123, radius: 0.060 },
  { id: 'f2', x: 0.866, y: 0.230, radius: 0.045 },
  { id: 'f3', x: 0.442, y: 0.523, radius: 0.052 },
  { id: 'f4', x: 0.162, y: 0.694, radius: 0.055 },
  { id: 'f5', x: 0.775, y: 0.787, radius: 0.065 },
]

/** Demo-Level 2: Baumhaus-Lichtung (Querformat, aus `public/assets/game_ui.png`) */
export const MOCK_DEMO_LEVEL_2: Level = {
  id: 'demo-treehouse-v1',
  title: 'Die Baumhaus-Lichtung',
  imageUrl: publicUrl('assets/game/demo-treehouse.webp'),
  status: 'published',
  publishAt: now - 1 * DAY,
  frogCount: 7,
  createdAt: now - 2 * DAY,
  updatedAt: now - 1 * DAY,
}

export const MOCK_DEMO_MARKERS_2: FrogMarker[] = [
  { id: 't1', x: 0.038, y: 0.247, radius: 0.03 },
  { id: 't2', x: 0.047, y: 0.387, radius: 0.03 },
  { id: 't3', x: 0.245, y: 0.355, radius: 0.026 },
  { id: 't4', x: 0.835, y: 0.129, radius: 0.028 },
  { id: 't5', x: 0.873, y: 0.366, radius: 0.028 },
  { id: 't6', x: 0.257, y: 0.716, radius: 0.03 },
  { id: 't7', x: 0.780, y: 0.758, radius: 0.026 },
]

export const MOCK_LEVELS: Level[] = [MOCK_DEMO_LEVEL, MOCK_DEMO_LEVEL_2]
export const MOCK_MARKERS: Record<string, FrogMarker[]> = {
  [MOCK_DEMO_LEVEL.id]: MOCK_DEMO_MARKERS,
  [MOCK_DEMO_LEVEL_2.id]: MOCK_DEMO_MARKERS_2,
}
