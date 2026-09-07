import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playSound } from '../../audio/soundManager'
import { findMarkerAtClick } from '../../lib/hitTest'
import { createRun, formatTime, MAX_HINTS, scoreRun, validateMarkers } from '../../lib/gameRules'
import { getProgress } from '../../services/progressService'
import { saveRun } from '../../services/runService'
import { useSettingsStore } from '../../stores/settingsStore'
import type { FrogMarker, GameRun, Level } from '../../types/models'
import { GameDialog } from './GameDialog'

interface Props { level: Level; markers: FrogMarker[]; uid: string; testMode?: boolean; onExitTest?: () => void; onTestComplete?: () => Promise<void> }

export function PlayView({ level, markers, uid, testMode, onExitTest, onTestComplete }: Props) {
  const [run, setRun] = useState<GameRun>(createRun)
  const current = useRef(run)
  const [initialized, setInitialized] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [running, setRunning] = useState(false)
  const runningRef = useRef(false)
  const started = useRef(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testSaving, setTestSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null)
  const [feedback, setFeedback] = useState<{ x: number; y: number; hit: boolean; key: number } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const queue = useRef(Promise.resolve())
  const latestSave = useRef(0)
  const reduced = useSettingsStore(s => s.reduceMotion)
  const replaceRun = useCallback((next: GameRun) => { current.current = next; setRun(next) }, [])
  const snapshot = useCallback(() => ({ ...current.current, durationMs: current.current.durationMs + (runningRef.current ? performance.now() - started.current : 0) }), [])
  const persist = useCallback((next: GameRun) => {
    if (testMode) return
    const request = ++latestSave.current
    setSaving(true)
    queue.current = queue.current.catch(() => {}).then(() => saveRun(uid, level.id, next)).then(() => {
      setSaveError(false)
    }).catch(() => { setSaveError(true) }).finally(() => { if (request === latestSave.current) setSaving(false) })
  }, [level.id, uid, testMode])
  useEffect(() => {
    let active = true
    if (testMode) { setInitialized(true); return }
    void getProgress(uid, level.id).then(p => {
      if (!active) return
      if (p?.activeAttempt) replaceRun(p.activeAttempt)
      else if (p?.completed) replaceRun({ id: p.lastAttemptId ?? crypto.randomUUID(), startedAt: p.startedAt,
        durationMs: p.durationMs ?? 0, clicks: p.clicks, misses: p.misses, hintsUsed: p.hintsUsed ?? 0,
        foundFroggys: p.foundFroggys, completed: true })
      else if (p) replaceRun({ ...createRun(), startedAt: p.startedAt, durationMs: p.durationMs ?? 0,
        foundFroggys: p.foundFroggys, clicks: p.clicks, misses: p.misses })
      setInitialized(true)
    }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [uid, level.id, testMode, replaceRun])
  const pause = useCallback(() => {
    if (!runningRef.current) return
    const next = snapshot()
    runningRef.current = false
    setRunning(false)
    replaceRun(next)
    persist(next)
  }, [persist, snapshot, replaceRun])
  useEffect(() => () => {
    if (!runningRef.current) return
    const next = snapshot()
    runningRef.current = false
    if (!testMode) queue.current = queue.current.catch(() => {}).then(() => saveRun(uid, level.id, next)).catch(() => {})
  }, [level.id, uid, testMode, snapshot])
  useEffect(() => {
    const hidden = () => { if (document.hidden) pause() }
    const full = () => setFullscreen(Boolean(document.fullscreenElement))
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') pause() }
    document.addEventListener('visibilitychange', hidden)
    document.addEventListener('fullscreenchange', full)
    window.addEventListener('pagehide', pause)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('visibilitychange', hidden)
      document.removeEventListener('fullscreenchange', full)
      window.removeEventListener('pagehide', pause)
      window.removeEventListener('keydown', esc)
    }
  }, [pause])
  useEffect(() => {
    if (!running) return
    const display = window.setInterval(() => setRun(snapshot()), 100)
    const checkpoint = window.setInterval(() => persist(snapshot()), 5000)
    return () => { clearInterval(display); clearInterval(checkpoint) }
  }, [running, persist, snapshot])
  useEffect(() => {
    if (!hint) return
    const timeout = setTimeout(() => setHint(null), 2200)
    return () => clearTimeout(timeout)
  }, [hint])
  useEffect(() => {
    if (!feedback) return
    const timeout = setTimeout(() => setFeedback(null), 700)
    return () => clearTimeout(timeout)
  }, [feedback])
  function resume() {
    if (!imageReady || !initialized || !validateMarkers(markers) || current.current.completed) return
    started.current = performance.now()
    runningRef.current = true
    setHasStarted(true)
    setRunning(true)
    playSound('ui')
  }
  function clickImage(clientX: number, clientY: number) {
    if (!runningRef.current || !imageRef.current || current.current.completed) return
    const rect = imageRef.current.getBoundingClientRect()
    const found = new Set(current.current.foundFroggys)
    const hit = findMarkerAtClick(clientX, clientY, rect, markers, found)
    if (!hit && findMarkerAtClick(clientX, clientY, rect, markers.filter(m => found.has(m.id)), new Set())) return
    const next = snapshot()
    started.current = performance.now()
    next.clicks += 1
    if (hit) { next.foundFroggys = [...next.foundFroggys, hit.id]; playSound('found') }
    else { next.misses += 1; playSound('miss') }
    setFeedback({ x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height, hit: Boolean(hit), key: Date.now() })
    if (next.foundFroggys.length === markers.length) {
      next.completed = true
      runningRef.current = false
      setRunning(false)
      setHint(null)
      playSound('win')
      if (testMode && onTestComplete) {
        setTestSaving(true)
        void onTestComplete().finally(() => setTestSaving(false))
      }
    }
    replaceRun(next)
    persist(next)
  }
  function useHint() {
    if (!runningRef.current || current.current.hintsUsed >= MAX_HINTS) return
    const m = markers.find(m => !current.current.foundFroggys.includes(m.id))
    if (!m) return
    const next = snapshot()
    started.current = performance.now()
    next.hintsUsed += 1
    replaceRun(next)
    setHint({ x: Math.max(.16, Math.min(.84, m.x + .055)), y: Math.max(.14, Math.min(.86, m.y - .045)) })
    setZoom(1)
    playSound('ui')
    persist(next)
  }
  function replay() {
    const next = createRun()
    replaceRun(next)
    setHasStarted(false)
    setRunning(false)
    runningRef.current = false
    setZoom(1)
    setFeedback(null)
    persist(next)
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (rootRef.current?.requestFullscreen) await rootRef.current.requestFullscreen()
    } catch { /* Responsive full-width fallback on unsupported browsers. */ }
  }
  if (loadError) return <div role="alert" className="hunt-notice">Dein Spielstand konnte nicht geladen werden. <button className="btn" onClick={() => location.reload()}>Erneut laden</button></div>
  if (!initialized) return <div className="spinner" aria-label="Spielstand laden" />
  if (!validateMarkers(markers)) return <div className="hunt-notice" role="alert">Dieses Level ist noch nicht spielbereit. Bitte die Fundstellen im Editor prüfen.</div>
  return <div ref={rootRef} className={`hunt-game${reduced ? ' reduced-motion' : ''}`}>
    <header className="hunt-hud">
      <button type="button" className="hunt-icon-button" onClick={pause} disabled={!running} aria-label="Spiel pausieren">Ⅱ</button>
      <div><span className="hunt-eyebrow">{testMode ? 'TESTMODUS' : level.title}</span><strong className="hunt-timer">{formatTime(run.durationMs)}</strong></div>
      <span className="hunt-count" aria-live="polite">{run.foundFroggys.length} / {markers.length} 🐸</span>
    </header>
    <div className="hunt-image-scroll">
      <div className={`hunt-image-board${!running && !run.completed ? ' is-covered' : ''}`} style={{ width: `${zoom * 100}%` }}
        onPointerDown={e => { gesture.current = { x: e.clientX, y: e.clientY, moved: false } }}
        onPointerMove={e => { if (gesture.current && Math.hypot(e.clientX - gesture.current.x, e.clientY - gesture.current.y) > 8) gesture.current.moved = true }}
        onPointerCancel={() => { gesture.current = null }}
        onPointerUp={e => { if (gesture.current && !gesture.current.moved) clickImage(e.clientX, e.clientY); gesture.current = null }}>
        <img ref={imageRef} src={level.imageUrl} alt={`Suchbild: ${level.title}. Finde ${markers.length} versteckte Froggys.`} draggable={false}
          onLoad={() => { setImageReady(true); setImageError(false) }} onError={() => { setImageError(true); setImageReady(false); pause() }} />
        {markers.filter(m => run.foundFroggys.includes(m.id)).map(m => <span key={m.id} className="hunt-found" style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${m.radius * 200}%` }} aria-hidden>✓</span>)}
        {hint && <span className="hunt-hint-zone" style={{ left: `${hint.x * 100}%`, top: `${hint.y * 100}%` }} aria-hidden />}
        {feedback && <span key={feedback.key} className={`hunt-tap-feedback ${feedback.hit ? 'hit' : 'miss'}`} style={{ left: `${feedback.x * 100}%`, top: `${feedback.y * 100}%` }} aria-hidden>{feedback.hit ? '✦' : '×'}</span>}
      </div>
    </div>
    <footer className="hunt-tools">
      <button className="hunt-tool" onClick={useHint} disabled={!running || run.hintsUsed >= MAX_HINTS}>⌕ <span>Hinweis <small>{MAX_HINTS - run.hintsUsed}/{MAX_HINTS}</small></span></button>
      <div className="hunt-zoom-controls" aria-label="Bild vergrößern"><button onClick={() => setZoom(z => Math.max(1, z - .5))} disabled={zoom <= 1} aria-label="Verkleinern">−</button><span>{zoom}×</span><button onClick={() => setZoom(z => Math.min(3, z + .5))} disabled={zoom >= 3} aria-label="Vergrößern">+</button></div>
      {document.fullscreenEnabled && <button className="hunt-tool" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Vollbild verlassen' : 'Vollbild'}>⛶</button>}
    </footer>
    <div className="hunt-frog-slots" aria-label={`${run.foundFroggys.length} von ${markers.length} Froggys gefunden`}>{markers.map(m => <span key={m.id} className={run.foundFroggys.includes(m.id) ? 'is-found' : ''} aria-hidden>🐸</span>)}</div>
    <p className="hunt-small">{run.clicks} Klicks · {run.misses} Fehlklicks · {run.hintsUsed} Hinweise{testMode ? ' · ohne Spielstand' : ''}</p>
    {saveError && <p className="hunt-notice" role="alert">Noch nicht gespeichert. Verbindung prüfen. <button onClick={() => persist(snapshot())}>Erneut speichern</button></p>}
    <GameDialog open={!running && !run.completed} label={hasStarted ? 'Pause' : 'Bereit zur Suche?'} onCancel={() => { if (hasStarted) resume() }}>
      <span className="hunt-dialog-symbol" aria-hidden>🐸</span>
      <p className="hunt-eyebrow">{testMode ? 'LEVEL TESTEN' : 'DEIN WALDABENTEUER'}</p>
      <h2>{hasStarted ? 'Kleine Verschnaufpause' : 'Augen auf, Froggys raus!'}</h2>
      <p>{hasStarted ? 'Die Zeit steht still. Deine Froggys warten auf dich.' : `Finde ${markers.length} Froggys direkt im Bild. Bei kleinen Details helfen Zoom und drei Hinweise.`}</p>
      {imageError ? <p role="alert">Das Suchbild konnte nicht geladen werden. <button onClick={() => { setImageError(false); if (imageRef.current) imageRef.current.src = level.imageUrl }}>Erneut laden</button></p> : <button className="hunt-primary" onClick={resume} disabled={!imageReady}>{!imageReady ? 'Suchbild lädt …' : hasStarted ? 'Weitersuchen' : 'Suche starten'}</button>}
      {testMode ? <button className="hunt-text-button" onClick={onExitTest}>Zum Editor</button> : <Link className="hunt-text-button" to="/">Zur Lobby</Link>}
    </GameDialog>
    <GameDialog open={run.completed} label="Alle Froggys gefunden">
      <div className="hunt-victory-stars" aria-hidden>✦ ★ ✦</div>
      <h2>Alle Froggys gefunden!</h2><p>Das war eine richtig gute Suche.</p>
      <strong className="hunt-victory-time">{formatTime(run.durationMs)}</strong>
      <div className="hunt-result-grid"><span><b>{run.clicks}</b>Klicks</span><span><b>{run.misses}</b>Fehlklicks</span><span><b>{run.hintsUsed}</b>Hinweise</span></div>
      <p className="hunt-xp">{scoreRun(run)} XP beim ersten Abschluss · Bestzeiten bleiben erhalten</p>
      {!testMode && <p role="status">{saveError ? 'Ergebnis noch nicht gespeichert.' : saving ? 'Ergebnis wird gespeichert …' : 'Dein Ergebnis ist gespeichert.'}</p>}
      {saveError && <button className="hunt-primary" onClick={() => persist(current.current)}>Speichern wiederholen</button>}
      <button className="hunt-primary" onClick={replay} disabled={saving || saveError}>Noch einmal spielen</button>
      {testMode ? <button className="hunt-text-button" disabled={testSaving} onClick={onExitTest}>{testSaving ? 'Test wird bestätigt …' : 'Zum Editor'}</button> : <Link to="/history" className="hunt-text-button">Zu meiner Reise</Link>}
    </GameDialog>
  </div>
}
