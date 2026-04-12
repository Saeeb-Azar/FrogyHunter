import { publicUrl } from '../../lib/publicUrl'

const STAR_BOX_IMG = publicUrl('assets/ui/star_box.png')

const STAR_PATH =
  'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'

function StarGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" aria-hidden focusable="false">
      <path d={STAR_PATH} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function PlayStarBox() {
  return (
    <div className="play-star-box" role="img" aria-label="Drei Sterne">
      <div className="play-star-box__inner">
        <img className="play-star-box__img" src={STAR_BOX_IMG} alt="" decoding="async" />
        <div className="play-star-box__stars">
          <StarGlyph className="play-star-box__star play-star-box__star--side" />
          <StarGlyph className="play-star-box__star play-star-box__star--mid" />
          <StarGlyph className="play-star-box__star play-star-box__star--side" />
        </div>
      </div>
    </div>
  )
}
