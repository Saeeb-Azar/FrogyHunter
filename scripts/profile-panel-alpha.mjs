/**
 * JPEG-Upload (ohne Alpha): sehr dunkle Pixel → transparent → profile-panel.png
 * Quelle: public/assets/profile-panel.jpg
 */
import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const SRC = join(root, 'public/assets/profile-panel.jpg')
const OUT = join(root, 'public/assets/profile-panel.png')

function knockOut(r, g, b) {
  return r < 22 && g < 22 && b < 22
}

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
if (channels !== 3) {
  console.error('Erwarte RGB (JPEG)')
  process.exit(1)
}

const out = Buffer.alloc(width * height * 4)
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  out[j] = r
  out[j + 1] = g
  out[j + 2] = b
  out[j + 3] = knockOut(r, g, b) ? 0 : 255
}

await sharp(out, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT)

console.log('OK →', OUT)
