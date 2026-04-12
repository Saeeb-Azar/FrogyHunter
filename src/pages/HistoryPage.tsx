import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MapScene } from '../components/history/MapScene'
import { MAP_SNAKE_LEVEL_POINTS } from '../components/history/mapSnake'
import type { MapLevelNode } from '../components/history/types'
import { AppLayout } from '../components/layout/AppLayout'
import { UserBar } from '../components/layout/UserBar'
import { PageTransition } from '../components/ui/PageTransition'
import { getLevel } from '../services/levelsService'
import { listCompletedForUser } from '../services/progressService'
import type { Level, UserProgress } from '../types/models'

export function HistoryPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<{ p: UserProgress; title: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    void (async () => {
      setLoading(true)
      const list = await listCompletedForUser(user.uid)
      const enriched = await Promise.all(
        list.map(async (p) => {
          const lv: Level | null = await getLevel(p.levelId)
          return { p, title: lv?.title ?? p.levelId }
        })
      )
      enriched.sort((a, b) => (b.p.completedAt ?? 0) - (a.p.completedAt ?? 0))
      setRows(enriched)
      setLoading(false)
    })()
  }, [user])

  const nodes = useMemo<MapLevelNode[]>(() => {
    const pickRoadPoint = (index: number) => {
      const pts = MAP_SNAKE_LEVEL_POINTS
      if (index < pts.length) return pts[index]
      const loop = Math.floor(index / pts.length)
      const inLoop = index % pts.length
      const base = pts[inLoop]
      return { x: base.x, y: Math.max(4, base.y - loop * 7) }
    }

    const completed = [...rows]
      .sort((a, b) => (a.p.completedAt ?? 0) - (b.p.completedAt ?? 0))
      .map((row, index) => {
        const point = pickRoadPoint(index)
        return {
          id: row.p.levelId,
          levelNumber: index + 1,
          title: row.title,
          x: point.x,
          y: point.y,
          status: 'completed' as const,
          completedAt: row.p.completedAt,
          durationMs: row.p.durationMs,
          clicks: row.p.clicks,
          misses: row.p.misses,
          foundCount: row.p.foundFroggys.length,
        }
      })

    const nextNumber = completed.length + 1
    const currentPoint = pickRoadPoint(completed.length)
    const current: MapLevelNode = {
      id: 'current-level-mock',
      levelNumber: nextNumber,
      title: 'Aktuelles Abenteuer',
      x: currentPoint.x,
      y: currentPoint.y,
      status: 'current',
      completedAt: null,
      durationMs: null,
      clicks: 0,
      misses: 0,
      foundCount: 0,
    }
    const lockedPoint = pickRoadPoint(completed.length + 1)
    const locked: MapLevelNode = {
      id: 'locked-level-mock',
      levelNumber: nextNumber + 1,
      title: 'Nebelmoor (bald)',
      x: lockedPoint.x,
      y: lockedPoint.y,
      status: 'locked',
      completedAt: null,
      durationMs: null,
      clicks: 0,
      misses: 0,
      foundCount: 0,
    }

    return [...completed, current, locked]
  }, [rows])

  return (
    <AppLayout showBack backTo="/">
      <UserBar />
      <PageTransition>
        <div className="history-page">
          <div className="history-forest__intro">
            <h2 className="h2 h2--display">Deine Froggy-Reise</h2>
            <p className="muted">Waldkarte statt Liste: Tippe auf Stationen entlang des Moospfads.</p>
          </div>

          {loading && <div className="spinner" />}

          {!loading && rows.length === 0 && (
            <div className="empty-state card card--pad">
              <p>Noch keine abgeschlossenen Level auf deiner Karte.</p>
              <Link to="/play" className="btn btn--primary" style={{ marginTop: '1.15rem', display: 'inline-flex' }}>
                Jetzt spielen
              </Link>
            </div>
          )}

          {!loading && <MapScene nodes={nodes} />}
        </div>
      </PageTransition>
    </AppLayout>
  )
}
