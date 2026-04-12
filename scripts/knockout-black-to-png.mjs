/**
 * PNG mit schwarzem „Hintergrund“ → echte Transparenz (sehr dunkle Pixel → alpha 0).
 * Nutzung: node scripts/knockout-black-to-png.mjs <eingabe.png> <ausgabe.png>
 */
import sharp from 'sharp'
import { existsSync } from 'fs'
import { resolve } from 'path'

const src = resolve(process.argv[2] ?? '')
const out = resolve(process.argv[3] ?? '')
if (!src || !out) {
  console.error('Usage: node scripts/knockout-black-to-png.mjs <input.png> <output.png>')
  process.exit(1)
}
if (!existsSync(src)) {
  console.error('Datei fehlt:', src)
  process.exit(1)
}

/** Wie profile-panel-alpha: harte Kante; bei Rest-Rand Schwellwert hier anheben (z. B. 28). */
function knockOut(r, g, b) {
  return r < 24 && g < 24 && b < 24
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
if (channels !== 4) {
  console.error('Erwarte RGBA nach ensureAlpha, channels=', channels)
  process.exit(1)
}

const buf = Buffer.alloc(width * height * 4)
for (let i = 0, j = 0; i < data.length; i += 4, j += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const aIn = data[i + 3]
  if (knockOut(r, g, b)) {
    buf[j] = 0
    buf[j + 1] = 0
    buf[j + 2] = 0
    buf[j + 3] = 0
  } else {
    buf[j] = r
    buf[j + 1] = g
    buf[j + 2] = b
    buf[j + 3] = aIn
  }
}

await sharp(buf, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(out)

console.log('OK →', out, `${width}×${height}`)
