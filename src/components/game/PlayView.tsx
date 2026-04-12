import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { playSound } from '../../audio/soundManager'
import { findMarkerAtClick } from '../../lib/hitTest'
import { completeLevel, ensureStarted, getProgress, recordClick, recordFound, resetProgress } from '../../services/progressService'
import { recordCompletionAggregate } from '../../services/statsService'
import { useSettingsStore } from '../../stores/settingsStore'
import type { FrogMarker, Level } from '../../types/models'
import { FrogSlots } from './FrogSlots'
import { PlayPauseCorner } from './PlayPauseCorner'
import { PlayStarBox } from './PlayStarBox'
import { PlayTimeBar } from './PlayTimeBar'
import { PlayZoomCorner } from './PlayZoomCorner'
import { PlayZoomLens } from './PlayZoomLens'
import { VictoryOverlay } from './VictoryOverlay'

interface Props {
  level: Level
  markers: FrogMarker[]
  uid: string
  testMode?: boolean
  onExitTest?: () => void
  /** Nur untere Frosch-Leiste + Fortschritt laden; Spielfläche/HUD aus (schrittweiser UI-Aufbau). */
  bottomBarOnly?: boolean
  /** Ref auf das mittlere play_pic (für Lupen-Zoom). */
  playPicImgRef?: RefObject<HTMLImageElement | null>
}

interface Ring {
  id: string
  x: number
  y: number
  r: number
}

