import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMarkers } from '../../services/markersService'
import { listLevelsForAdmin } from '../../services/levelsService'
import type { Level } from '../../types/models'

function fmt(ts: number) {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' }).format(new Date(ts))
}

export function AdminLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const list = await listLevelsForAdmin()
      setLevels(list)
      const c: Record<string, number> = {}
      await Promise.all(
        list.map(async (l) => {
          const m = await getMarkers(l.id)
          c[l.id] = m.length
        })
      )
      setCounts(c)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="card card--pad">
      <h2 className="h2" style={{ marginTop: 0 }}>
        Level-Liste
      </h2>
      {loading && <div className="spinner" />}
      {!loading && levels.length === 0 && <p className="muted">Keine Level vorhanden.</p>}
      {!loading && levels.length > 0 && (
        <div className="admin-table-wrap" style={{ marginTop: '1rem' }}>
          <table className="table-lite">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Status</th>
                <th>Veröffentlichung</th>
                <th>Froggys</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {levels.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>{l.status}</td>
                  <td>{l.publishAt ? fmt(l.publishAt) : '—'}</td>
                  <td>{counts[l.id] ?? l.frogCount}</td>
                  <td>
                    <Link to={`/admin/levels/${l.id}`} className="btn btn--ghost btn--sm">
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
