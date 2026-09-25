import { publicUrl } from './publicUrl'

/** Optimierte Spielgrafiken (erzeugt durch `node scripts/build-game-assets.mjs`). */
const g = (name: string) => publicUrl(`assets/game/${name}.webp`)

export const ASSET = {
  bgLobby: g('bg-lobby-phone'),
  bgPhone: g('bg-phone'),
  bgWide: g('bg-wide'),
  bgPlayWide: g('bg-play-wide'),
  btnHistorie: g('btn-historie'),
  btnEinstellungen: g('btn-einstellungen'),
  btnInfos: g('btn-infos'),
  btnSpielen: g('btn-spielen'),
  playButton: g('play-button'),
  lvlShow: g('lvl-show'),
  newLvl: g('new-lvl'),
  froggyAnzahl: g('froggy-anzahl'),
  starBox: g('star-box'),
  playPic: g('play-pic'),
  time: g('time'),
  pause: g('pause'),
  zoom: g('zoom'),
  fullscreen: g('fullscreen'),
  leerFroggy: g('leer-froggy'),
  lvlKachel: g('lvl-kachel'),
  profilePanel: g('profile-panel'),
} as const

/** CSS-Variablen, damit Stylesheets die Grafiken mit korrekter BASE_URL nutzen können. */
export function registerAssetCssVars() {
  const root = document.documentElement.style
  for (const [key, url] of Object.entries(ASSET)) {
    root.setProperty(`--a-${key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}`, `url("${url}")`)
  }
}
