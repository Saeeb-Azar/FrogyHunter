/**
 * Erzeugt Herbst- und Winter-Varianten der Hintergründe aus public/assets/game/bg-*.webp.
 * Nur das Laub (Grüntöne) wird umgefärbt; Holz, Wasser, Himmel und Blüten bleiben erhalten.
 * Aufruf: node scripts/build-season-backgrounds.mjs
 */
import sharp from 'sharp'

const DIR = 'public/assets/game'
const SOURCES = ['bg-lobby-phone', 'bg-wide', 'bg-play-wide']

function rgb2hsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60; if (h < 0) h += 360
  return [h, max ? d / max : 0, max]
}
function hsv2rgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [r + m, g + m, b + m]
}
const smooth = (a, b, t) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k) }
/** weiches, großflächiges Rauschen für natürlich verteilte Laubfarben */
const noise = (x, y) => (Math.sin(x * 0.021 + Math.sin(y * 0.013) * 2) + Math.sin(y * 0.017 - x * 0.009) + Math.sin((x + y) * 0.031)) / 6 + 0.5

function autumn(r, g, b, x, y) {
  const [h, s, v] = rgb2hsv(r, g, b)
  const leaf = smooth(42, 66, h) * (1 - smooth(165, 185, h)) * smooth(0.1, 0.25, s)
  if (leaf <= 0) return [r, g, b]
  const n = noise(x, y)
  if (n < 0.12) return [r, g, b] // ein paar grüne Inseln bleiben
  const target = n < 0.38 ? 10 : n < 0.66 ? 24 : 40 // rot · orange · gold
  const [ar, ag, ab] = hsv2rgb(target, Math.min(1, s * 1.2 + 0.12), v * 0.96)
  return [r + (ar - r) * leaf, g + (ag - g) * leaf, b + (ab - b) * leaf]
}

function winter(r, g, b) {
  let [h, s, v] = rgb2hsv(r, g, b)
  const leaf = smooth(42, 66, h) * (1 - smooth(165, 185, h)) * smooth(0.1, 0.25, s)
  const flower = smooth(285, 305, h) * smooth(0.2, 0.4, s)
  const water = smooth(170, 190, h) * (1 - smooth(230, 250, h))
  // Laub: dunkle Tannen + Schnee auf hellen Flächen
  if (leaf > 0) {
    const snow = smooth(0.22, 0.62, v) * 0.95
    const nh = h + (195 - h) * leaf * 0.7, ns = s * (1 - 0.75 * leaf), nv = v * (1 - 0.2 * leaf)
    ;[h, s, v] = [nh, ns * (1 - snow * leaf), nv + (1 - nv) * snow * leaf]
  }
  if (flower > 0) { s *= 1 - 0.55 * flower }
  if (water > 0) { s *= 1 - 0.45 * water; v = Math.min(1, v * (1 + 0.12 * water)) }
  s *= 0.78 // insgesamt kühler und blasser
  const [nr, ng, nb] = hsv2rgb(h, s, v)
  return [nr * 0.97, ng * 0.99, Math.min(1, nb * 1.04 + 0.02)]
}

for (const name of SOURCES) {
  const { data, info } = await sharp(`${DIR}/${name}.webp`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  for (const [season, fn] of [['autumn', autumn], ['winter', winter]]) {
    const out = Buffer.alloc(data.length)
    for (let i = 0, p = 0; i < data.length; i += 3, p++) {
      const x = p % info.width, y = (p / info.width) | 0
      const [r, g, b] = fn(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, x, y)
      out[i] = Math.round(Math.max(0, Math.min(1, r)) * 255); out[i + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255); out[i + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255)
    }
    await sharp(out, { raw: info }).webp({ quality: 82 }).toFile(`${DIR}/${name}-${season}.webp`)
    console.log(`${name}-${season}.webp`)
  }
}
