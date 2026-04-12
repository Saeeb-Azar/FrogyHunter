import { useMemo, useState } from 'react'
import { LevelDetailsCard } from './LevelDetailsCard'
import { LevelNode } from './LevelNode'
import { MapDecorationLayer } from './MapDecorationLayer'
import { PathLayer } from './PathLayer'
import type { MapLevelNode } from './types'

interface Props {
  nodes: MapLevelNode[]
}

const MAP_W = 1180
const MAP_H = 1500

export function HistoryMap({ nodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  )

  return (
    <div className="history-map-wrap">
      <div className="history-map-scroll">
        <div className="history-map" style={{ width: MAP_W, height: MAP_H }}>
          <MapDecorationLayer width={MAP_W} height={MAP_H} />
          <PathLayer width={MAP_W} height={MAP_H} nodes={nodes} />
          <div className="history-map__nodes">
            {nodes.map((node) => (
              <LevelNode
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>
      </div>
      <LevelDetailsCard node={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}

