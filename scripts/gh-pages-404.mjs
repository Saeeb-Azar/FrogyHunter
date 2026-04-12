/**
 * GitHub Pages liefert bei unbekannten Pfaden 404.html aus.
 * Kopie von index.html → Client-Routing funktioniert nach Reload/Deep-Link.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distIndex = resolve(process.cwd(), 'dist', 'index.html')
const dist404 = resolve(process.cwd(), 'dist', '404.html')

if (!existsSync(distIndex)) {
  console.warn('[gh-pages-404] dist/index.html fehlt — übersprungen.')
  process.exit(0)
}

copyFileSync(distIndex, dist404)
console.log('[gh-pages-404] dist/404.html aus index.html erstellt.')
