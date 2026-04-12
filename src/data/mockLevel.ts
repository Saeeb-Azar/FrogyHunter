import type { FrogMarker, Level } from '../types/models'

const now = Date.now()

/** Demo-Level: Wald-Motiv (Unsplash), funktioniert ohne eigenes Hosting */
export const MOCK_DEMO_LEVEL: Level = {
  id: 'demo-moss-forest',
  title: 'Moos & Geheimnis',
  imageUrl:
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=85',
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
  { id: 'f1', x: 0.22, y: 0.72, radius: 0.055 },
  { id: 'f2', x: 0.48, y: 0.38, radius: 0.05 },
  { id: 'f3', x: 0.78, y: 0.62, radius: 0.048 },
  { id: 'f4', x: 0.62, y: 0.22, radius: 0.045 },
  { id: 'f5', x: 0.35, y: 0.55, radius: 0.05 },
]
