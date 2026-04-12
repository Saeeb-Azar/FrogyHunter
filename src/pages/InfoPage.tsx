import { AppLayout } from '../components/layout/AppLayout'
import { UserBar } from '../components/layout/UserBar'
import { PageTransition } from '../components/ui/PageTransition'

export function InfoPage() {
  return (
    <AppLayout showBack backTo="/">
      <UserBar />
      <PageTransition>
        <h2 className="h2">Über Froggy Hunt</h2>
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
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Impressum / Kontakt</h3>
            <p className="muted" style={{ margin: 0 }}>
              Platzhalter für rechtliche Angaben und Support-E-Mail. Passe diesen Block in <code>InfoPage.tsx</code> an dein Projekt
              an.
            </p>
          </section>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
