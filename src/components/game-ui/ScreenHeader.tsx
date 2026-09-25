import { WoodRoundButton } from './WoodButton'

/** Kopfzeile der Unterseiten: Holz-Zurück-Knopf + Titel auf dem Holzbrett (time.png). */
export function ScreenHeader({ title, backTo = '/', backLabel = 'Zurück zur Lobby', right }: { title: string; backTo?: string; backLabel?: string; right?: React.ReactNode }) {
  return (
    <header className="screen-header">
      <WoodRoundButton icon="back" label={backLabel} to={backTo} />
      <h1 className="plank-title"><span>{title}</span></h1>
      <div className="screen-header__right">{right}</div>
    </header>
  )
}
