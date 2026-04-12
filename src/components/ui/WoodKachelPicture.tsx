import { Link } from 'react-router-dom'

/** Holzkachel (`public/assets/ui/lvl_kachel.png`). Mit `playHref` nur die Grafik klickbar, nicht das ganze Aside. */
export function WoodKachelPicture({
  pictureClassName,
  imgClassName,
  playHref,
  playAriaLabel = 'Level starten',
}: {
  pictureClassName: string
  imgClassName: string
  playHref?: string
  playAriaLabel?: string
}) {
  const img = (
    <img
      className={imgClassName}
      src="/assets/ui/lvl_kachel.png"
      alt=""
      width={3470}
      height={1812}
      decoding="async"
      draggable={false}
    />
  )

  return (
    <span className={pictureClassName}>
      <span className="lvl-card-root__media">
        {playHref ? (
          <Link to={playHref} className="lvl-card-root__wood-link" aria-label={playAriaLabel}>
            {img}
          </Link>
        ) : (
          img
        )}
      </span>
    </span>
  )
}
