import { AnimatePresence, motion } from 'framer-motion'
import type { MapLevelNode } from './types'

interface Props {
  node: MapLevelNode | null
  onClose: () => void
}

function formatDate(ts: number | null) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(ts))
}

function formatTime(ts: number | null) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

export function LevelDetailsModal({ node, onClose }: Props) {
  return (
    <AnimatePresence>
      {node && (
        <div className="level-modal-shell">
          <motion.button
            type="button"
            className="level-modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="level-modal-card"
            initial={{ opacity: 0, scale: 0.9, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="level-modal-head">
              <h3>{node.title}</h3>
              <span className={`level-pill level-pill--${node.status}`}>
                {node.status === 'completed' ? 'Abgeschlossen' : node.status === 'current' ? 'Aktuell' : 'Gesperrt'}
              </span>
            </div>
            <p className="level-modal-subtitle">Level {node.levelNumber}</p>
            <div className="level-modal-grid">
              <div><strong>Datum</strong><span>{formatDate(node.completedAt)}</span></div>
              <div><strong>Zeit</strong><span>{formatTime(node.completedAt)}</span></div>
              <div><strong>Klicks</strong><span>{node.clicks}</span></div>
              <div><strong>Fehlklicks</strong><span>{node.misses}</span></div>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={onClose}>
              Schließen
            </button>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
