import { useCallback, useEffect, useRef, useState } from 'react'
import { computeLensDrawParams } from '../../lib/playPicLens'

function readLensPx(): number {
  if (typeof window === 'undefined') return 280
  const w = window.innerWidth
  if (w >= 900) return 300
  if (w >= 640) return 280
  return Math.max(200, Math.min(260, Math.round(w * 0.68)))
}

interface Props {
  sourceImgRef: React.RefObject<HTMLImageElement | null>
  active: boolean
}

export function PlayZoomLens({ sourceImgRef, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [imgTick, setImgTick] = useState(0)
  const [lensPx, setLensPx] = useState(readLensPx)

  useEffect(() => {
    const onResize = () => setLensPx(readLensPx())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = sourceImgRef.current
    if (!canvas || !img || !active) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const params = computeLensDrawParams(img, pos.x, pos.y, lensPx)
    ctx.clearRect(0, 0, lensPx, lensPx)

    if (!params || params.sw < 1 || params.sh < 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, 0, lensPx, lensPx)
      return
    }

    try {
      ctx.drawImage(img, params.sx, params.sy, params.sw, params.sh, 0, 0, lensPx, lensPx)
    } catch {
      /* z. B. CORS — ignorieren */
    }
  }, [active, pos.x, pos.y, imgTick, sourceImgRef, lensPx])

  useEffect(() => {
    if (!active) return
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

    const setFromClient = (clientX: number, clientY: number) => {
      setPos({ x: clientX, y: clientY })
    }

    const onMouse = (e: MouseEvent) => setFromClient(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) setFromClient(t.clientX, t.clientY)
    }

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => draw())
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, pos, imgTick, draw, lensPx])

  useEffect(() => {
    document.body.classList.toggle('play-zoom-lens-active', active)
    return () => document.body.classList.remove('play-zoom-lens-active')
  }, [active])

  useEffect(() => {
    if (!active) return
    const img = sourceImgRef.current
    if (!img) return
    const onLoad = () => setImgTick((t) => t + 1)
    img.addEventListener('load', onLoad)
    if (img.complete) onLoad()
    return () => img.removeEventListener('load', onLoad)
  }, [active, sourceImgRef])

  if (!active) return null

  return (
    <div
      className="play-zoom-lens"
      style={{ left: pos.x, top: pos.y, width: lensPx, height: lensPx }}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="play-zoom-lens__canvas"
        width={lensPx}
        height={lensPx}
        role="presentation"
      />
    </div>
  )
}
