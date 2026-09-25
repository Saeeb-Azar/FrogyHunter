import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMarkers } from '../../services/markersService'
import { listLevelsForAdmin } from '../../services/levelsService'
import type { Level } from '../../types/models'

function fmt(ts: number) {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(new Date(ts))
}

export function AdminLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const list = await listLevelsForAdmin()
      setLevels(list)
      const c: Record<string, number> = {}
      await Promise.all(list.map(async l => { c[l.id] = (await getMarkers(l.id)).length }))
      setCounts(c)
      setNow(Date.now())
      setLoading(false)
    })()
  }, [])

  return (
    <div className="card card--pad">
      <h2 className="h2" style={{ marginTop: 0 }}>Alle Level</h2>
      {loading && <div className="loading-frog"><i aria-hidden className="froggy-head" />Lädt …</div>}
      {!loading && levels.length === 0 && <p className="muted">Noch keine Level. <Link to="/admin/levels/new">Jetzt eins anlegen</Link></p>}
      <ul className="studio-list">
        {levels.map(l => {
          const status = l.status === 'published' ? (l.publishAt && l.publishAt > now ? 'planned' : 'live') : 'draft'
          return (
            <li key={l.id}>
              <Link to={`/admin/levels/${l.id}`} className="studio-item">
                <span className="studio-item__pic">{l.imageUrl ? <img src={l.imageUrl} alt="" loading="lazy" /> : null}</span>
                <span className="studio-item__body">
                  <b>{l.title || 'Ohne Titel'}</b>
                  <span className={`studio-badge studio-badge--${status}`}>{status === 'live' ? '● Live' : status === 'planned' ? '🗓 Geplant' : '✏️ Entwurf'}</span>
                  <small>{l.publishAt ? fmt(l.publishAt) : 'Kein Termin'} · {counts[l.id] ?? l.frogCount} Froggys</small>
                </span>
                <span className="studio-item__go" aria-hidden>Bearbeiten ›</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
