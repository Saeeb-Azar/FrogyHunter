import { Confetti } from '../game-ui/Confetti'
import { Froggy3D } from '../game-ui/Froggy3D'
import { StoneButton } from '../game-ui/PlayButtons'
import { StarIcon } from '../game-ui/Stars'
import { formatTime } from '../../lib/gameRules'

interface Props {
  title: string
  durationMs: number
  clicks: number
  misses: number
  hintsUsed: number
  stars: number
  /** XP beim ersten Abschluss, sonst null */
  xp: number | null
  status: string
  continueLabel: string
  onContinue: () => void
  onReplay: () => void
  busy?: boolean
  onRetrySave?: () => void
}

export function VictoryOverlay({ title, durationMs, clicks, misses, hintsUsed, stars, xp, status, continueLabel, onContinue, onReplay, busy, onRetrySave }: Props) {
  return (
    <div className="victory" role="dialog" aria-modal="true" aria-label="Alle Froggys gefunden">
      <div className="victory__rays" aria-hidden />
      <Confetti />
      <div className="victory__frog"><Froggy3D variant="party" fallback={<span className="froggy-fallback" aria-hidden>🐸</span>} /></div>
      <div className="victory__box wood-panel">
        <div className="wood-panel__inner">
          <div className="game-title victory__title">GESCHAFFT!</div>
          <p className="wood-text" style={{ margin: 0, fontSize: 16 }}>{title}</p>
          <div className="victory__stars" role="img" aria-label={`${stars} von 3 Sternen`}>
            {[0, 1, 2].map(i => <StarIcon key={i} on={i < stars} />)}
          </div>
          <div className="play-timer victory__time">{formatTime(durationMs)}</div>
          <div className="stat-row">
            <span className="stat-chip"><b>{clicks}</b><span>Klicks</span></span>
            <span className="stat-chip"><b>{misses}</b><span>Fehlklicks</span></span>
            <span className="stat-chip"><b>{hintsUsed}</b><span>Hinweise</span></span>
          </div>
          {xp != null ? <span className="victory__xp">+{xp} XP</span> : <p className="panel-note" style={{ textAlign: 'center' }}>Wiederholung · deine Bestzeit zählt</p>}
          <p className="panel-note" role="status" style={{ textAlign: 'center' }}>{status}</p>
          <div className="game-modal__actions">
            {onRetrySave && <StoneButton tone="gold" onClick={onRetrySave}>Speichern wiederholen</StoneButton>}
            <StoneButton size="lg" onClick={onContinue} disabled={busy}>{continueLabel} ➜</StoneButton>
            <StoneButton tone="wood" size="sm" onClick={onReplay} disabled={busy}>Nochmal spielen</StoneButton>
          </div>
        </div>
      </div>
    </div>
  )
}
