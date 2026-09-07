import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PlayView } from '../components/game/PlayView'
import { AppLayout } from '../components/layout/AppLayout'
import { resolveCurrentLevel } from '../lib/currentLevel'
import { getLevel } from '../services/levelsService'
import { getMarkers } from '../services/markersService'
import type { FrogMarker, Level } from '../types/models'
export function PlayPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const levelId = params.get('level')
  const [level, setLevel] = useState<Level | null>(null)
  const [markers, setMarkers] = useState<FrogMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    let active = true
    void (async () => {
      try {
        setLoading(true)
        const next = levelId ? await getLevel(levelId) : (await resolveCurrentLevel(user.uid)).level
        if (next && (next.status !== 'published' || (next.publishAt != null && next.publishAt > Date.now()))) throw new Error('Noch nicht veröffentlicht')
        const found = next ? await getMarkers(next.id) : []
        if (active) { setLevel(next); setMarkers(found); setError(null) }
      } catch { if (active) setError('Dieses Level ist nicht verfügbar. Bitte später erneut versuchen.') }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [user, levelId])
  return <AppLayout mainClass="hunt-play-page" shellClass="hunt-world" hideAmbient>
    {loading ? <div className="spinner" aria-label="Level lädt" /> : error || !level ? <div className="hunt-notice"><p>{error ?? 'Das nächste Level erscheint bald.'}</p><Link to="/">Zur Lobby</Link></div> : user && <PlayView key={level.id} level={level} markers={markers} uid={user.uid} />}
  </AppLayout>
}
