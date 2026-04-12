interface Props {
  width: number
  height: number
}

const decorations = [
  { id: 't1', x: 120, y: 180, kind: 'tree' },
  { id: 't2', x: 980, y: 240, kind: 'tree' },
  { id: 'b1', x: 260, y: 410, kind: 'bush' },
  { id: 'm1', x: 860, y: 520, kind: 'mush' },
  { id: 'p1', x: 180, y: 670, kind: 'pond' },
  { id: 'f1', x: 1030, y: 770, kind: 'flower' },
  { id: 'r1', x: 350, y: 980, kind: 'rock' },
  { id: 'l1', x: 900, y: 1090, kind: 'leaf' },
  { id: 't3', x: 170, y: 1210, kind: 'tree' },
]

export function MapDecorationLayer({ width, height }: Props) {
  return (
    <div className="history-map__deco" style={{ width, height }} aria-hidden>
      {decorations.map((d) => (
        <span
          key={d.id}
          className={`history-deco history-deco--${d.kind}`}
          style={{ left: d.x, top: d.y }}
        />
      ))}
    </div>
  )
}

