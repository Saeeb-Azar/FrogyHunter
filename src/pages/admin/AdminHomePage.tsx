import { Link } from 'react-router-dom'

export function AdminHomePage() {
  return (
    <div className="card card--pad" style={{ maxWidth: 560 }}>
      <p style={{ marginTop: 0 }}>
        Willkommen im Admin-Bereich. Lege neue Level an, lade Motive hoch und setze präzise Fundstellen mit Radius.
      </p>
      <ul className="muted">
        <li>
          <Link to="/admin/levels/new">Neues Level erstellen</Link>
        </li>
        <li>
          <Link to="/admin/levels">Alle Level bearbeiten</Link>
        </li>
      </ul>
      <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
        Statistik-Aggregation: Collection <code>levelStats</code> (siehe README) – wird bei Abschlüssen befüllt, sobald Firebase aktiv
        ist.
      </p>
    </div>
  )
}
