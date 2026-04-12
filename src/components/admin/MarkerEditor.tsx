import { useCallback, useMemo, useState } from 'react'
import { normalizeClickToMarkerSpace } from '../../lib/hitTest'
import type { FrogMarker } from '../../types/models'

interface Props {
  imageUrl: string
  markers: FrogMarker[]
  onChange: (next: FrogMarker[]) => void
}

export function MarkerEditor({ imageUrl, markers, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useMemo(() => markers.find((m) => m.id === selectedId) ?? null, [markers, selectedId])

  const onImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const { x, y } = normalizeClickToMarkerSpace(e.clientX, e.clientY, rect)
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    const id = crypto.randomUUID()
    const next: FrogMarker = { id, x, y, radius: 0.045 }
    onChange([...markers, next])
    setSelectedId(id)
  }

  const updateSelected = useCallback(
    (patch: Partial<FrogMarker>) => {
      if (!selectedId) return
      onChange(markers.map((m) => (m.id === selectedId ? { ...m, ...patch } : m)))
    },
    [markers, onChange, selectedId]
  )

  return (
    <div>
      <div className="muted" style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
        Klicke auf das Bild, um eine Fundstelle zu setzen. Wähle einen Kreis, um Radius anzupassen oder zu löschen.
      </div>
      <div className="marker-editor card" style={{ padding: '0.5rem' }}>
        <div onClick={onImageClick} role="presentation" style={{ position: 'relative' }}>
          <img src={imageUrl} alt="Level-Vorschau für Marker" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
          {markers.map((m) => {
            const isSel = m.id === selectedId
            return (
              <button
                key={m.id}
                type="button"
                className={`marker-handle ${isSel ? 'marker-handle--selected' : ''}`}
                title="Fundstelle"
                onClick={(ev) => {
                  ev.stopPropagation()
                  setSelectedId(m.id)
                }}
                style={{
                  left: `${m.x * 100}%`,
                  top: `${m.y * 100}%`,
                  width: `${m.radius * 200}%`,
                  aspectRatio: '1',
                  height: 'auto',
                  transform: 'translate(-50%, -50%)',
                  background: isSel ? 'rgba(127,255,92,0.15)' : 'rgba(127,255,92,0.06)',
                }}
              />
            )
          })}
        </div>
      </div>

      <div className="card card--pad" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <strong>
            Froggys: <span style={{ color: 'var(--accent)' }}>{markers.length}</span>
          </strong>
          {selected && (
            <button type="button" className="btn btn--danger" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} onClick={() => {
              onChange(markers.filter((m) => m.id !== selected.id))
              setSelectedId(null)
            }}>
              Marker löschen
            </button>
          )}
        </div>
        {selected && (
          <div className="field" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <label htmlFor="rad">Radius ({selected.radius.toFixed(3)})</label>
            <input
              id="rad"
              type="range"
              min={0.015}
              max={0.12}
              step={0.002}
              value={selected.radius}
              className="range"
              onChange={(e) => updateSelected({ radius: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
