/** Vorgefertigte Profilbilder: der gemalte Froggy + Frosch-Gesichter in Waldfarben. */
export const AVATAR_PRESETS = [
  { id: 'froggy', label: 'Froggy' },
  { id: 'wald', label: 'Waldfrosch', body: '#4f9a22', dark: '#24501a', cheek: '#e0876f' },
  { id: 'teich', label: 'Teichfrosch', body: '#3f8fa8', dark: '#1d4a5c', cheek: '#f0a08a' },
  { id: 'rose', label: 'Rosenfrosch', body: '#d9719a', dark: '#7a2a4a', cheek: '#ffd1e0' },
  { id: 'gold', label: 'Goldfrosch', body: '#e0a21f', dark: '#6b4a06', cheek: '#ff9f7a' },
  { id: 'nacht', label: 'Nachtfrosch', body: '#7b5cc4', dark: '#352266', cheek: '#f2a0c8' },
] as const

/** Foto verkleinern (quadratisch, 192 px) und als kleine JPEG-data-URL zurückgeben. */
export async function fileToAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = url })
    const size = 192, c = document.createElement('canvas'); c.width = c.height = size
    const g = c.getContext('2d')!
    const s = Math.min(img.naturalWidth, img.naturalHeight)
    g.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size)
    return c.toDataURL('image/jpeg', 0.82)
  } finally { URL.revokeObjectURL(url) }
}
