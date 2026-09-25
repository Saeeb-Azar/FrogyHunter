import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { playSound } from '../audio/soundManager'
import { Confetti } from '../components/game-ui/Confetti'
import { Froggy3D, type Froggy3DHandle } from '../components/game-ui/Froggy3D'
import { GameModal } from '../components/game-ui/GameModal'
import { GameStage } from '../components/game-ui/GameStage'
import { LilyPad, Lotus, Mushroom, Stone } from '../components/game-ui/MapDeco'
import { PlayAssetButton } from '../components/game-ui/PlayButtons'
import { ScreenHeader } from '../components/game-ui/ScreenHeader'
import { StarIcon, Stars } from '../components/game-ui/Stars'
import { NewLevelCountdown } from '../components/lobby/NewLevelCountdown'
import { ASSET } from '../lib/gameAssets'
import { formatTime, starsForRun } from '../lib/gameRules'
import { listPublishedLevels } from '../services/levelsService'
import { listCompletedForUser } from '../services/progressService'
import { useSettingsStore } from '../stores/settingsStore'
import type { Level, UserProgress } from '../types/models'

type Row = { level: Level; progress?: UserProgress }
type Pt = { x: number; y: number }

const STEP = 210
const TOP_PAD = 190
const BOTTOM_PAD = 200
const KACHEL_H = 96 * 545 / 360
const ZIGZAG = [0.5, 0.76, 0.5, 0.24]
const HOP_MS = 430

function bezier(a: Pt, b: Pt, t: number): Pt {
  const c1 = { x: a.x, y: a.y - STEP * 0.55 }
  const c2 = { x: b.x, y: b.y + STEP * 0.55 }
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  }
}
const STONE_T = [0.2, 0.4, 0.6, 0.8]

