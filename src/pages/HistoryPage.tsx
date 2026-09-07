import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { GameDialog } from '../components/game/GameDialog'
import { listPublishedLevels } from '../services/levelsService'
import { listCompletedForUser } from '../services/progressService'
import { formatTime } from '../lib/gameRules'
import type { Level, UserProgress } from '../types/models'
type Row = { level: Level; progress?: UserProgress }
export function HistoryPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [selected, setSelected] = useState<Row | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([listPublishedLevels(), listCompletedForUser(user.uid)]).then(([levels, results]) => {
      if (active) setRows(levels.map(level => ({ level, progress: results.find(p => p.levelId === level.id) })))
    }).catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])
  const x = (i: number) => [100, 280, 230, 110][i % 4]
  const height = Math.max(500, rows.length * 170 + 230)
  const points = Array.from({ length: rows.length + 1 }, (_, i) => ({ x: x(i), y: 80 + i * 170 }))
  const path = points.map((p, i) => i ? `C ${points[i - 1].x} ${p.y - 70}, ${p.x} ${p.y - 90}, ${p.x} ${p.y}` : `M ${p.x} ${p.y}`).join(' ')
  return <AppLayout mainClass="hunt-history" shellClass="hunt-world" hideAmbient>
    <Link to="/" className="hunt-back">← Zur Lobby</Link><h1>Deine Froggy Reise</h1><p className="hunt-subtitle">Jede Woche ein neues Stück Abenteuer.</p>
    {loading && <div className="spinner" />}
    {error ? <p role="alert" className="hunt-notice">Deine Reise konnte nicht geladen werden. <button onClick={() => location.reload()}>Erneut versuchen</button></p> : !loading && <div className="hunt-map" style={{ height }}>
      <svg viewBox={`0 0 400 ${height}`} preserveAspectRatio="none" aria-hidden><path d={path} fill="none" stroke="#50351d" strokeWidth="44" strokeLinecap="round" /><path d={path} fill="none" stroke="#d7b379" strokeWidth="32" strokeLinecap="round" /><path d={path} fill="none" stroke="#f2d4a0" strokeWidth="3" strokeDasharray="4 13" /></svg>
      {rows.map((row, i) => <button key={row.level.id} className={`hunt-map-node ${row.progress ? 'complete' : ''}`} style={{ left: `${x(i) / 4}%`, top: 80 + i * 170 }} onClick={() => setSelected(row)} aria-label={`Level ${i + 1}: ${row.level.title}${row.progress ? ', abgeschlossen' : ''}`}><b>{i + 1}</b><span>{row.level.title}</span>{row.progress && <small>★ ★ ★</small>}</button>)}
      <div className="hunt-map-future" style={{ left: `${x(rows.length) / 4}%`, top: 80 + rows.length * 170 }}>⌁<span>Fortsetzung am Mittwoch</span></div>
    </div>}
    <GameDialog open={Boolean(selected)} label={selected?.level.title ?? 'Level Details'} onCancel={() => setSelected(null)}>
      {selected && <><p className="hunt-eyebrow">DEIN WOCHENABENTEUER</p><h2>{selected.level.title}</h2>
        {selected.progress ? <><p>Abgeschlossen am {new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeZone: 'Europe/Berlin' }).format(selected.progress.completedAt ?? 0)}</p><strong className="hunt-victory-time">{formatTime(selected.progress.bestDurationMs ?? selected.progress.durationMs ?? 0)}</strong><p>Persönliche Bestzeit</p><div className="hunt-result-grid"><span><b>{selected.progress.foundFroggys.length}/{selected.level.frogCount}</b>Froggys</span><span><b>{selected.progress.misses}</b>Fehlklicks</span><span><b>{selected.progress.hintsUsed ?? 0}</b>Hinweise</span></div><p>Letzter Versuch: {formatTime(selected.progress.durationMs ?? 0)} · {selected.progress.clicks} Klicks · {selected.progress.xp ?? 100} XP</p></> : <p>{selected.level.frogCount} Froggys warten auf dich.</p>}
        <Link className="hunt-primary" to={`/play?level=${encodeURIComponent(selected.level.id)}`}>{selected.progress ? 'Noch einmal spielen' : 'Level spielen'}</Link><button className="hunt-text-button" onClick={() => setSelected(null)}>Zurück zur Karte</button></>}
    </GameDialog>
  </AppLayout>
}
