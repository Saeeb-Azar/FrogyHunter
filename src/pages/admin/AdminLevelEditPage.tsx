import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkerEditor } from '../../components/admin/MarkerEditor'
import { getLevel, updateLevel } from '../../services/levelsService'
import { getMarkers, saveMarkers } from '../../services/markersService'
import type { FrogMarker, Level, LevelStatus } from '../../types/models'

export function AdminLevelEditPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [markers, setMarkers] = useState<FrogMarker[]>([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<LevelStatus>('draft')
  const [publishAt, setPublishAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      const l = await getLevel(id)
      if (!l) {
        setLevel(null)
        setLoading(false)
        return
      }
      setLevel(l)
      setTitle(l.title)
      setStatus(l.status)
      setPublishAt(l.publishAt ? new Date(l.publishAt).toISOString().slice(0, 16) : '')
      const m = await getMarkers(id)
      setMarkers(m)
      setLoading(false)
    })()
  }, [id])

  const saveMeta = async () => {
    if (!id || !level) return
    setSaving(true)
    setMsg(null)
    try {
      const pub = publishAt ? new Date(publishAt).getTime() : null
      await updateLevel(id, { title: title.trim(), status, publishAt: pub })
      setLevel({ ...level, title: title.trim(), status, publishAt: pub, updatedAt: Date.now() })
      setMsg('Metadaten gespeichert.')
    } catch {
      setMsg('Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  const saveMarkersOnly = async () => {
    if (!id) return
    setSaving(true)
    setMsg(null)
    try {
      await saveMarkers(id, markers)
      await updateLevel(id, { frogCount: markers.length })
      setMsg('Fundstellen gespeichert.')
    } catch {
      setMsg('Marker speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner" />
  if (!id || !level) return <p className="muted">Level nicht gefunden.</p>

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <Link to={`/admin/levels/${id}/preview`} className="btn btn--primary">
          Preview / Test
        </Link>
        <button type="button" className="btn btn--ghost" disabled={saving} onClick={() => void saveMeta()}>
          Meta speichern
        </button>
        <button type="button" className="btn btn--ghost" disabled={saving} onClick={() => void saveMarkersOnly()}>
          Marker speichern
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => nav('/admin/levels')}>
          Zur Liste
        </button>
      </div>
      {msg && <p className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{msg}</p>}

      <div className="card card--pad" style={{ marginBottom: '1.25rem' }}>
        <div className="field">
          <label htmlFor="et">Titel</label>
          <input id="et" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ep">Veröffentlichung</label>
          <input id="ep" className="input" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="es">Status</label>
          <select id="es" className="select" value={status} onChange={(e) => setStatus(e.target.value as LevelStatus)}>
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
        </div>
      </div>

      {level.imageUrl ? (
        <MarkerEditor imageUrl={level.imageUrl} markers={markers} onChange={setMarkers} />
      ) : (
        <p className="muted">Kein Bild – bitte zuerst Bild hochladen (neu anlegen).</p>
      )}
    </div>
  )
}
