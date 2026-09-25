/**
 * Erzeugt die optimierten Spielgrafiken in public/assets/game/ aus den Original-Assets.
 * - schneidet transparente Ränder ab (trim), damit die Grafiken exakt positionierbar sind
 * - verkleinert auf mobile Größen und speichert als WebP
 * - entfernt den gemalten Frosch aus dem Lobby-Hintergrund (dort sitzt der animierte 3D-Froggy)
 *
 * Aufruf: node scripts/build-game-assets.mjs
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const OUT = 'public/assets/game'
await mkdir(OUT, { recursive: true })

/** [Quelle, Ziel, max. Breite] */
const UI = [
  ['public/assets/ui/btn_historie.png', 'btn-historie', 360],
  ['public/assets/ui/btn_einstellungen.png', 'btn-einstellungen', 360],
  ['public/assets/ui/btn_infos.png', 'btn-infos', 360],
  ['public/assets/ui/btn_spielen.png', 'btn-spielen', 360],
  ['public/assets/ui/extra-phone/play-button.png', 'play-button', 720],
  ['public/assets/ui/extra-phone/lvl-show.png', 'lvl-show', 900],
  ['public/assets/ui/new_lvl.png', 'new-lvl', 640],
  ['public/assets/ui/froggy_anzahl.png', 'froggy-anzahl', 1000],
  ['public/assets/ui/star_box.png', 'star-box', 1000],
  ['public/assets/ui/play_pic.png', 'play-pic', 1000],
  ['public/assets/ui/time.png', 'time', 800],
  ['public/assets/ui/pause.png', 'pause', 220],
  ['public/assets/ui/zoom.png', 'zoom', 220],
  ['public/assets/ui/fullscreen.png', 'fullscreen', 220],
  ['public/assets/ui/leer_froggy.png', 'leer-froggy', 180],
  ['public/assets/ui/lvl_kachel.png', 'lvl-kachel', 360],
  ['public/assets/profile-panel.png', 'profile-panel', 900],
]

for (const [src, name, width] of UI) {
  const trimmed = await sharp(src).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
  const img = sharp(trimmed.data).resize({ width: Math.min(width, trimmed.info.width), withoutEnlargement: true })
  const info = await img.webp({ quality: 88, alphaQuality: 90, effort: 5 }).toFile(`${OUT}/${name}.webp`)
  console.log(`${name}.webp`, `${info.width}x${info.height}`)
}

// Gefundener Froggy: gemalter Frosch-Kopf von froggy_anzahl.png (gleicher Stil wie die Suchbilder)
{
  const t = await sharp('public/assets/ui/froggy_anzahl.png').trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
  const L = Math.round(t.info.width * 0.4) + 20
  const { data, info } = await sharp(t.data).extract({ left: L, top: 0, width: 290, height: 116 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let y = Math.floor(info.height * 0.7); y < info.height; y++) for (let x = Math.floor(info.width * 0.72); x < info.width; x++) {
    const i = (y * info.width + x) * 4
    if (data[i] > data[i + 1] * 1.02) data[i + 3] = 0 // Holzkante (bräunlich) ausblenden
  }
  const out = await sharp(data, { raw: info }).trim({ threshold: 2 }).resize({ width: 220 }).webp({ quality: 90, alphaQuality: 95 }).toFile(`${OUT}/froggy-found.webp`)
  console.log('froggy-found.webp', `${out.width}x${out.height}`)
  // Leerer Platz: dieselbe Kopf-Form als braune Silhouette (passend zu leer_froggy.png)
  const alpha = await sharp(`${OUT}/froggy-found.webp`).ensureAlpha().extractChannel(3).toBuffer()
  const { width: ew, height: eh } = await sharp(`${OUT}/froggy-found.webp`).metadata()
  const shade = Buffer.from(`<svg width="${ew}" height="${eh}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e3818"/><stop offset="1" stop-color="#3b200e"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)
  const base = await sharp(shade).removeAlpha().toBuffer()
  await sharp(base).joinChannel(alpha).webp({ quality: 90, alphaQuality: 95 }).toFile(`${OUT}/froggy-empty.webp`)
  console.log('froggy-empty.webp')
}

// Pergament-Tafel (RGB mit dunklem Rand → Schwellwert-Zuschnitt, als 9-Slice-Panel genutzt)
{
  const t = await sharp('public/assets/ui/lvl_kachel_v2.png').trim({ threshold: 30 }).toBuffer()
  const info = await sharp(t).resize({ width: 900 }).webp({ quality: 86 }).toFile(`${OUT}/parchment.webp`)
  console.log('parchment.webp', `${info.width}x${info.height}`)
}

// Hintergründe
await sharp('public/assets/game-scene-bg.png').resize({ width: 1280 }).webp({ quality: 80 }).toFile(`${OUT}/bg-wide.webp`)
await sharp('public/assets/game_ui.png').resize({ width: 1447 }).webp({ quality: 82 }).toFile(`${OUT}/bg-play-wide.webp`)
// Demo-Suchbild Level 2 (volle Auflösung, damit Frösche beim Zoomen scharf bleiben)
await sharp('public/assets/game_ui.png').webp({ quality: 86 }).toFile(`${OUT}/demo-treehouse.webp`)

// Lobby-Hintergrund ohne gemalten Frosch: Wasser von oberhalb, Steg horizontal gespiegelt ergänzt.
{
  const src = 'public/assets/game_ui_phone.png'
  const X0 = 390, X1 = 690, Y0 = 975, Ydock = 1134, Y1 = 1272
  const w = X1 - X0, h = Y1 - Y0, dh = Y1 - Ydock, tw = 160
  const water = await sharp(src).extract({ left: X0, top: Y0 - 165, width: w, height: Ydock - Y0 }).toBuffer()
  const t1 = await sharp(src).extract({ left: X0 - tw, top: Ydock, width: tw, height: dh }).toBuffer()
  const t2 = await sharp(t1).flop().toBuffer()
  const dock = await sharp({ create: { width: w, height: dh, channels: 3, background: '#000' } })
    .composite([{ input: t2, left: 0, top: 0 }, { input: t1, left: tw, top: 0 }]).png().toBuffer()
  const patch = await sharp({ create: { width: w, height: h, channels: 3, background: '#000' } })
    .composite([{ input: water, left: 0, top: 0 }, { input: dock, left: 0, top: Ydock - Y0 }]).removeAlpha().raw().toBuffer()
  const F = 40
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t) }
  const rgba = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x
    rgba[i * 4] = patch[i * 3]; rgba[i * 4 + 1] = patch[i * 3 + 1]; rgba[i * 4 + 2] = patch[i * 3 + 2]
    rgba[i * 4 + 3] = Math.round(smooth(Math.min(x, w - 1 - x, y, h - 1 - y) / F) * 255)
  }
  const overlay = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
  const merged = await sharp(src).composite([{ input: overlay, left: X0, top: Y0 }]).png().toBuffer()
  await sharp(merged).webp({ quality: 82 }).toFile(`${OUT}/bg-lobby-phone.webp`)
  await sharp('public/assets/game_ui_phone.png').webp({ quality: 82 }).toFile(`${OUT}/bg-phone.webp`)
}
console.log('fertig')
