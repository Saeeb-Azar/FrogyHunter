import { motion } from 'framer-motion'
import type { MapLevelNode } from './types'

interface Props {
  node: MapLevelNode
  selected: boolean
  onSelect: (id: string) => void
}

export function LevelNode({ node, selected, onSelect }: Props) {
  const isCurrent = node.status === 'current'
  const isCompleted = node.status === 'completed'
  const isLocked = node.status === 'locked'
  const stateIcon = isCompleted ? '✓' : isCurrent ? '🐸' : '🔒'

  return (
    <motion.button
      type="button"
      className={`map-level-node map-level-node--${node.status} ${selected ? 'is-selected' : ''}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      onClick={() => onSelect(node.id)}
      whileHover={{ scale: isLocked ? 1.02 : 1.09, y: isLocked ? -1 : -4 }}
      whileTap={{ scale: isLocked ? 0.99 : 0.96 }}
      animate={isCurrent ? { scale: [1, 1.06, 1], rotate: [0, -1.2, 1.2, 0] } : { scale: 1, rotate: 0 }}
      transition={isCurrent ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
      aria-label={`Level ${node.levelNumber} ${node.title}`}
    >
      <span className="map-level-node__num">{node.levelNumber}</span>
      <span className="map-level-node__state" aria-hidden>
        {stateIcon}
      </span>
    </motion.button>
  )
}

