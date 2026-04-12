/**
 * Ein durchgehender Schlangenweg (SVG userSpace 0–100).
 * Wird für Hintergrund-Pfad und Level-Positionen genutzt.
 */
export const MAP_SNAKE_PATH =
  'M 50 102 C 66 94 74 82 56 72 C 38 62 24 50 58 42 C 92 34 76 22 48 14 C 20 6 38 0 50 -2'

/** Ungefähre Stützpunkte entlang der S-Kurve (Prozent der Map). */
export const MAP_SNAKE_LEVEL_POINTS: { x: number; y: number }[] = [
  { x: 50, y: 94 },
  { x: 62, y: 86 },
  { x: 55, y: 76 },
  { x: 40, y: 66 },
  { x: 54, y: 56 },
  { x: 64, y: 46 },
  { x: 52, y: 36 },
  { x: 44, y: 26 },
  { x: 52, y: 18 },
  { x: 48, y: 12 },
  { x: 50, y: 6 },
]
