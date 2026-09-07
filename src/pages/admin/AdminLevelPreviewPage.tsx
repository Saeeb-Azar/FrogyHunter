import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PlayView } from '../../components/game/PlayView'
import { getLevel, updateLevel } from '../../services/levelsService'
import { levelSignature } from '../../lib/levelValidation'
import { getMarkers } from '../../services/markersService'
import type { FrogMarker, Level } from '../../types/models'

export function AdminLevelPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { user } = useAuth()
  const [level, setLevel] = useState<Level | null>(null)
  const [markers, setMarkers] = useState<FrogMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      try {
        const l = await getLevel(id)
        setLevel(l)
        setMarkers(l ? await getMarkers(l.id) : [])
      } catch { setMessage('Der Test konnte nicht geladen werden.') }
      finally { setLoading(false) }
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
        Identische Spieleransicht. Es werden keine Spielergebnisse oder XP vergeben. Finde alle Froggys, um die Freigabe zu aktivieren.
      </p>
      {message && <p className="studio-status" role="status">{message}</p>}
      <PlayView
        level={level}
        markers={markers}
        uid={user.uid}
        testMode
        onTestComplete={() => {
          return (async () => {
            try {
              const signature = await levelSignature(level.imageUrl, markers)
              await updateLevel(level.id, { testedSignature: signature })
              setMessage('Test bestanden und bestätigt. Du kannst das Level jetzt im Editor freigeben.')
            } catch { setMessage('Test abgeschlossen, Bestätigung konnte nicht gespeichert werden. Bitte erneut testen.') }
          })()
        }}
        onExitTest={() => {
          if (id) nav(`/admin/levels/${id}`)
        }}
      />
    </div>
  )
}
