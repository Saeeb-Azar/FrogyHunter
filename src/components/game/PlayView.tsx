import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { playSound } from '../../audio/soundManager'
import { findMarkerAtClick } from '../../lib/hitTest'
import { ASSET } from '../../lib/gameAssets'
import { createRun, formatTime, MAX_HINTS, scoreRun, starsForRun, validateMarkers } from '../../lib/gameRules'
import { getProgress } from '../../services/progressService'
import { saveRun } from '../../services/runService'
import { useSettingsStore } from '../../stores/settingsStore'
import type { FrogMarker, GameRun, Level } from '../../types/models'
import { FrogPlank } from '../game-ui/FrogPlank'
import { GameModal } from '../game-ui/GameModal'
import { PlayAssetButton, StoneButton } from '../game-ui/PlayButtons'
import { AssetRoundButton, WoodRoundButton } from '../game-ui/WoodButton'
import { VictoryOverlay } from './VictoryOverlay'

interface Props {
  level: Level
  markers: FrogMarker[]
  uid: string
  levelNumber?: number
  testMode?: boolean
  onExitTest?: () => void
  onTestComplete?: () => Promise<void>
}

type Flyer = { key: number; from: { x: number; y: number }; to: { x: number; y: number } }
const ZOOMS = [1, 2, 3]
const PRAISE = ['GEFUNDEN!', 'SUPER!', 'KLASSE!', 'QUAK-TASTISCH!', 'STARK!']
const TIPS = [
  'Froggys lieben Seerosenblätter, Baumhöhlen und dichtes Gras.',
  'Schau auch in die Ecken – dort verstecken sich die Frechsten.',
  'Schnell hintereinander finden gibt eine Combo!',
  'Ohne Hinweise und mit wenig Fehlklicks gibt es 3 Sterne.',
  'Mit der Lupe kannst du bis zu 3× hineinzoomen.',
]
const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p) } catch { /* nicht unterstützt */ } }
/** Rahmenstärke von play_pic.png in px */
const FRAME = 16

