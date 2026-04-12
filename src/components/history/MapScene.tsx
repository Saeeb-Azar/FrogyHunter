import { useEffect, useMemo, useRef, useState } from 'react'
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

  const selected = useMemo(() => nodes.find((node) => node.id === selectedId) ?? null, [nodes, selectedId])

  const onScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const top = event.currentTarget.scrollTop
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      setScrollY(top)
      frameRef.current = null
    })
  }

  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const handleNodeSelect = (id: string) => {
    // Sound-Hook vorbereitet: hier spaeter SFX triggern.
    setSelectedId(id)
  }

  return (
    <div className="map-scene-shell">
      <div className="map-scene-scroll" onScroll={onScroll}>
        <section className="map-scene">
          <MapBackground parallaxY={scrollY} />
          <div className="map-mid-layer" style={{ transform: `translateY(${scrollY * 0.12}px)` }} />
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
          <div className="map-foreground-layer" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
          <SpringWeatherLayer />
        </section>
      </div>
      <LevelDetailsModal node={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
