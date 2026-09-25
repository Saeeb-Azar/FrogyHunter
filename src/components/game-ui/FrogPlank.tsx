import { ASSET } from '../../lib/gameAssets'

/** froggy_anzahl.png mit Frosch-Silhouetten (leer_froggy.png), die sich beim Finden grün füllen. */
export function FrogPlank({ total, found, pulseIndex, compact }: { total: number; found: number; pulseIndex?: number | null; compact?: boolean }) {
  return (
    <div className={`frog-plank${compact ? ' frog-plank--compact' : ''}`} role="status" aria-label={`${found} von ${total} Froggys gefunden`}>
      <img className="frog-plank__board" src={ASSET.froggyAnzahl} alt="" draggable={false} />
      <div className={`frog-plank__slots${total > 8 ? ' is-two-rows' : ''}`} style={{ '--n': total, '--per-row': total > 8 ? Math.ceil(total / 2) : total } as React.CSSProperties} aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`fslot${i < found ? ' is-found' : ''}${pulseIndex === i ? ' is-new' : ''}`} data-slot={i}>
            <i />
          </span>
        ))}
      </div>
    </div>
  )
}
