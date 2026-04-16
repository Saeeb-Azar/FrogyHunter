import { useEffect, useRef, useState } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const dirtyRef = useRef(true)
  const imgTickRef = useRef(0)
  const [lensPx, setLensPx] = useState(readLensPx)

  useEffect(() => {
    const onResize = () => setLensPx(readLensPx())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!active) return

    posRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    dirtyRef.current = true

    const setFromClient = (clientX: number, clientY: number) => {
      posRef.current = { x: clientX, y: clientY }
      dirtyRef.current = true
    }

    const onMouse = (e: MouseEvent) => setFromClient(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) setFromClient(t.clientX, t.clientY)
    }

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    let raf = 0
    const loop = () => {
      if (dirtyRef.current) {
        dirtyRef.current = false
        const container = containerRef.current
        const canvas = canvasRef.current
        const img = sourceImgRef.current
        if (container) {
          container.style.left = `${posRef.current.x}px`
          container.style.top = `${posRef.current.y}px`
        }
        if (canvas && img) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const params = computeLensDrawParams(img, posRef.current.x, posRef.current.y, lensPx)
            ctx.clearRect(0, 0, lensPx, lensPx)
            if (!params || params.sw < 1 || params.sh < 1) {
              ctx.fillStyle = 'rgba(0,0,0,0.15)'
              ctx.fillRect(0, 0, lensPx, lensPx)
            } else {
              try {
                ctx.drawImage(img, params.sx, params.sy, params.sw, params.sh, 0, 0, lensPx, lensPx)
              } catch {
                /* z. B. CORS — ignorieren */
              }
            }
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      cancelAnimationFrame(raf)
    }
  }, [active, lensPx, sourceImgRef])

  useEffect(() => {
    document.body.classList.toggle('play-zoom-lens-active', active)
    return () => document.body.classList.remove('play-zoom-lens-active')
  }, [active])

  useEffect(() => {
    if (!active) return
    const img = sourceImgRef.current
    if (!img) return
    const onLoad = () => {
      imgTickRef.current += 1
      dirtyRef.current = true
    }
    img.addEventListener('load', onLoad)
    if (img.complete) onLoad()
    return () => img.removeEventListener('load', onLoad)
  }, [active, sourceImgRef])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className="play-zoom-lens"
      style={{ width: lensPx, height: lensPx }}
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
