import { AnimatePresence, motion } from 'framer-motion'
import type { MapLevelNode } from './types'

interface Props {
  node: MapLevelNode | null
  onClose: () => void
}

function fmtDate(ts: number | null) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts))
}

function fmtDur(ms: number | null) {
  if (ms == null) return '—'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rs = s % 60
  return m > 0 ? `${m}m ${rs}s` : `${rs}s`
}

export function LevelDetailsCard({ node, onClose }: Props) {
  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.button
            type="button"
            className="history-details__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Details schließen"
          />
          <motion.aside
            className="history-details card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="history-details__head">
              <h3>{node.title}</h3>
              <span className={`badge ${node.status === 'locked' ? 'badge--warn' : ''}`}>
                {node.status === 'completed' ? 'Abgeschlossen' : node.status === 'current' ? 'Aktuell' : 'Gesperrt'}
              </span>
            </div>
            <p className="muted">Level {node.levelNumber}</p>
            <div className="history-details__grid">
              <div><strong>Datum</strong>{fmtDate(node.completedAt)}</div>
              <div><strong>Zeit</strong>{fmtDur(node.durationMs)}</div>
              <div><strong>Klicks</strong>{node.clicks}</div>
              <div><strong>Fehlklicks</strong>{node.misses}</div>
              <div><strong>Froggys</strong>{node.foundCount}</div>
              <div><strong>Status</strong>{node.status}</div>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={onClose}>
              Schließen
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