export function PlayView({ level, markers, uid, testMode, onExitTest, bottomBarOnly, playPicImgRef }: Props) {
  /** Echtes Level-Foto nur im Admin-Test; im normalen Spiel stilisierte Fläche (kein Foto). */
  const showLevelArt = Boolean(testMode)
  const playfieldRef = useRef<HTMLDivElement>(null)
  const testStartRef = useRef<number | null>(null)
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set())
  const [rings, setRings] = useState<Ring[]>([])
  const [missBurst, setMissBurst] = useState<{ x: number; y: number; k: number } | null>(null)
  const [victory, setVictory] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [clicks, setClicks] = useState(0)
  const [misses, setMisses] = useState(0)
  const [summary, setSummary] = useState<{ durationMs: number; clicks: number; misses: number } | null>(null)
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)
  const [zoomLensActive, setZoomLensActive] = useState(false)

  const syncProgress = useCallback(async () => {
    if (testMode) {
      if (testStartRef.current == null) testStartRef.current = Date.now()
      return
    }
    const p = await ensureStarted(uid, level.id)
    setFoundIds(new Set(p.foundFroggys))
    setStartedAt(p.startedAt)
    setClicks(p.clicks)
    setMisses(p.misses)
    if (p.completed && markers.length && p.foundFroggys.length >= markers.length) {
      setVictory(true)
      setSummary({
        durationMs: (p.durationMs ?? 0) || Date.now() - p.startedAt,
        clicks: p.clicks,
        misses: p.misses,
      })
    }
  }, [uid, level.id, markers.length, testMode])

  useEffect(() => {
    void syncProgress()
  }, [syncProgress])

  useEffect(() => {
    if (bottomBarOnly || !playfieldRef.current || !markers.length) return
    const el = playfieldRef.current
    const placeRings = () => {
      const rect = el.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const next: Ring[] = []
      for (const m of markers) {
        if (!foundIds.has(m.id)) continue
        next.push({
          id: m.id,
          x: m.x * w,
          y: m.y * h,
          r: Math.max(0.008, m.radius) * w,
        })
      }
      setRings(next)
    }
    placeRings()
    const ro = new ResizeObserver(placeRings)
    ro.observe(el)
    return () => ro.disconnect()
  }, [bottomBarOnly, markers, foundIds])

  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const field = playfieldRef.current
    if (!field || victory) return
    const rect = field.getBoundingClientRect()
    const hit = findMarkerAtClick(e.clientX, e.clientY, rect, markers, foundIds)

    if (testMode) {
      if (testStartRef.current == null) testStartRef.current = Date.now()
      const nextClicks = clicks + 1
      const nextMisses = hit ? misses : misses + 1
      setClicks(nextClicks)
      setMisses(nextMisses)
      if (hit) {
        if (!foundIds.has(hit.id)) {
          playSound('found')
          setFoundIds((prev) => new Set([...prev, hit.id]))
        }
      } else {
        playSound('miss')
        setMissBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top, k: Date.now() })
      }
      const willFound = hit && !foundIds.has(hit.id) ? foundIds.size + 1 : foundIds.size
      if (markers.length > 0 && willFound >= markers.length) {
        playSound('win')
        const t0 = testStartRef.current ?? Date.now()
        setSummary({
          durationMs: Date.now() - t0,
          clicks: nextClicks,
          misses: nextMisses,
        })
        setVictory(true)
      }
      return
    }

    await recordClick(uid, level.id, !hit)
    const afterClick = await getProgress(uid, level.id)
    if (afterClick) {
      setClicks(afterClick.clicks)
      setMisses(afterClick.misses)
    }

    if (hit) {
      if (foundIds.has(hit.id)) return
      playSound('found')
      const p = await recordFound(uid, level.id, hit.id)
      setFoundIds(new Set(p.foundFroggys))
      setClicks(p.clicks)
      setMisses(p.misses)
      if (p.foundFroggys.length >= markers.length) {
        playSound('win')
        const start = startedAt ?? p.startedAt
        const duration = Date.now() - start
        await completeLevel(uid, level.id, duration)
        void recordCompletionAggregate(level.id, duration, p.clicks)
        setSummary({ durationMs: duration, clicks: p.clicks, misses: p.misses })
        setVictory(true)
      }
    } else {
      playSound('miss')
      setMissBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top, k: Date.now() })
    }
  }

  const onReplay = async () => {
    if (testMode) {
      testStartRef.current = Date.now()
      setFoundIds(new Set())
      setVictory(false)
      setSummary(null)
      setClicks(0)
      setMisses(0)
      setRings([])
      return
    }
    await resetProgress(uid, level.id)
    setVictory(false)
    setSummary(null)
    setFoundIds(new Set())
    setRings([])
    const p = await ensureStarted(uid, level.id)
    setStartedAt(p.startedAt)
    setClicks(p.clicks)
    setMisses(p.misses)
  }

  const frozenDurationMs = victory && summary ? summary.durationMs : null

  const zoomChrome =
    playPicImgRef && !testMode ? (
      <>
        <PlayZoomLens sourceImgRef={playPicImgRef} active={zoomLensActive} />
        <PlayZoomCorner active={zoomLensActive} onToggle={() => setZoomLensActive((v) => !v)} />
      </>
    ) : null

  if (bottomBarOnly && !testMode) {
    return (
      <>
        <PlayPauseCorner />
        <PlayTimeBar startedAt={startedAt} frozenDurationMs={frozenDurationMs} />
        <PlayStarBox />
        {zoomChrome}
        <FrogSlots markers={markers} foundIds={foundIds} />
      </>
    )
  }

  return (
    <>
      {!testMode && (
        <>
          <PlayPauseCorner />
          <PlayTimeBar startedAt={startedAt} frozenDurationMs={frozenDurationMs} />
          <PlayStarBox />
          {zoomChrome}
        </>
      )}
      <div className="play-view-stack">
        <div className="game-hud-panel game-hud-panel--compact">
          <div className="game-hud game-hud--compact">
            <div className="game-meta">
              <span>{testMode ? 'Testmodus' : 'Live'}</span>
              <span>Klicks {clicks}</span>
            </div>
          </div>
        </div>

        <div className="game-canvas-wrap" onClick={handleImageClick} role="presentation" style={{ position: 'relative' }}>
        <div
          ref={playfieldRef}
          className={`game-canvas-playfield${showLevelArt ? ' game-canvas-playfield--level-art' : ''}`}
        >
          {showLevelArt ? (
            <img
              className="game-canvas-playfield__level-img"
              src={level.imageUrl}
              alt={level.title}
              draggable={false}
            />
          ) : null}
        </div>
        {rings.map((r) => (
          <div
            key={r.id}
            className="hit-ring"
            style={{
              width: r.r * 2,
              height: r.r * 2,
              left: r.x - r.r,
              top: r.y - r.r,
            }}
          />
        ))}
        <AnimatePresence>
          {missBurst && (
            <motion.div
              key={missBurst.k}
              className="miss-flash"
              style={{ left: missBurst.x, top: missBurst.y }}
              initial={reduceMotion ? { opacity: 0.8 } : { opacity: 0.9, scale: 0.5 }}
              animate={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.45 }}
              onAnimationComplete={() => setMissBurst(null)}
            />
          )}
        </AnimatePresence>
        </div>
      </div>

      <FrogSlots markers={markers} foundIds={foundIds} />

      {testMode && (
        <div className="game-toolbar">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => void onReplay()}>
            Test zurücksetzen
          </button>
          {onExitTest && (
            <button type="button" className="btn btn--primary btn--sm" onClick={onExitTest}>
              Editor schließen
            </button>
          )}
        </div>
      )}

      {victory && summary && (
        <VictoryOverlay
          title={level.title}
          durationMs={summary.durationMs}
          clicks={summary.clicks}
          misses={summary.misses}
          onReplay={() => void onReplay()}
        />
      )}
    </>
  )
}
