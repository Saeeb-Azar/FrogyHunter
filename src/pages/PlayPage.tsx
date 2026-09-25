import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PlayView } from '../components/game/PlayView'
import { GameStage } from '../components/game-ui/GameStage'
import { StoneButton } from '../components/game-ui/PlayButtons'
import { resolveCurrentLevel } from '../lib/currentLevel'
import { getLevel, listPublishedLevels } from '../services/levelsService'
import { getMarkers } from '../services/markersService'
import type { FrogMarker, Level } from '../types/models'

export function PlayPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const levelId = params.get('level')
  const [level, setLevel] = useState<Level | null>(null)
  const [levelNumber, setLevelNumber] = useState<number | undefined>()
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
        const [found, published] = next ? await Promise.all([getMarkers(next.id), listPublishedLevels()]) : [[], []]
        const idx = next ? published.findIndex(l => l.id === next.id) : -1
        if (active) { setLevel(next); setMarkers(found); setLevelNumber(idx >= 0 ? idx + 1 : undefined); setError(null) }
      } catch { if (active) setError('Dieses Level ist nicht verfügbar. Bitte später erneut versuchen.') }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [user, levelId])
  return <GameStage scene="play" wide className="stage--play">
    {loading ? <div className="loading-frog" aria-label="Level lädt"><i aria-hidden className="froggy-head" />Level wird geladen …</div>
      : error || !level ? <div className="wood-panel lobby-notice"><div className="wood-panel__inner"><p>{error ?? 'Das nächste Level erscheint bald.'}</p><StoneButton to="/" size="sm">Zur Lobby</StoneButton></div></div>
      : user && <PlayView key={level.id} level={level} markers={markers} uid={user.uid} levelNumber={levelNumber} />}
  </GameStage>
}
