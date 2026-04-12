import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PlayView } from '../../components/game/PlayView'
import { getLevel } from '../../services/levelsService'
import { getMarkers } from '../../services/markersService'
import type { FrogMarker, Level } from '../../types/models'

export function AdminLevelPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { user } = useAuth()
  const [level, setLevel] = useState<Level | null>(null)
  const [markers, setMarkers] = useState<FrogMarker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      const l = await getLevel(id)
      setLevel(l)
      setMarkers(l ? await getMarkers(l.id) : [])
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="spinner" />
  if (!level || !user) {
    return (
      <p className="muted">
        {!user ? 'Nicht angemeldet.' : 'Level nicht gefunden.'}{' '}
        <Link to="/admin/levels">Zurück</Link>
      </p>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/admin/levels/${id}`} className="btn btn--ghost">
          ← Zurück zum Editor
        </Link>
      </div>
      <h2 className="h2">Test: {level.title}</h2>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        Gleiche Klicklogik wie im Spiel. Fortschritt wird im Testmodus nicht in Firestore geschrieben.
      </p>
      <PlayView
        level={level}
        markers={markers}
        uid={user.uid}
        testMode
        onExitTest={() => {
          if (id) nav(`/admin/levels/${id}`)
        }}
      />
    </div>
  )
}
