import { GameStage } from '../components/game-ui/GameStage'
import { StoneButton } from '../components/game-ui/PlayButtons'
import { ScreenHeader } from '../components/game-ui/ScreenHeader'
import { Stars } from '../components/game-ui/Stars'
import { NewLevelCountdown } from '../components/lobby/NewLevelCountdown'

const STEPS: [string, string][] = [
  ['Level wählen', 'Starte das aktuelle Wochenlevel in der Lobby oder wähle ein älteres Level auf der Karte.'],
  ['Froggys finden', 'Tippe direkt auf einen versteckten Froggy. Richtig getroffen, hüpft er in deine Froggy-Leiste.'],
  ['Lupe & Hinweise', 'Mit der Lupe zoomst du hinein. Drei Glühbirnen-Hinweise zeigen grob, wo du suchen kannst.'],
  ['Weiterhüpfen', 'Alle gefunden? Dein Froggy springt auf der Karte zum nächsten Level.'],
]

export function InfoPage() {
  return (
    <GameStage scene="forest">
      <div className="sub-screen">
        <ScreenHeader title="INFOS" />
        <section className="wood-panel">
          <div className="wood-panel__inner">
            <h2 className="panel-heading">So spielst du</h2>
            <ol className="info-steps">
              {STEPS.map(([t, d], i) => <li key={t} className="info-step"><span className="info-step__num">{i + 1}</span><span><b>{t}</b><span>{d}</span></span></li>)}
            </ol>
          </div>
        </section>
        <section className="wood-panel">
          <div className="wood-panel__inner">
            <h2 className="panel-heading">Sterne sammeln</h2>
            <div className="info-stars">
              <div><Stars count={3} /> ohne Hinweis und höchstens 3 Fehlklicks</div>
              <div><Stars count={2} /> max. 1 Hinweis und höchstens 8 Fehlklicks</div>
              <div><Stars count={1} /> alle Froggys gefunden</div>
            </div>
            <p className="panel-note">Für den ersten Abschluss gibt es XP. Wiederholungen verbessern deine Bestzeit.</p>
          </div>
        </section>
        <section className="wood-panel">
          <div className="wood-panel__inner">
            <h2 className="panel-heading">Jeden Mittwoch ein neues Level</h2>
            <p className="panel-note" style={{ fontSize: 14 }}>Jeden Mittwoch um 18 Uhr erscheint ein neues Suchbild mit frisch versteckten Froggys. Nächstes Level in <b className="countdown" style={{ color: '#9dff6a' }}><NewLevelCountdown /></b>.</p>
            <p className="panel-note">Mit einem Google Konto bleibt deine Reise gespeichert. Pause hält die Uhr an; beim App-Wechsel pausiert das Spiel automatisch.</p>
            <div className="info-links">
              <StoneButton size="sm" to="/play">Jetzt spielen</StoneButton>
              {import.meta.env.VITE_SUPPORT_EMAIL && <StoneButton tone="wood" size="sm" onClick={() => { location.href = `mailto:${import.meta.env.VITE_SUPPORT_EMAIL}` }}>Kontakt</StoneButton>}
              {import.meta.env.VITE_INSTAGRAM_URL && <a className="text-link" href={import.meta.env.VITE_INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>}
              {import.meta.env.VITE_IMPRINT_URL && <a className="text-link" href={import.meta.env.VITE_IMPRINT_URL}>Impressum</a>}
              {import.meta.env.VITE_PRIVACY_URL && <a className="text-link" href={import.meta.env.VITE_PRIVACY_URL}>Datenschutz</a>}
            </div>
          </div>
        </section>
      </div>
    </GameStage>
  )
}
