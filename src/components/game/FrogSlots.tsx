import type { FrogMarker } from '../../types/models'

const FROGGY_ANZAHL_IMG = '/assets/ui/froggy_anzahl.png'
const LEER_FROGGY = `${import.meta.env.BASE_URL}assets/ui/leer_froggy.png`

const SLOT_COUNT = 5

interface Props {
  markers: FrogMarker[]
  foundIds: Set<string>
}

export function FrogSlots({ markers, foundIds }: Props) {
  const n = markers.length
  const k = foundIds.size

  return (
    <div className="play-frog-bar" role="status" aria-label={`${k} von ${n} Fröschen gefunden`}>
      <div className="play-frog-bar__inner">
        <img className="play-frog-bar__plate" src={FROGGY_ANZAHL_IMG} alt="" decoding="async" />
        <div className="play-frog-bar__frogs" aria-hidden>
          {Array.from({ length: SLOT_COUNT }, (_, i) => (
            <img
              key={i}
              className="play-frog-bar__froggy"
              src={LEER_FROGGY}
              alt=""
              decoding="async"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
