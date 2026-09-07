import { AppLayout } from '../components/layout/AppLayout'
import { UserBar } from '../components/layout/UserBar'
import { PageTransition } from '../components/ui/PageTransition'

export function InfoPage() {
  return (
    <AppLayout showBack backTo="/">
      <UserBar />
      <PageTransition>
        <h2 className="h2">Über FroggySmill Hunt</h2>
        <div className="card card--pad" style={{ maxWidth: 640 }}>
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Spielidee</h3>
            <p className="muted" style={{ margin: 0 }}>
              In jedem Level wartet ein großes Bild voller Details. Irgendwo haben sich kleine Froggys versteckt. Tippe auf die
              richtige Stelle – triffst du, erscheint ein leuchtender Ring und dein Fortschritt oben aktualisiert sich.
            </p>
          </section>
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>So funktioniert&apos;s</h3>
            <ul className="muted" style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <li>Starte über „Spielen“ das aktuelle Level.</li>
              <li>Jeder Treffer zählt nur einmal – Doppelklicks auf dieselbe Stelle geben keine Extra-Punkte.</li>
              <li>Am Ende siehst du Zeit, Klicks und Fehltreffer.</li>
              <li>Drei Hinweise zeigen dir grob, wo du suchen kannst.</li>
              <li>Pause hält die Uhr an und verdeckt das Bild. Beim App Wechsel pausiert das Spiel automatisch.</li>
              <li>Für den ersten Abschluss gibt es XP. Wiederholungen verbessern deine Bestzeit, ohne zusätzliche XP.</li>
            </ul>
          </section>
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Jeden Mittwoch</h3>
            <p className="muted" style={{ margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Mittwoch ist Frosch-Tag:</strong> Wir veröffentlichen neue Level und
              kniffligere Hiding-Spots. Schau regelmäßig rein – die Lobby zeigt, ob ein frisches Level bereitsteht.
            </p>
          </section>
          <section>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Dein Fortschritt</h3>
            <p className="muted" style={{ margin: 0 }}>
              Mit einem Google Konto bleibt deine Reise gespeichert. In der Demo bleiben Spielstände ausschließlich auf diesem Gerät. Alte Wochenlevel findest du auf deiner Karte.
            </p>
          </section>
          <div className="studio-toolbar">
            {import.meta.env.VITE_SUPPORT_EMAIL && <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`}>Kontakt</a>}
            {import.meta.env.VITE_INSTAGRAM_URL && <a href={import.meta.env.VITE_INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>}
            {import.meta.env.VITE_IMPRINT_URL && <a href={import.meta.env.VITE_IMPRINT_URL}>Impressum</a>}
            {import.meta.env.VITE_PRIVACY_URL && <a href={import.meta.env.VITE_PRIVACY_URL}>Datenschutz</a>}
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