export function HistoryPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const hopFrom = params.get('hop')
  const reduceMotion = useSettingsStore(s => s.reduceMotion)
  const [rows, setRows] = useState<Row[]>([])
  const [selected, setSelected] = useState<Row | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [width, setWidth] = useState(0)
  const [token, setToken] = useState<Pt | null>(null)
  const [celebrate, setCelebrate] = useState<string | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const frog = useRef<Froggy3DHandle>(null)
  const hopped = useRef(false)
  const animating = useRef(false)
  const cancelHop = useRef<() => void>(() => {})
  useEffect(() => () => cancelHop.current(), [])

  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([listPublishedLevels(), listCompletedForUser(user.uid)]).then(([levels, results]) => {
      if (active) setRows(levels.map(level => ({ level, progress: results.find(p => p.levelId === level.id) })))
    }).catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [loading])

  const n = rows.length
  const height = TOP_PAD + n * STEP + BOTTOM_PAD
  const nodes: Pt[] = useMemo(() => Array.from({ length: n + 1 }, (_, i) => ({
    x: Math.round(width * ZIGZAG[i % ZIGZAG.length]),
    y: height - BOTTOM_PAD - i * STEP,
  })), [n, width, height])
  const anchor = useCallback((i: number): Pt => ({ x: nodes[i].x, y: nodes[i].y - (i === n ? 52 : KACHEL_H / 2 - 4) }), [nodes, n])
  const lastDone = rows.reduce((m, r, i) => r.progress?.completed ? i : m, -1)
  const currentIdx = Math.min(lastDone + 1, n)
  const completedCount = rows.filter(r => r.progress?.completed).length
  const starTotal = rows.reduce((s, r) => s + (r.progress?.completed ? starsForRun(r.progress) : 0), 0)

  const scrollTo = useCallback((y: number, smooth: boolean) => {
    const el = scroller.current
    if (!el) return
    el.scrollTo({ top: Math.max(0, y - el.clientHeight * 0.55), behavior: smooth && !reduceMotion ? 'smooth' : 'auto' })
  }, [reduceMotion])

  // Froggy platzieren (bzw. nach einem geschafften Level zum nächsten springen lassen)
  useEffect(() => {
    if (loading || !n || !width || animating.current) return
    const fromIdx = hopFrom && !hopped.current ? rows.findIndex(r => r.level.id === hopFrom) : -1
    if (fromIdx < 0 || !rows[fromIdx].progress?.completed) {
      setToken(anchor(currentIdx))
      if (!hopped.current) { hopped.current = true; scrollTo(nodes[currentIdx].y, false) }
      return
    }
    hopped.current = true
    const toIdx = fromIdx + 1
    const start = anchor(fromIdx)
    const end = anchor(toIdx)
    const done = () => {
      animating.current = false
      frog.current?.face(0)
      frog.current?.celebrate()
      playSound('levelup')
      setCelebrate(toIdx < n ? `Level ${toIdx + 1} freigeschaltet!` : 'Alle Level geschafft!')
      nav('/history', { replace: true })
    }
    setToken(start)
    scrollTo(nodes[fromIdx].y, false)
    if (reduceMotion) { setToken(end); done(); return }
    animating.current = true
    const lift = start.y - nodes[fromIdx].y
    const path: Pt[] = [start, ...STONE_T.map(t => { const p = bezier(nodes[fromIdx], nodes[toIdx], t); return { x: p.x, y: p.y + lift * 0.35 } }), end]
    let raf = 0
    let cancelled = false
    const timers: number[] = []
    cancelHop.current = () => { cancelled = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout) }
    const hop = (i: number) => {
      if (cancelled) return
      if (i >= path.length - 1) { done(); return }
      const a = path[i], b = path[i + 1]
      frog.current?.face(b.x > a.x + 4 ? 0.9 : b.x < a.x - 4 ? -0.9 : 0)
      frog.current?.hop(HOP_MS)
      playSound('hop')
      const t0 = performance.now()
      const step = (now: number) => {
        if (cancelled) return
        const t = Math.min(1, (now - t0) / HOP_MS)
        setToken({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 38 })
        if (t < 1) raf = requestAnimationFrame(step)
        else timers.push(window.setTimeout(() => hop(i + 1), 90))
      }
      raf = requestAnimationFrame(step)
      if (i === 1) scrollTo(nodes[toIdx].y, true)
    }
    timers.push(window.setTimeout(() => hop(0), 900))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, n, width])

  useEffect(() => {
    if (!celebrate) return
    const t = setTimeout(() => setCelebrate(null), 3400)
    return () => clearTimeout(t)
  }, [celebrate])

  const stones = useMemo(() => {
    const out: (Pt & { moss: boolean; w: number })[] = []
    for (let i = 0; i < n; i++) STONE_T.forEach((t, k) => { const p = bezier(nodes[i], nodes[i + 1], t); out.push({ ...p, moss: (i + k) % 3 === 0, w: 30 + ((i * 7 + k * 5) % 10) }) })
    return out
  }, [nodes, n])
  const decos = useMemo(() => nodes.map((p, i) => {
    const side = p.x > width / 2 ? -1 : p.x < width / 2 ? 1 : (i % 2 ? 1 : -1)
    return { i, x: p.x + side * (width * 0.3), y: p.y + 30, kind: i % 3 }
  }), [nodes, width])

  return (
    <GameStage scene="forest">
      <div className="map-screen">
        <ScreenHeader title="LEVEL-KARTE" />
        {!loading && !error && <div className="map-summary">
          <span className="map-chip">🐸 {completedCount}/{n} Level</span>
          <span className="map-chip"><StarIcon on /> {starTotal}/{n * 3}</span>
        </div>}
        {loading && <div className="loading-frog"><i aria-hidden>🐸</i>Karte wird geladen …</div>}
        {error && <div className="wood-panel lobby-notice" role="alert"><div className="wood-panel__inner"><p>Deine Karte konnte nicht geladen werden.</p><button className="text-link" onClick={() => location.reload()}>Erneut versuchen</button></div></div>}
        {!loading && !error && <div className="map-scroll" ref={scroller}>
          <div className="map-world" style={{ height }}>
            <div className="map-water" aria-hidden />
            {decos.map(d => <span key={`d${d.i}`} className="map-deco" style={{ left: d.x, top: d.y }}>
              {d.kind === 0 ? <LilyPad size={58} rot={d.i * 23} /> : d.kind === 1 ? <Lotus size={40} /> : <Mushroom size={32} />}
            </span>)}
            {decos.map(d => <span key={`e${d.i}`} className="map-deco" style={{ left: width - d.x * 0.6 + 10, top: d.y - STEP / 2 }}>
              {d.kind === 2 ? <Lotus size={30} /> : <LilyPad size={40} rot={-d.i * 31} />}
            </span>)}
            {stones.map((s, i) => <span key={`s${i}`} className="map-deco" style={{ left: s.x, top: s.y }}><Stone w={s.w} moss={s.moss} /></span>)}

            {rows.map((row, i) => {
              const done = Boolean(row.progress?.completed)
              const stars = done && row.progress ? starsForRun(row.progress) : 0
              return (
                <button key={row.level.id} type="button" className={`map-node${done ? ' is-done' : ' is-new'}${i === currentIdx ? ' is-current' : ''}`}
                  style={{ left: nodes[i].x, top: nodes[i].y }} onClick={() => setSelected(row)}
                  aria-label={`Level ${i + 1}: ${row.level.title}${done ? `, geschafft mit ${stars} Sternen` : ', noch nicht gespielt'}`}>
                  <span className="map-node__kachel">
                    <img className="frame" src={ASSET.lvlKachel} alt="" draggable={false} />
                    <span className="map-node__num">{i + 1}</span>
                    <span className="map-node__pic"><img src={row.level.imageUrl} alt="" loading="lazy" /></span>
                    <Stars count={stars} className="map-node__stars" />
                    {done && <span className="map-node__done" aria-hidden>✓</span>}
                  </span>
                  <span className="map-node__label">{row.level.title}</span>
                </button>
              )
            })}

            <div className="map-future" style={{ left: nodes[n].x, top: nodes[n].y }} role="note" aria-label="Nächstes Level erscheint am Mittwoch">
              <img src={ASSET.newLvl} alt="" draggable={false} />
              <div className="map-future__text">
                <span className="map-future__title">NEUES LEVEL</span>
                <span className="map-future__sub">JEDEN MITTWOCH · 18 UHR</span>
                <NewLevelCountdown />
              </div>
            </div>

            {token && <div className="map-token" style={{ left: token.x, top: token.y }}>
              <Froggy3D ref={frog} variant="token" fallback={<span className="froggy-fallback" aria-hidden>🐸</span>} />
            </div>}
          </div>
        </div>}
      </div>

      {!loading && !error && n > 0 && (() => {
        const target = rows[Math.min(currentIdx, n - 1)]
        const idx = rows.indexOf(target)
        return <Link to={`/play?level=${encodeURIComponent(target.level.id)}`} className="map-play" aria-label={`Level ${idx + 1} spielen: ${target.level.title}`}>
          <img src={ASSET.btnSpielen} alt="" draggable={false} />
          <span className="map-play__ribbon">LEVEL {idx + 1}</span>
        </Link>
      })()}
      {celebrate && <><Confetti count={50} /><div className="map-toast wood-panel"><div className="wood-panel__inner"><span className="wood-text" style={{ fontSize: 20 }}>{celebrate}</span></div></div></>}

      <GameModal open={Boolean(selected)} label={selected?.level.title ?? 'Level'} title={selected ? `LEVEL ${rows.indexOf(selected) + 1}` : undefined} onClose={() => setSelected(null)}>
        {selected && <>
          <h2>{selected.level.title}</h2>
          <div className="modal-preview"><img src={selected.level.imageUrl} alt="" /></div>
          {selected.progress?.completed ? <>
            <Stars count={starsForRun(selected.progress)} className="victory__stars victory__stars--static" />
            <div className="stat-row">
              <span className="stat-chip"><b>{formatTime(selected.progress.bestDurationMs ?? selected.progress.durationMs ?? 0)}</b><span>Bestzeit</span></span>
              <span className="stat-chip"><b>{selected.progress.misses}</b><span>Fehlklicks</span></span>
              <span className="stat-chip"><b>{selected.progress.hintsUsed ?? 0}</b><span>Hinweise</span></span>
            </div>
            <p>Geschafft am {new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeZone: 'Europe/Berlin' }).format(selected.progress.completedAt ?? 0)} · {selected.progress.xp ?? 100} XP</p>
          </> : <p>{selected.level.frogCount} Froggys haben sich hier versteckt. Findest du sie alle?</p>}
          <div className="game-modal__actions">
            <PlayAssetButton to={`/play?level=${encodeURIComponent(selected.level.id)}`} ribbon={selected.progress?.completed ? 'NOCHMAL SPIELEN' : undefined} />
          </div>
        </>}
      </GameModal>
    </GameStage>
  )
}
