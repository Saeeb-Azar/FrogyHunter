/** Hilfen für 2×-Lupe über play_pic (object-fit: contain, inkl. CSS-Transform am img). */

export interface LensDrawParams {
  sx: number
  sy: number
  sw: number
  sh: number
}

/** Display-Radius = lensPx/4 → Natural-Koordinaten für drawImage (2× auf lensPx×lensPx). */
export function computeLensDrawParams(
  img: HTMLImageElement,
  clientX: number,
  clientY: number,
  lensPx: number = 300,
): LensDrawParams | null {
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  if (!nw || !nh) return null

  const rect = img.getBoundingClientRect()
  const ix = clientX - rect.left
  const iy = clientY - rect.top
  const ew = rect.width
  const eh = rect.height

  const scale = Math.min(ew / nw, eh / nh)
  const dw = nw * scale
  const dh = nh * scale
  const ox = (ew - dw) / 2
  const oy = (eh - dh) / 2

  if (ix < ox || ix > ox + dw || iy < oy || iy > oy + dh) return null

  const dispRadius = lensPx / 4
  const natPerDisp = nw / dw
  const halfNat = dispRadius * natPerDisp

  const nx = ((ix - ox) / dw) * nw
  const ny = ((iy - oy) / dh) * nh

  let sw = halfNat * 2
  let sh = sw
  sw = Math.min(sw, nw, nh)
  sh = sw

  let sx = nx - sw / 2
  let sy = ny - sh / 2
  sx = Math.max(0, Math.min(sx, nw - sw))
  sy = Math.max(0, Math.min(sy, nh - sh))

  return { sx, sy, sw, sh }
}
