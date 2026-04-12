import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'

interface Props {
  title: string
  durationMs: number
  clicks: number
  misses: number
  onReplay: () => void
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rs = s % 60
  return m > 0 ? `${m}:${rs.toString().padStart(2, '0')}` : `${rs}s`
}

export function VictoryOverlay({ title, durationMs, clicks, misses, onReplay }: Props) {
  const reduce = useSettingsStore((s) => s.reduceMotion)

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby="victory-title"
      className="victory-scrim"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="victory-modal"
      >
        <div className="victory-modal__accent" />
        <div className="victory-modal__body">
          <div className="victory-modal__icon" aria-hidden>
            🐸
          </div>
          <h2 id="victory-title" className="victory-modal__title">
            Geschafft
          </h2>
          <p className="victory-modal__subtitle">{title}</p>

          <div className="victory-stats">
            <div className="victory-stat">
              <div className="victory-stat__value">{fmt(durationMs)}</div>
              <div className="victory-stat__label">Zeit</div>
            </div>
            <div className="victory-stat">
              <div className="victory-stat__value">{clicks}</div>
              <div className="victory-stat__label">Klicks</div>
            </div>
            <div className="victory-stat">
              <div className="victory-stat__value">{misses}</div>
              <div className="victory-stat__label">Fehltreffer</div>
            </div>
          </div>

          <div className="victory-actions">
            <button type="button" className="btn btn--primary btn--block btn--lg" onClick={onReplay}>
              Nochmal spielen
            </button>
            <Link to="/" className="btn btn--ghost btn--block">
              Zur Lobby
            </Link>
            <Link to="/history" className="btn btn--ghost btn--block">
              Historie
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