export function PlayView({ level, markers, uid, levelNumber, testMode, onExitTest, onTestComplete }: Props) {
  const nav = useNavigate()
  const [run, setRun] = useState<GameRun>(createRun)
  const current = useRef(run)
  const [initialized, setInitialized] = useState(Boolean(testMode))
  const [wasCompleted, setWasCompleted] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [aspect, setAspect] = useState(1)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const areaRef = useRef<HTMLDivElement>(null)
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
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [pulseSlot, setPulseSlot] = useState<number | null>(null)
  const [shake, setShake] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [praise, setPraise] = useState<{ text: string; key: number; combo: boolean } | null>(null)
  const [nudge, setNudge] = useState(false)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  const lastFindAt = useRef(0)
  const streak = useRef(0)
  const imageRef = useRef<HTMLImageElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
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
    if (testMode) return
    void getProgress(uid, level.id).then(p => {
      if (!active) return
      setWasCompleted(Boolean(p?.completed))
      if (p?.activeAttempt) replaceRun(p.activeAttempt)
      else if (p?.completed) replaceRun(createRun())
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
    const display = window.setInterval(() => {
      setRun(snapshot())
      setNudge(performance.now() - lastFindAt.current > 25000 && current.current.hintsUsed < MAX_HINTS)
    }, 100)
    const checkpoint = window.setInterval(() => persist(snapshot()), 5000)
    return () => { clearInterval(display); clearInterval(checkpoint) }
  }, [running, persist, snapshot])
  useEffect(() => {
    if (!hint) return
    const timeout = setTimeout(() => setHint(null), 2600)
    return () => clearTimeout(timeout)
  }, [hint])
  useEffect(() => {
    if (!praise) return
    const timeout = setTimeout(() => setPraise(null), 1100)
    return () => clearTimeout(timeout)
  }, [praise])
  useEffect(() => {
    if (!feedback) return
    const timeout = setTimeout(() => setFeedback(null), 800)
    return () => clearTimeout(timeout)
  }, [feedback])

  // Bild so groß wie möglich in den Rahmen einpassen (Hoch- und Querformat)
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth - FRAME * 2, h: el.clientHeight - FRAME * 2 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [initialized])
  const fitW = box.w && box.h ? Math.min(box.w, box.h * aspect) : 0

  function resume() {
    if (!imageReady || !initialized || !validateMarkers(markers) || current.current.completed) return
    started.current = performance.now()
    lastFindAt.current = performance.now()
    runningRef.current = true
    setHasStarted(true)
    setRunning(true)
    playSound('start')
  }
  function flyToSlot(clientX: number, clientY: number, slot: number) {
    const target = document.querySelector(`.play-bottom [data-slot="${slot}"]`)?.getBoundingClientRect()
    if (!target || reduced) { setPulseSlot(slot); return }
    const key = Date.now()
    setFlyers(f => [...f, { key, from: { x: clientX - 22, y: clientY - 24 }, to: { x: target.left + target.width / 2 - 22, y: target.top + target.height / 2 - 24 } }])
    setTimeout(() => { setFlyers(f => f.filter(x => x.key !== key)); setPulseSlot(slot) }, 650)
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
    if (hit) {
      next.foundFroggys = [...next.foundFroggys, hit.id]
      playSound('found')
      vibrate(35)
      flyToSlot(clientX, clientY, next.foundFroggys.length - 1)
      const now = performance.now()
      streak.current = now - lastFindAt.current < 6000 && lastFindAt.current > 0 ? streak.current + 1 : 1
      lastFindAt.current = now
      setNudge(false)
      if (next.foundFroggys.length < markers.length) {
        const combo = streak.current >= 2
        if (combo) setTimeout(() => playSound('combo'), 180)
        setPraise({ key: now, combo, text: combo ? `COMBO ×${streak.current}!` : PRAISE[(next.foundFroggys.length - 1) % PRAISE.length] })
      }
    }
    else { next.misses += 1; playSound('miss'); vibrate([15, 40, 15]); setShake(s => s + 1); streak.current = 0 }
    setFeedback({ x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height, hit: Boolean(hit), key: Date.now() })
    if (next.foundFroggys.length === markers.length) {
      next.completed = true
      runningRef.current = false
      setRunning(false)
      setHint(null)
      setTimeout(() => playSound('win'), 400)
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
    lastFindAt.current = performance.now()
    setNudge(false)
    replaceRun(next)
    setHint({ x: Math.max(.16, Math.min(.84, m.x + .055)), y: Math.max(.14, Math.min(.86, m.y - .045)) })
    setZoom(1)
    playSound('hint')
    persist(next)
  }
  function cycleZoom() {
    const el = scrollRef.current
    const next = ZOOMS[(ZOOMS.indexOf(zoom) + 1) % ZOOMS.length]
    if (el) {
      const cx = (el.scrollLeft + el.clientWidth / 2) / Math.max(1, el.scrollWidth)
      const cy = (el.scrollTop + el.clientHeight / 2) / Math.max(1, el.scrollHeight)
      requestAnimationFrame(() => { el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2; el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2 })
    }
    setZoom(next)
    playSound('ui')
  }
  function replay() {
    const next = createRun()
    replaceRun(next)
    setWasCompleted(true)
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
      else await document.documentElement.requestFullscreen?.()
    } catch { /* iOS Safari: kein Element-Vollbild, Layout nutzt bereits den ganzen Bildschirm. */ }
  }

  if (loadError) return <div className="play-screen"><div role="alert" className="wood-panel lobby-notice"><div className="wood-panel__inner"><p>Dein Spielstand konnte nicht geladen werden.</p><StoneButton size="sm" onClick={() => location.reload()}>Erneut laden</StoneButton></div></div></div>
  if (!initialized) return <div className="loading-frog" aria-label="Spielstand laden"><i aria-hidden>🐸</i>Spielstand wird geladen …</div>
  if (!validateMarkers(markers)) return <div className="play-screen"><div className="wood-panel lobby-notice" role="alert"><div className="wood-panel__inner"><p>Dieses Level ist noch nicht spielbereit. Bitte die Fundstellen im Editor prüfen.</p></div></div></div>

  const foundCount = run.foundFroggys.length
  const hintsLeft = MAX_HINTS - run.hintsUsed
  const title = testMode ? 'TESTMODUS' : levelNumber ? `LEVEL ${levelNumber} · ${level.title}` : level.title

  return <div className={`play-screen${reduced ? ' reduced-motion' : ''}`}>
    <header className="play-hud">
      <AssetRoundButton src={ASSET.pause} label="Spiel pausieren" onClick={pause} disabled={!running} />
      <div className="play-hud__center">
        <span className="play-hud__title">{title}</span>
        <strong className="play-timer" role="timer" aria-label={`Zeit ${formatTime(run.durationMs)}`}>{formatTime(run.durationMs)}</strong>
      </div>
      {document.fullscreenEnabled
        ? <AssetRoundButton src={ASSET.fullscreen} label={fullscreen ? 'Vollbild verlassen' : 'Vollbild'} onClick={() => void toggleFullscreen()} active={fullscreen} />
        : <span style={{ width: 58 }} />}
    </header>

    <div className="play-area" ref={areaRef}>
    <div className="play-field" style={fitW ? { width: fitW + FRAME * 2, height: fitW / aspect + FRAME * 2 } : { width: '100%', height: '100%' }}>
      <div className="play-field__scroll" ref={scrollRef}>
        <div key={shake} className={`play-board${!running && !run.completed ? ' is-covered' : ''}${shake ? ' is-shake' : ''}`}
          style={{ width: fitW ? fitW * zoom : '100%' }}
          onPointerDown={e => { gesture.current = { x: e.clientX, y: e.clientY, moved: false } }}
          onPointerMove={e => { if (gesture.current && Math.hypot(e.clientX - gesture.current.x, e.clientY - gesture.current.y) > 8) gesture.current.moved = true }}
          onPointerCancel={() => { gesture.current = null }}
          onPointerUp={e => { if (gesture.current && !gesture.current.moved) clickImage(e.clientX, e.clientY); gesture.current = null }}>
          <img ref={imageRef} src={level.imageUrl} alt={`Suchbild: ${level.title}. Finde ${markers.length} versteckte Froggys.`} draggable={false}
            onLoad={e => { const i = e.currentTarget; setAspect(i.naturalWidth / Math.max(1, i.naturalHeight)); setImageReady(true); setImageError(false) }}
            onError={() => { setImageError(true); setImageReady(false); pause() }} />
          {markers.filter(m => run.foundFroggys.includes(m.id)).map(m => <span key={m.id} className="found-ring" style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${Math.max(m.radius * 200, 6)}%` }} aria-hidden />)}
          {hint && <span className="hint-zone" style={{ left: `${hint.x * 100}%`, top: `${hint.y * 100}%` }} aria-hidden />}
          {feedback && <span key={feedback.key} className={`tap-burst ${feedback.hit ? 'hit' : 'miss'}`} style={{ left: `${feedback.x * 100}%`, top: `${feedback.y * 100}%` }} aria-hidden><span>{feedback.hit ? '+1' : '✕'}</span></span>}
        </div>
      </div>
      {praise && <div key={praise.key} className={`praise${praise.combo ? ' praise--combo' : ''}`} aria-live="polite">{praise.text}</div>}
    </div>
    </div>

    <div className="play-bottom">
      <span className={nudge && running ? 'nudge' : undefined}><WoodRoundButton icon="hint" label={`Hinweis (${hintsLeft} übrig)`} onClick={useHint} disabled={!running || hintsLeft <= 0} badge={hintsLeft} /></span>
      <FrogPlank total={markers.length} found={foundCount} pulseIndex={pulseSlot} />
      <AssetRoundButton src={ASSET.zoom} label={`Zoom ${zoom}× – tippen zum Wechseln`} onClick={cycleZoom} disabled={!running} badge={`${zoom}×`} active={zoom > 1} />
    </div>
    <p className="play-meta">{run.clicks} Klicks · {run.misses} Fehlklicks · {run.hintsUsed} Hinweise{testMode ? ' · ohne Spielstand' : ''}</p>

    {flyers.map(f => <span key={f.key} className="frog-flyer" style={{ left: f.from.x, top: f.from.y, animation: 'none', transition: 'transform .6s cubic-bezier(.5,-0.4,.6,1)', transform: 'translate(0,0) scale(1.4)' }}
      ref={el => { if (el) requestAnimationFrame(() => { el.style.transform = `translate(${f.to.x - f.from.x}px, ${f.to.y - f.from.y}px) scale(.8)` }) }} aria-hidden />)}

    {saveError && <div className="play-save-error parchment" role="alert">Noch nicht gespeichert. <StoneButton size="sm" onClick={() => persist(snapshot())}>Erneut speichern</StoneButton></div>}

    <GameModal open={!running && !run.completed} label={hasStarted ? 'Pause' : 'Bereit zur Suche?'} title={hasStarted ? 'PAUSE' : testMode ? 'LEVEL TESTEN' : levelNumber ? `LEVEL ${levelNumber}` : 'LOS GEHT’S'} onClose={hasStarted ? resume : undefined}>
      <h2>{hasStarted ? 'Kleine Verschnaufpause' : level.title}</h2>
      <p>{hasStarted ? 'Die Zeit steht still. Deine Froggys warten auf dich.' : `Finde alle ${markers.length} Froggys direkt im Bild. Zoom und ${MAX_HINTS} Hinweise helfen dir.`}</p>
      <FrogPlank total={markers.length} found={foundCount} compact />
      <div className="parchment-plate"><b>Froggy-Tipp</b>{tip}</div>
      {imageError
        ? <p role="alert">Das Suchbild konnte nicht geladen werden. <button className="text-link" onClick={() => { setImageError(false); if (imageRef.current) imageRef.current.src = level.imageUrl }}>Erneut laden</button></p>
        : <div className="game-modal__actions">
          <PlayAssetButton onClick={resume} disabled={!imageReady} label={hasStarted ? 'Weitersuchen' : 'Suche starten'} ribbon={!imageReady ? 'BILD LÄDT …' : hasStarted ? 'WEITERSUCHEN' : undefined} />
          <div className="game-modal__row">
            {testMode
              ? <StoneButton tone="wood" size="sm" onClick={onExitTest}>Zum Editor</StoneButton>
              : <><StoneButton tone="wood" size="sm" to="/history">Karte</StoneButton><StoneButton tone="wood" size="sm" to="/">Lobby</StoneButton></>}
          </div>
        </div>}
    </GameModal>

    {run.completed && <VictoryOverlay
      title={level.title}
      durationMs={run.durationMs}
      clicks={run.clicks}
      misses={run.misses}
      hintsUsed={run.hintsUsed}
      stars={starsForRun(run)}
      xp={!testMode && !wasCompleted ? scoreRun(run) : null}
      status={testMode ? (testSaving ? 'Test wird bestätigt …' : 'Test bestanden!') : saveError ? 'Ergebnis noch nicht gespeichert.' : saving ? 'Ergebnis wird gespeichert …' : 'Ergebnis gespeichert ✓'}
      onContinue={testMode ? () => onExitTest?.() : () => nav(`/history?hop=${encodeURIComponent(level.id)}`)}
      continueLabel={testMode ? 'ZUM EDITOR' : 'WEITER'}
      onReplay={replay}
      busy={saving || testSaving}
      onRetrySave={saveError ? () => persist(current.current) : undefined}
    />}
  </div>
}
