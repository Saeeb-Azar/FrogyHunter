import type { FrogMarker, Level } from '../types/models'
import { publicUrl } from '../lib/publicUrl'

const now = Date.now()

/** Demo-Level: Wald-Motiv (Unsplash), funktioniert ohne eigenes Hosting */
export const MOCK_DEMO_LEVEL: Level = {
  id: 'demo-pond-v1',
  title: 'Das Flüstern am Waldteich',
  imageUrl: publicUrl('assets/demo-pond-v1.webp'),
  status: 'published',
  publishAt: now - 86400000,
  frogCount: 5,
  createdAt: now - 172800000,
  updatedAt: now - 3600000,
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
