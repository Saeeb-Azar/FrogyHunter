import * as THREE from 'three'

/**
 * Original, vollständig prozeduraler 3D-Froggy (keine externen Modelle/Texturen).
 *
 * Varianten:
 * - `hero`  – Lobby: sitzt auf einem Seerosenblatt, schaut dem Finger nach, quakt, fängt Fliegen.
 * - `token` – Level-Karte: kleiner Spielstein-Frosch, springt per `hop()` von Level zu Level.
 * - `party` – Sieg: hüpft und jubelt in Dauerschleife.
 */
export type FroggyVariant = 'hero' | 'token' | 'party'

export interface FroggySceneOptions {
  variant?: FroggyVariant
  reduceMotion?: boolean
  onReady?: () => void
  onError?: () => void
}

export interface FroggySceneHandle {
  dispose(): void
  /** Großer Freudensprung mit Drehung. */
  celebrate(): void
  /** Kurzer Sprung (Dauer in ms), z. B. während der Karten-Animation. */
  hop(durationMs?: number): void
  /** Blickrichtung um die Hochachse (Radiant, 0 = zur Kamera). */
  face(angle: number): void
}

const NOOP: FroggySceneHandle = { dispose() {}, celebrate() {}, hop() {}, face() {} }

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62)
  grad.addColorStop(0, 'rgba(10,30,20,0.55)')
  grad.addColorStop(0.6, 'rgba(10,30,20,0.22)')
  grad.addColorStop(1, 'rgba(10,30,20,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 1, 32, 32, 30)
  grad.addColorStop(0, 'rgba(255,255,220,1)')
  grad.addColorStop(0.25, 'rgba(255,240,150,0.8)')
  grad.addColorStop(1, 'rgba(255,220,90,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Kleiner deterministischer Zufall für die Hautmuster. */
function seeded(seed: number) {
  let t = seed
  return () => { t = (t * 1664525 + 1013904223) >>> 0; return t / 4294967296 }
}

/** Froschhaut: dunklerer Rücken, hellere Flanken, weiche Flecken, feine Poren (Farbe + Relief). */
function skinTextures() {
  const W = 512, H = 256
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#3f8a1f'); grad.addColorStop(0.35, '#58a42a'); grad.addColorStop(0.62, '#78bb38'); grad.addColorStop(1, '#bcd86c')
  g.fillStyle = grad; g.fillRect(0, 0, W, H)
  const r = seeded(7)
  g.globalCompositeOperation = 'multiply'
  for (let i = 0; i < 18; i++) {
    const x = r() * W, y = r() * H * 0.62, rad = 6 + r() * 16
    const sp = g.createRadialGradient(x, y, 0, x, y, rad)
    sp.addColorStop(0, 'rgba(60,110,30,0.45)'); sp.addColorStop(0.7, 'rgba(70,120,35,0.2)'); sp.addColorStop(1, 'rgba(60,110,30,0)')
    g.fillStyle = sp; g.beginPath(); g.ellipse(x, y, rad * 1.3, rad, r() * 3, 0, Math.PI * 2); g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  for (let i = 0; i < 2600; i++) {
    const x = r() * W, y = r() * H, a = r()
    g.fillStyle = a > 0.55 ? `rgba(235,255,170,${0.08 + r() * 0.12})` : `rgba(20,50,10,${0.08 + r() * 0.14})`
    g.fillRect(x, y, 1 + r() * 1.5, 1 + r() * 1.5)
  }
  const bump = document.createElement('canvas'); bump.width = W; bump.height = H
  const b = bump.getContext('2d')!
  b.fillStyle = '#808080'; b.fillRect(0, 0, W, H)
  const r2 = seeded(11)
  for (let i = 0; i < 1800; i++) {
    const x = r2() * W, y = r2() * H, rad = 0.8 + r2() * 2.4
    b.fillStyle = `rgba(255,255,255,${0.25 + r2() * 0.35})`; b.beginPath(); b.arc(x, y, rad, 0, Math.PI * 2); b.fill()
  }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = THREE.RepeatWrapping
  const bumpMap = new THREE.CanvasTexture(bump); bumpMap.wrapS = THREE.RepeatWrapping
  return { map, bumpMap }
}

/** Frosch-Auge: goldene Iris mit Maserung, dunkler Rand, waagerechte Pupille, Glanzpunkte. */
function irisTexture() {
  const S = 256
  const c = document.createElement('canvas'); c.width = c.height = S
  const g = c.getContext('2d')!
  const m = S / 2
  // Süße Kulleraugen: warmes Haselnussbraun, riesige runde Pupille, große Lichtpunkte
  const base = g.createRadialGradient(m, m, 20, m, m, m)
  base.addColorStop(0, '#9a6a2a'); base.addColorStop(0.7, '#6b4418'); base.addColorStop(0.93, '#3a2410'); base.addColorStop(1, '#241408')
  g.fillStyle = base; g.beginPath(); g.arc(m, m, m, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#0d0907'; g.beginPath(); g.arc(m, m + 4, m * 0.7, 0, Math.PI * 2); g.fill()
  g.fillStyle = 'rgba(255,255,255,0.97)'; g.beginPath(); g.ellipse(m - 34, m - 36, 30, 26, -0.5, 0, Math.PI * 2); g.fill()
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(m + 30, m + 34, 12, 0, Math.PI * 2); g.fill()
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(m + 44, m - 14, 6, 0, Math.PI * 2); g.fill()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function mountFroggyScene(container: HTMLElement, options: FroggySceneOptions = {}): FroggySceneHandle {
  const variant = options.variant ?? 'hero'
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch {
    options.onError?.()
    return NOOP
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(variant === 'token' ? 30 : 34, 1, 0.1, 60)
  const lookY = variant === 'token' ? 0.85 : 1.0
  scene.add(new THREE.HemisphereLight(0xfff0d0, 0x1f4a33, 1.55))
  const key = new THREE.DirectionalLight(0xffe2a8, 2.9)
  key.position.set(-3, 6, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x9fe8ff, 1.8)
  rim.position.set(4, 3, -4)
  scene.add(rim)
  const fill = new THREE.PointLight(0xffd27a, 3, 12)
  fill.position.set(2, 1.5, 3)
  scene.add(fill)

  const textures: THREE.Texture[] = []
  const mats: THREE.Material[] = []
  const phys = (color: number, extra: THREE.MeshPhysicalMaterialParameters = {}) => {
    const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35, ...extra })
    mats.push(m)
    return m
  }
  const std = (color: number, roughness = 0.5, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra })
    mats.push(m)
    return m
  }

  const skin = skinTextures()
  textures.push(skin.map, skin.bumpMap)
  const green = phys(0xffffff, { map: skin.map, bumpMap: skin.bumpMap, bumpScale: 0.6, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.14, sheen: 0.3, sheenColor: new THREE.Color(0x9fd060) })
  const lightGreen = phys(0x6fae30, { bumpMap: skin.bumpMap, bumpScale: 0.4, clearcoat: 0.9, clearcoatRoughness: 0.18 })
  const darkGreen = std(0x24501a, 0.6)
  const spotMat = phys(0x2f6f18)
  const cream = phys(0xdcc47c, { bumpMap: skin.bumpMap, bumpScale: 0.3, clearcoat: 0.5, roughness: 0.5 })
  const white = std(0xffffff, 0.15, { emissive: 0xffffff, emissiveIntensity: 0.35 })
  const tongueMat = phys(0xff6f8e, { clearcoat: 1, roughness: 0.25 })

  const sphere = new THREE.SphereGeometry(1, 32, 24)
  const mesh = (parent: THREE.Object3D, mat: THREE.Material, p: number[], s: number[], geo: THREE.BufferGeometry = sphere) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(p[0], p[1], p[2])
    m.scale.set(s[0], s[1], s[2])
    parent.add(m)
    return m
  }

  const world = new THREE.Group()
  scene.add(world)

  // Weicher Kontaktschatten
  const shadowTex = shadowTexture()
  textures.push(shadowTex)
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  mats.push(shadowMat)
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = variant === 'hero' ? 0.165 : 0.01
  world.add(shadow)

  // Seerosenblatt + Blüte (nur Lobby)
  const lilies: THREE.Mesh[] = []
  const ripples: THREE.Mesh[] = []
  if (variant === 'hero') {
    const leafMat = phys(0x5fae3e, { clearcoat: 0.8, clearcoatRoughness: 0.2 })
    const veinMat = std(0x3f8a2c, 0.6)
    const lilyGeo = new THREE.CylinderGeometry(1, 1, 0.06, 56, 1, false, 0.25, Math.PI * 2 - 0.5)
    for (const [x, z, size, rot] of [[0, 0, 1.25, 2.6], [-1.75, 0.55, 0.5, 1.7], [1.7, -0.35, 0.62, -0.8]] as const) {
      const lily = mesh(world, leafMat, [x, 0.12, z], [size, 1, size * 0.86], lilyGeo)
      lily.rotation.y = rot
      lilies.push(lily)
      for (let v = 0; v < 6; v++) {
        const vein = mesh(lily, veinMat, [0, 0.035, 0], [0.012, 0.01, 0.92], new THREE.BoxGeometry(1, 1, 1))
        vein.rotation.y = 0.25 + v * ((Math.PI * 2 - 0.5) / 6)
        vein.position.set(Math.sin(vein.rotation.y) * 0.46, 0.035, Math.cos(vein.rotation.y) * 0.46)
      }
    }
    const flower = new THREE.Group()
    flower.position.set(1.72, 0.2, -0.35)
    world.add(flower)
    const petalMat = phys(0xffa6c9, { clearcoat: 0.4 })
    const petalMatIn = phys(0xffd4e5)
    for (let ring = 0; ring < 2; ring++) {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI * 2 / 8 + ring * 0.4
        const r = ring ? 0.1 : 0.17
        const petal = mesh(flower, ring ? petalMatIn : petalMat, [Math.sin(a) * r, 0.06 + ring * 0.05, Math.cos(a) * r], [0.07, 0.035, 0.2 - ring * 0.05])
        petal.rotation.y = a
        petal.rotation.x = -0.5 - ring * 0.4
      }
    }
    mesh(flower, std(0xffc745, 0.4, { emissive: 0x805000, emissiveIntensity: 0.3 }), [0, 0.13, 0], [0.07, 0.05, 0.07])
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xdffff6, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })
    mats.push(rippleMat)
    for (let i = 0; i < 3; i++) {
      const r = mesh(world, rippleMat, [0, 0.1, 0], [1, 1, 1], new THREE.RingGeometry(1.3, 1.33, 72))
      r.rotation.x = -Math.PI / 2
      r.userData.offset = i / 3
      ripples.push(r)
    }
  }

  // ---------- Froggy ----------
  const frog = new THREE.Group()
  const baseY = variant === 'hero' ? 0.19 : 0.02
  frog.position.y = baseY
  world.add(frog)
  const body = new THREE.Group()
  frog.add(body)
  mesh(body, green, [0, 0.66, -0.02], [0.8, 0.76, 0.64])
  mesh(body, cream, [0, 0.6, 0.47], [0.56, 0.56, 0.2])
  for (const [x, y, z, s] of [[-0.42, 0.95, -0.35, 0.13], [0.38, 0.72, -0.5, 0.11], [0.05, 1.05, -0.5, 0.09], [-0.2, 0.5, -0.55, 0.1]]) {
    mesh(body, spotMat, [x, y, z], [s, s * 0.7, s * 0.5])
  }
  // Kehlsack (quakt)
  const throat = mesh(body, cream, [0, 0.93, 0.5], [0.3, 0.2, 0.16])
  const head = new THREE.Group()
  head.position.set(0, 1.25, 0.12)
  body.add(head)
  mesh(head, green, [0, 0, 0], [0.94, 0.58, 0.68])
  // Unterkiefer (klappt zum Fliegenfangen auf) + Mundinnenraum
  const jaw = new THREE.Group()
  jaw.position.set(0, -0.1, 0.12)
  head.add(jaw)
  mesh(jaw, lightGreen, [0, -0.02, 0.33], [0.74, 0.29, 0.25])
  const mouthInside = mesh(head, std(0x8a2a3a, 0.6), [0, -0.2, 0.5], [0.5, 0.1, 0.16])
  mouthInside.visible = false
  const pupils: THREE.Mesh[] = []
  const hips: THREE.Group[] = []
  const shins: THREE.Group[] = []
  const irisTex = irisTexture()
  textures.push(irisTex)
  const irisMat = new THREE.MeshBasicMaterial({ map: irisTex, transparent: true })
  mats.push(irisMat)
  const irisGeo = new THREE.CircleGeometry(1, 40)
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xff9a9a, transparent: true, opacity: 0.55, depthWrite: false })
  mats.push(blushMat)
  const lids: THREE.Mesh[] = []
  for (const side of [-1, 1]) {
    mesh(head, green, [side * 0.47, 0.44, 0.07], [0.41, 0.47, 0.37])
    mesh(head, std(0xfffcf2, 0.2), [side * 0.47, 0.49, 0.3], [0.31, 0.35, 0.2])
    const irisDisc = mesh(head, irisMat, [side * 0.47, 0.49, 0.504], [0.24, 0.26, 1], irisGeo)
    // rosa Bäckchen, flach auf der Wange
    const blush = mesh(head, blushMat, [side * 0.6, -0.1, 0.53], [0.13, 0.075, 0.02])
    blush.rotation.y = side * 0.75
    irisDisc.userData.base = 0.26
    irisDisc.userData.home = irisDisc.position.clone()
    pupils.push(irisDisc)
    const lid = mesh(head, green, [side * 0.47, 0.52, 0.34], [0.33, 0.001, 0.22])
    lids.push(lid)
    mesh(head, darkGreen, [side * 0.15, 0.03, 0.66], [0.03, 0.02, 0.012])
    // Beine, Arme, Füße
    // Hinterbein mit Gelenk: sitzt eingeklappt, streckt sich beim Absprung nach hinten
    const hip = new THREE.Group()
    hip.position.set(side * 0.62, 0.36, -0.12)
    hip.userData.side = side
    frog.add(hip)
    mesh(hip, green, [side * 0.1, -0.06, 0.18], [0.44, 0.36, 0.48])
    const shin = new THREE.Group()
    shin.position.set(side * 0.14, -0.2, 0.42)
    hip.add(shin)
    mesh(shin, lightGreen, [0, 0, -0.22], [0.13, 0.12, 0.3])
    const hindFoot = mesh(shin, lightGreen, [0, -0.08, -0.5], [0.16, 0.05, 0.26])
    for (let t = 0; t < 3; t++) mesh(hindFoot, cream, [(t - 1) * 0.55, 0, -0.9], [0.28, 0.9, 0.22])
    hips.push(hip); shins.push(shin)
    const arm = mesh(body, lightGreen, [side * 0.58, 0.38, 0.5], [0.16, 0.38, 0.17])
    arm.rotation.z = side * 0.22
    arm.userData.side = side
    mesh(frog, lightGreen, [side * 0.58, 0.09, 0.7], [0.27, 0.1, 0.28])
    for (let toe = 0; toe < 3; toe++) {
      mesh(frog, lightGreen, [side * 0.58 + (toe - 1) * 0.16, 0.075, 0.9], [0.085, 0.06, 0.16])
      mesh(frog, cream, [side * 0.58 + (toe - 1) * 0.17, 0.07, 1.04], [0.055, 0.045, 0.05])
    }
  }
  const arms = body.children.filter(c => c.userData.side) as THREE.Mesh[]
  const smile = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.37, -0.12, 0.66), new THREE.Vector3(-0.19, -0.24, 0.69), new THREE.Vector3(0, -0.26, 0.695),
    new THREE.Vector3(0.19, -0.24, 0.69), new THREE.Vector3(0.37, -0.12, 0.66),
  ])
  mesh(head, darkGreen, [0, 0, 0], [1, 1, 1], new THREE.TubeGeometry(smile, 28, 0.02, 8, false))

  // Zunge (Fliegenfang)
  const tongue = mesh(head, tongueMat, [0, -0.2, 0.62], [0.07, 0.07, 0.001], new THREE.CylinderGeometry(1, 1, 1, 12).rotateX(Math.PI / 2).translate(0, 0, 0.5))
  const tongueTip = mesh(tongue, tongueMat, [0, 0, 1], [1.6, 1.6, 1])
  tongue.visible = false

  // Fliege (Froggys Lieblingssnack): Körper, große Augen, schlagende Flügel + kleiner Leuchtschein
  let fly: THREE.Group | null = null
  const wings: THREE.Object3D[] = []
  let flyHalo: THREE.Sprite | null = null
  if (variant === 'hero') {
    fly = new THREE.Group()
    const flyBody = phys(0x3d6a8c, { roughness: 0.3, metalness: 0.35, clearcoat: 1, iridescence: 0.6 })
    const flyStripe = phys(0xffc93c, { roughness: 0.35 })
    const flyEye = phys(0x2a1a14, { clearcoat: 1, clearcoatRoughness: 0.05, roughness: 0.15 })
    mesh(fly, flyBody, [0, 0, -0.1], [0.13, 0.12, 0.2])
    mesh(fly, flyStripe, [0, 0.005, -0.12], [0.135, 0.125, 0.04])
    mesh(fly, flyStripe, [0, 0.005, -0.2], [0.11, 0.1, 0.035])
    mesh(fly, flyBody, [0, 0.02, 0.1], [0.12, 0.11, 0.11])
    for (const side of [-1, 1]) {
      const eye = mesh(fly, flyEye, [side * 0.08, 0.06, 0.17], [0.085, 0.09, 0.075])
      mesh(eye, white, [-0.3, 0.45, 0.7], [0.3, 0.3, 0.3])
      const wingMat = new THREE.MeshPhysicalMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.82, emissive: 0x9fd8ff, emissiveIntensity: 0.25, roughness: 0.1, iridescence: 1, side: THREE.DoubleSide, depthWrite: false })
      mats.push(wingMat)
      const pivot = new THREE.Group()
      pivot.position.set(side * 0.05, 0.1, 0.02)
      fly.add(pivot)
      const wing = mesh(pivot, wingMat, [side * 0.2, 0, -0.06], [0.22, 1, 0.11], new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2))
      wing.userData.side = side
      wings.push(pivot)
    }
    fly.scale.setScalar(1.45)
    scene.add(fly)
    const glow = glowTexture()
    textures.push(glow)
    const haloMat = new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0.35, depthWrite: false })
    mats.push(haloMat)
    flyHalo = new THREE.Sprite(haloMat)
    flyHalo.scale.setScalar(0.9)
    scene.add(flyHalo)
  }
  const flyPrev = new THREE.Vector3()

  // Party-Konfetti in 3D
  const confetti: THREE.Mesh[] = []
  if (variant === 'party') {
    const colors = [0xffd23f, 0xff6f91, 0x7bd8ff, 0x9dff6a, 0xffffff]
    const geo = new THREE.PlaneGeometry(0.09, 0.14)
    for (let i = 0; i < 46; i++) {
      const m = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide })
      mats.push(m)
      const c = new THREE.Mesh(geo, m)
      c.userData = { speed: 0.6 + Math.random() * 0.9, spin: 1 + Math.random() * 4, x: (Math.random() - 0.5) * 5, phase: Math.random() * 10 }
      scene.add(c)
      confetti.push(c)
    }
  }

  // ---------- Animation ----------
  let disposed = false, raf = 0, time = 0, last = 0, visible = !document.hidden
  let celebration = -10, hopStart = -10, hopDur = 0.45, hopHeight = 0.5, hopSpin = 0
  // Zufällige Lobby-Aktionen: umschauen, hüpfen, umdrehen, quaken
  type Action = 'look' | 'hop' | 'turn' | 'croak' | 'spinhop'
  let action: Action | null = null, actionStart = 0, nextAction = 2.5, lookDir = 1, croakBoost = 0
  const startHop = (dur: number, height: number, spinAmount = 0) => { hopStart = time; hopDur = dur; hopHeight = height; hopSpin = spinAmount }
  let facing = 0, facingTarget = 0
  let tongueStart = -10, nextTongue = 5, lookOffset = 0, pointerAt = -10
  const pointer = new THREE.Vector2()
  const pointerMove = (e: PointerEvent) => {
    pointerAt = time
    const r = container.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 2, ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2)
  }
  const pointerLeave = () => pointer.set(0, 0)
  const resize = () => {
    if (disposed) return
    const w = Math.max(container.clientWidth, 1), h = Math.max(container.clientHeight, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    if (variant === 'token') camera.position.set(0, 2.6, 6.4)
    else if (variant === 'party') camera.position.set(0, 2.4, camera.aspect < 0.9 ? 8.4 : 7.2)
    else camera.position.set(0, 3.2, camera.aspect < 0.85 ? 9.6 : 8.2)
    camera.lookAt(0, lookY, 0)
    camera.updateProjectionMatrix()
  }
  const flyPos = new THREE.Vector3()

  const draw = (stamp: number) => {
    if (disposed || !visible) return
    const dt = last ? Math.min((stamp - last) / 1000, 0.05) : 0
    last = stamp
    time += dt
    const still = false

    if (!still) {
      // Atmen + Kehlsack
      body.scale.y = 1 + Math.sin(time * 2.3) * 0.018
      const croakPhase = time % 6.5
      const croak = croakPhase > 5.6 ? Math.sin((croakPhase - 5.6) / 0.9 * Math.PI * 3) : 0
      const puff = Math.max(0, croak)
      throat.scale.set(0.3 + puff * 0.2, 0.2 + puff * 0.17, 0.16 + puff * 0.2)

      // Kopf folgt Finger/Maus
      // Jagdblick: Kopf und Augen verfolgen die Fliege (Finger/Maus hat kurz Vorrang)
      const hunting = variant === 'hero' && fly?.visible && time - pointerAt > 2
      const yawT = hunting ? Math.max(-0.5, Math.min(0.5, Math.atan2(flyPos.x, flyPos.z + 1.2) * 0.6)) : pointer.x * 0.2
      const pitchT = hunting ? -Math.atan2(flyPos.y - 2.0, 3) * 0.5 : pointer.y * 0.1
      head.rotation.y += (yawT + (hunting ? lookOffset * 0.3 : lookOffset) - head.rotation.y) * Math.min(dt * 6, 1)
      head.rotation.x += (pitchT - head.rotation.x) * Math.min(dt * 6, 1)
      if (fly) {
        const local = head.worldToLocal(flyPos.clone())
        const ex = hunting ? Math.max(-1, Math.min(1, local.x / 2.2)) : pointer.x * 0.6
        const ey = hunting ? Math.max(-1, Math.min(1, (local.y - 0.5) / 1.6)) : -pointer.y * 0.5
        pupils.forEach(p => { const h = p.userData.home as THREE.Vector3; p.position.set(h.x + ex * 0.07, h.y + ey * 0.06, h.z) })
      }

      // Blinzeln
      const blinkPhase = time % 4.3
      const blink = blinkPhase > 4.08 ? Math.sin((blinkPhase - 4.08) / 0.22 * Math.PI) : 0
      pupils.forEach(p => { p.scale.y = p.userData.base * Math.max(0.03, 1 - blink) })
      lids.forEach(l => { l.visible = blink > 0.02; l.scale.y = 0.34 * blink + 0.001 })

      // ---------- Zufällige Aktionen (nur Lobby) ----------
      if (variant === 'hero') {
        if (!action && time > nextAction && time - celebration > 1.4 && time - hopStart > hopDur + 0.3) {
          const roll = Math.random()
          action = roll < 0.28 ? 'look' : roll < 0.52 ? 'hop' : roll < 0.7 ? 'turn' : roll < 0.86 ? 'croak' : 'spinhop'
          actionStart = time
          lookDir = Math.random() > 0.5 ? 1 : -1
          if (action === 'hop') startHop(0.75, 0.55)
          if (action === 'spinhop') startHop(1.0, 0.9, Math.PI * 2 * lookDir)
          if (action === 'turn') { facingTarget = lookDir * 1.2; startHop(0.6, 0.35) }
        }
        const ae = time - actionStart
        if (action === 'look') {
          const k = ae < 0.5 ? easeOut(ae / 0.5) : ae < 1.3 ? 1 : ae < 1.7 ? -1 : ae < 2.3 ? 1 - easeOut((ae - 1.7) / 0.6) : 0
          lookOffset = k * lookDir * 0.75
          if (ae > 2.3) { action = null; lookOffset = 0 }
        } else if (action === 'turn') {
          if (ae > 1.8 && ae < 1.82 && facingTarget !== 0) { facingTarget = 0; startHop(0.6, 0.35) }
          if (ae > 2.6) action = null
        } else if (action === 'croak') {
          croakBoost = ae < 1.4 ? Math.max(0, Math.sin(ae / 1.4 * Math.PI * 4)) : 0
          if (ae > 1.4) { action = null; croakBoost = 0 }
        } else if (action && ae > hopDur + 0.4) action = null
        if (!action && nextAction < time) nextAction = time + 2.2 + Math.random() * 3.5
      }
      if (croakBoost > 0) throat.scale.set(0.3 + croakBoost * 0.28, 0.2 + croakBoost * 0.24, 0.16 + croakBoost * 0.3)

      // ---------- Realistischer Sprung: Ducken → Absprung → Flug → Landung ----------
      let lift = 0, squash = 1, spin = 0, legs = 0, pitch = 0
      const jump = (e: number, dur: number, height: number) => {
        const t = e / dur
        if (t < 0.22) { const k = Math.sin(t / 0.22 * Math.PI * 0.5); return { lift: 0, squash: 1 - k * 0.2, legs: -k * 0.25, pitch: k * 0.18, air: 0 } }
        if (t < 0.82) {
          const a = (t - 0.22) / 0.6
          return { lift: 4 * a * (1 - a) * height, squash: 1.14 - a * 0.14, legs: a < 0.5 ? 1 : 1 - (a - 0.5) * 2 * 0.8, pitch: -0.35 + a * 0.55, air: a }
        }
        const k = Math.sin((t - 0.82) / 0.18 * Math.PI)
        return { lift: 0, squash: 1 - k * 0.18, legs: -k * 0.2, pitch: k * 0.12, air: 1 }
      }
      const ce = time - celebration
      if (ce < 1.2) {
        const j = jump(ce, 1.2, variant === 'token' ? 0.3 : 1.3)
        lift = j.lift; squash = j.squash; legs = j.legs; pitch = j.pitch
        spin = easeOut(j.air) * Math.PI * 2
        arms.forEach(a => { a.rotation.z = a.userData.side * (0.22 + (j.air > 0 && j.air < 1 ? 1.3 : 0)) })
      }
      const he = time - hopStart
      if (he < hopDur) {
        const j = jump(he, hopDur, variant === 'token' ? 0.22 : hopHeight)
        if (ce >= 1.2) { lift = j.lift; squash = j.squash; legs = j.legs; pitch = j.pitch; spin = hopSpin * easeOut(j.air) }
      }
      if (variant === 'party') {
        const pt = time % 0.95
        const j = jump(pt, 0.95, 0.85)
        lift = Math.max(lift, j.lift); squash = j.squash; legs = j.legs; pitch = j.pitch
        arms.forEach(a => { a.rotation.z = a.userData.side * (0.22 + Math.abs(Math.sin(time * 7)) * 1.4) })
        facingTarget = Math.sin(time * 1.4) * 0.5
      }
      if (ce >= 1.2 && variant !== 'party') arms.forEach(a => { a.rotation.z += (a.userData.side * 0.22 - a.rotation.z) * Math.min(dt * 8, 1) })
      hips.forEach(h => { h.rotation.x = Math.max(0, legs) * 1.05; h.position.y = 0.36 + Math.min(0, legs) * 0.2 })
      shins.forEach(sh => { sh.rotation.x = Math.max(0, legs) * 0.9 })
      body.rotation.x = pitch
      frog.position.y = baseY + lift
      frog.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash))
      facing += (facingTarget - facing) * Math.min(dt * 6, 1)
      frog.rotation.y = facing + spin
      shadow.scale.setScalar(1 - Math.min(lift, 1.2) * 0.35)
      shadowMat.opacity = 1 - Math.min(lift, 1.2) * 0.5

      lilies.forEach((l, i) => { l.rotation.z = Math.sin(time * 1.3 + i) * 0.015; l.position.y = 0.12 + Math.sin(time * 1.1 + i * 2) * 0.012 })
      ripples.forEach(r => {
        const phase = (time * 0.2 + r.userData.offset) % 1
        r.scale.setScalar(1 + phase * 0.7)
        ;(r.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - phase)
      })

      // Fliege fliegt Achten; Froggy schnappt ab und zu mit der Zunge danach
      if (fly && flyHalo) {
        const ft = time * 0.62
        flyPrev.copy(flyPos)
        flyPos.set(Math.sin(ft) * 3.1, 2.3 + Math.sin(ft * 2) * 0.45 + Math.sin(time * 9) * 0.05, 1.3 + Math.cos(ft) * 1.0)
        const te = time - tongueStart
        if (time > nextTongue && te > 2) { tongueStart = time; nextTongue = time + 7 + Math.random() * 5 }
        const open = te < 0.1 ? te / 0.1 : te < 0.45 ? 1 : te < 0.6 ? 1 - (te - 0.45) / 0.15 : 0
        jaw.rotation.x = open * 0.5
        mouthInside.visible = open > 0.02
        mouthInside.scale.y = 0.02 + open * 0.14
        if (te < 0.5) {
          const dist = head.worldToLocal(flyPos.clone()).sub(tongue.position).length()
          const len = Math.max(0.001, dist * Math.sin(Math.min(te / 0.5, 1) * Math.PI))
          tongue.visible = true
          tongue.lookAt(flyPos)
          tongue.scale.set(0.07, 0.07, len)
          tongueTip.scale.set(1.6, 1.6, 0.1 / len)
          fly.visible = te < 0.25
        } else {
          tongue.visible = false
          fly.visible = te > 1.4
          fly.scale.setScalar(te > 1.4 && te < 1.8 ? 1.45 * (te - 1.4) / 0.4 : 1.45)
        }
        fly.position.copy(flyPos)
        if (flyPos.distanceToSquared(flyPrev) > 1e-6) fly.lookAt(flyPos.clone().add(flyPos.clone().sub(flyPrev)))
        const flap = Math.sin(time * 70) * 0.7
        wings.forEach(w => { w.rotation.z = (w.position.x > 0 ? 1 : -1) * (0.35 + flap) })
        flyHalo.visible = fly.visible
        flyHalo.position.copy(flyPos)
      }
    } else {
      frog.position.y = baseY
      frog.scale.set(1, 1, 1)
      if (fly) { fly.position.set(1.6, 2.4, 1.0); flyHalo?.position.copy(fly.position) }
    }

    confetti.forEach(c => {
      const d = c.userData
      const y = 4 - ((time * d.speed + d.phase) % 6)
      c.position.set(d.x + Math.sin(time + d.phase) * 0.3, y, -0.5 + Math.cos(d.phase) * 1.2)
      c.rotation.set(time * d.spin, time * d.spin * 0.7, 0)
    })

    renderer.render(scene, camera)
    raf = requestAnimationFrame(draw)
  }

  const visibility = () => {
    visible = !document.hidden
    cancelAnimationFrame(raf)
    last = 0
    if (visible && !disposed) raf = requestAnimationFrame(draw)
  }
  const lost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf) }
  const restored = () => { if (!disposed) { last = 0; resize(); raf = requestAnimationFrame(draw) } }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  window.addEventListener('pointermove', pointerMove)
  document.addEventListener('pointerleave', pointerLeave)
  document.addEventListener('visibilitychange', visibility)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  renderer.domElement.addEventListener('webglcontextrestored', restored)
  resize()
  raf = requestAnimationFrame(draw)
  options.onReady?.()

  return {
    celebrate() { celebration = time },
    hop(durationMs = 450) { startHop(durationMs / 1000, 0.5, 0) },
    face(angle: number) { facingTarget = angle },
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('pointermove', pointerMove)
      document.removeEventListener('pointerleave', pointerLeave)
      document.removeEventListener('visibilitychange', visibility)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      renderer.domElement.removeEventListener('webglcontextrestored', restored)
      const geometries = new Set<THREE.BufferGeometry>()
      scene.traverse(o => { if (o instanceof THREE.Mesh) geometries.add(o.geometry) })
      geometries.forEach(g => g.dispose())
      mats.forEach(m => m.dispose())
      textures.forEach(t => t.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
