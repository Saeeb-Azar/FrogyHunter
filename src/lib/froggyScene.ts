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

  const green = phys(0x4f9a22, { sheen: 0.25, sheenColor: new THREE.Color(0xa8d86a) })
  const lightGreen = phys(0x74b332)
  const darkGreen = std(0x24501a, 0.6)
  const spotMat = phys(0x2f6f18)
  const cream = phys(0xe6cf86, { clearcoat: 0.3 })
  const black = std(0x10201a, 0.08, { metalness: 0.1 })
  const white = std(0xffffff, 0.15, { emissive: 0xffffff, emissiveIntensity: 0.35 })
  const iris = std(0x6b4a1c, 0.3)
  const pink = std(0xf6918a, 0.6)
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
  mesh(head, lightGreen, [0, -0.12, 0.45], [0.74, 0.29, 0.25])
  const pupils: THREE.Mesh[] = []
  const lids: THREE.Mesh[] = []
  for (const side of [-1, 1]) {
    mesh(head, green, [side * 0.48, 0.42, 0.07], [0.38, 0.45, 0.35])
    mesh(head, std(0xfffdf2, 0.2), [side * 0.48, 0.47, 0.3], [0.28, 0.32, 0.18])
    const pupil = mesh(head, black, [side * 0.48, 0.47, 0.4], [0.2, 0.25, 0.12])
    pupils.push(pupil)
    mesh(pupil, iris, [0, 0, 0.35], [0.62, 0.62, 0.5])
    mesh(pupil, black, [0, 0, 0.62], [0.42, 0.44, 0.4])
    mesh(pupil, white, [-0.32, 0.38, 0.85], [0.26, 0.22, 0.14])
    mesh(pupil, white, [0.28, -0.25, 0.9], [0.1, 0.09, 0.1])
    const lid = mesh(head, green, [side * 0.48, 0.5, 0.33], [0.3, 0.001, 0.2])
    lids.push(lid)
    mesh(head, pink, [side * 0.64, -0.13, 0.57], [0.15, 0.08, 0.03])
    mesh(head, darkGreen, [side * 0.15, 0.03, 0.66], [0.03, 0.02, 0.012])
    // Beine, Arme, Füße
    mesh(frog, green, [side * 0.72, 0.3, 0.06], [0.44, 0.36, 0.48])
    const arm = mesh(body, lightGreen, [side * 0.58, 0.38, 0.5], [0.16, 0.38, 0.17])
    arm.rotation.z = side * 0.22
    arm.userData.side = side
    mesh(frog, lightGreen, [side * 0.58, 0.09, 0.7], [0.27, 0.1, 0.28])
    for (let toe = 0; toe < 3; toe++) mesh(frog, lightGreen, [side * 0.58 + (toe - 1) * 0.16, 0.075, 0.9], [0.095, 0.065, 0.16])
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
    const flyEye = phys(0xc0301f, { clearcoat: 1, clearcoatRoughness: 0.1, roughness: 0.2 })
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
    fly.scale.setScalar(2.1)
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
  let celebration = -10, hopStart = -10, hopDur = 0.45
  let facing = 0, facingTarget = 0
  let tongueStart = -10, nextTongue = 5
  const pointer = new THREE.Vector2()
  const pointerMove = (e: PointerEvent) => {
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
    const still = options.reduceMotion

    if (!still) {
      // Atmen + Kehlsack
      body.scale.y = 1 + Math.sin(time * 2.3) * 0.018
      const croakPhase = time % 6.5
      const croak = croakPhase > 5.6 ? Math.sin((croakPhase - 5.6) / 0.9 * Math.PI * 3) : 0
      const puff = Math.max(0, croak)
      throat.scale.set(0.3 + puff * 0.2, 0.2 + puff * 0.17, 0.16 + puff * 0.2)

      // Kopf folgt Finger/Maus
      const lookX = variant === 'hero' && fly && time - tongueStart > 0.6 ? pointer.x * 0.5 + (flyPos.x / 3) * 0.5 : pointer.x
      head.rotation.y += (lookX * 0.2 - head.rotation.y) * Math.min(dt * 5, 1)
      head.rotation.x += (pointer.y * 0.1 - head.rotation.x) * Math.min(dt * 5, 1)

      // Blinzeln
      const blinkPhase = time % 4.3
      const blink = blinkPhase > 4.08 ? Math.sin((blinkPhase - 4.08) / 0.22 * Math.PI) : 0
      pupils.forEach(p => { p.scale.y = 0.25 * Math.max(0.03, 1 - blink) })
      lids.forEach(l => { l.scale.y = 0.34 * blink + 0.001 })

      // Sprünge
      let lift = 0, squash = 1, spin = 0
      const ce = time - celebration
      if (ce < 1.2) {
        const t = ce / 1.2
        lift = Math.sin(t * Math.PI) * 1.1
        spin = easeOut(t) * Math.PI * 2
        squash = t < 0.12 ? 1 - t * 2 : 1 + Math.sin(t * Math.PI) * 0.12
      }
      const he = time - hopStart
      if (he < hopDur) {
        const t = he / hopDur
        lift = Math.max(lift, Math.sin(t * Math.PI) * (variant === 'token' ? 0.22 : 0.5))
        squash = t < 0.15 ? 1 - (0.15 - Math.abs(t - 0.075)) * 1.2 : 1 + Math.sin(t * Math.PI) * 0.15
      } else if (he < hopDur + 0.18) {
        squash = 1 - Math.sin((he - hopDur) / 0.18 * Math.PI) * 0.14
      }
      if (variant === 'party') {
        const pt = (time % 0.9) / 0.9
        lift = Math.max(lift, Math.abs(Math.sin(pt * Math.PI)) * 0.8)
        arms.forEach(a => { a.rotation.z = a.userData.side * (0.22 + Math.abs(Math.sin(time * 7)) * 1.4) })
        facingTarget = Math.sin(time * 1.4) * 0.5
      } else if (variant === 'hero' && ce > 1.2 && he > hopDur) {
        const periodic = time % 12
        if (periodic > 10.8 && periodic < 11.5) lift = Math.sin((periodic - 10.8) / 0.7 * Math.PI) * 0.3
      }
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
        flyPos.set(Math.sin(ft) * 2.3, 2.0 + Math.sin(ft * 2) * 0.35 + Math.sin(time * 9) * 0.04, 1.1 + Math.cos(ft) * 0.55)
        const te = time - tongueStart
        if (time > nextTongue && te > 2) { tongueStart = time; nextTongue = time + 7 + Math.random() * 5 }
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
          fly.scale.setScalar(te > 1.4 && te < 1.8 ? 2.1 * (te - 1.4) / 0.4 : 2.1)
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
  const lost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); options.onError?.() }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  window.addEventListener('pointermove', pointerMove)
  document.addEventListener('pointerleave', pointerLeave)
  document.addEventListener('visibilitychange', visibility)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  resize()
  raf = requestAnimationFrame(draw)
  options.onReady?.()

  return {
    celebrate() { celebration = time },
    hop(durationMs = 450) { hopDur = durationMs / 1000; hopStart = time },
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
