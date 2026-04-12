import type { FrogMarker } from '../types/models'

export function findMarkerAtClick(
  clientX: number,
  clientY: number,
  imageRect: DOMRect,
  markers: FrogMarker[],
  alreadyFound: Set<string>
): FrogMarker | null {
  const w = imageRect.width
  const h = imageRect.height
  if (w <= 0 || h <= 0) return null

  const lx = clientX - imageRect.left
  const ly = clientY - imageRect.top
  if (lx < 0 || ly < 0 || lx > w || ly > h) return null

  let best: FrogMarker | null = null
  let bestD = Infinity

  for (const m of markers) {
    if (alreadyFound.has(m.id)) continue
    const mx = m.x * w
    const my = m.y * h
    const r = Math.max(0.008, m.radius) * w
    const d = Math.hypot(lx - mx, ly - my)
    if (d <= r && d < bestD) {
      best = m
      bestD = d
    }
  }
  return best
}

export function normalizeClickToMarkerSpace(
  clientX: number,
  clientY: number,
  imageRect: DOMRect
): { x: number; y: number } {
  const w = imageRect.width
  const h = imageRect.height
  return {
    x: (clientX - imageRect.left) / w,
    y: (clientY - imageRect.top) / h,
  }
}
