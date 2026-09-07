import type { FrogMarker } from '../types/models'
import { DateTime } from 'luxon'
export async function levelSignature(imageUrl: string, markers: FrogMarker[]) {
  const input = new TextEncoder().encode(JSON.stringify({ imageUrl, markers }))
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
export function berlinInput(ms: number | null) {
  return ms == null ? '' : DateTime.fromMillis(ms, { zone: 'Europe/Berlin' }).toFormat("yyyy-MM-dd'T'HH:mm")
}
export function parseBerlinInput(text: string): number | null {
  if (!text) return null
  const d = DateTime.fromISO(text, { zone: 'Europe/Berlin' })
  if (!d.isValid || d.toFormat("yyyy-MM-dd'T'HH:mm") !== text) throw new Error('Ungültige Uhrzeit in Europe/Berlin')
  return d.toMillis()
}
