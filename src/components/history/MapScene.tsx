import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapBackground } from './MapBackground'
import { LevelDetailsModal } from './LevelDetailsModal'
import { LevelNode } from './LevelNode'
import { SpringWeatherLayer } from './SpringWeatherLayer'
import type { MapLevelNode } from './types'

interface Props {
  nodes: MapLevelNode[]
}

export function MapScene({ nodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const frameRef = useRef<number | null>(null)
  const pendingScrollRef = useRef(0)

  const selected = useMemo(() => nodes.find((node) => node.id === selectedId) ?? null, [nodes, selectedId])

  const onScroll: React.UIEventHandler<HTMLDivElement> = useCallback((event) => {
    pendingScrollRef.current = event.currentTarget.scrollTop
    if (frameRef.current != null) return
    frameRef.current = requestAnimationFrame(() => {
      setScrollY(pendingScrollRef.current)
      frameRef.current = null
    })
  }, [])

  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const handleNodeSelect = useCallback((id: string) => {
    // Sound-Hook vorbereitet: hier spaeter SFX triggern.
    setSelectedId(id)
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const midStyle = useMemo(
    () => ({ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }),
    [scrollY],
  )
  const foregroundStyle = useMemo(
    () => ({ transform: `translate3d(0, ${scrollY * 0.2}px, 0)` }),
    [scrollY],
  )

  return (
    <div className="map-scene-shell">
      <div className="map-scene-scroll" onScroll={onScroll}>
        <section className="map-scene">
          <MapBackground parallaxY={scrollY} />
          <div className="map-mid-layer" style={midStyle} />
          <div className="map-level-layer">
            {nodes.map((node) => (
              <LevelNode
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                onSelect={handleNodeSelect}
              />
            ))}
          </div>
          <div className="map-foreground-layer" style={foregroundStyle} />
          <SpringWeatherLayer />
        </section>
      </div>
      <LevelDetailsModal node={selected} onClose={handleClose} />
    </div>
  )
}
