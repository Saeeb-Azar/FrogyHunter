import type { MapLevelNode } from './types'

interface Props {
  width: number
  height: number
  nodes: MapLevelNode[]
}

function buildPath(nodes: MapLevelNode[]) {
  if (!nodes.length) return ''
  if (nodes.length === 1) return `M ${nodes[0].x} ${nodes[0].y}`

  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i < nodes.length; i += 1) {
    const prev = nodes[i - 1]
    const cur = nodes[i]
    const cx = (prev.x + cur.x) / 2
    d += ` Q ${cx} ${prev.y}, ${cur.x} ${cur.y}`
  }
  return d
}

export function PathLayer({ width, height, nodes }: Props) {
  const path = buildPath(nodes)

  return (
    <svg className="history-map__path" viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path className="history-map__road-back" d={path} />
      <path className="history-map__road-front" d={path} />
      <path className="history-map__road-dash" d={path} />
    </svg>
  )
}

