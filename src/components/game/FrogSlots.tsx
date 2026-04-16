import { memo } from 'react'
import { publicUrl } from '../../lib/publicUrl'
import type { FrogMarker } from '../../types/models'

const FROGGY_ANZAHL_IMG = publicUrl('assets/ui/froggy_anzahl.png')
const LEER_FROGGY = publicUrl('assets/ui/leer_froggy.png')

const SLOT_COUNT = 5

const SLOT_IMAGES = Array.from({ length: SLOT_COUNT }, (_, i) => (
  <img
    key={i}
    className="play-frog-bar__froggy"
    src={LEER_FROGGY}
    alt=""
    decoding="async"
  />
))

interface Props {
  markers: FrogMarker[]
  foundIds: Set<string>
}

function FrogSlotsImpl({ markers, foundIds }: Props) {
  const n = markers.length
  const k = foundIds.size

  return (
    <div className="play-frog-bar" role="status" aria-label={`${k} von ${n} Fröschen gefunden`}>
      <div className="play-frog-bar__inner">
        <img className="play-frog-bar__plate" src={FROGGY_ANZAHL_IMG} alt="" decoding="async" />
        <div className="play-frog-bar__frogs" aria-hidden>
          {SLOT_IMAGES}
        </div>
      </div>
    </div>
  )
}

export const FrogSlots = memo(
  FrogSlotsImpl,
  (prev, next) =>
    prev.markers.length === next.markers.length && prev.foundIds.size === next.foundIds.size,
)
