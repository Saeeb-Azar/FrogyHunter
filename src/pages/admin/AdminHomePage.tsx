import { StoneButton } from '../../components/game-ui/PlayButtons'
import { NewLevelCountdown } from '../../components/lobby/NewLevelCountdown'

export function AdminHomePage() {
  return (
    <div className="card card--pad" style={{ maxWidth: 760, margin: '0 auto' }}>
      <h2 className="h2" style={{ marginTop: 0 }}>Das Wochen-Ritual</h2>
      <p>Jeden Mittwoch um 18 Uhr erscheint ein neues Suchbild. Nächster Termin in <b><NewLevelCountdown /></b>.</p>
      <ol className="studio-steps">
        <li><b>1 · Bild hochladen</b>Fertiges Suchbild mit den versteckten Froggys hochladen (JPG, PNG, WebP).</li>
        <li><b>2 · Froggys anklicken</b>Jeden versteckten Froggy im Bild antippen und den Trefferkreis anpassen.</li>
        <li><b>3 · Selbst testen</b>Einmal komplett durchspielen – erst dann wird die Freigabe aktiv.</li>
        <li><b>4 · Mittwoch planen</b>Veröffentlichung planen. Das Level erscheint automatisch in Lobby und Karte.</li>
      </ol>
      <div className="studio-toolbar">
        <StoneButton to="/admin/levels/new">+ Neues Level anlegen</StoneButton>
        <StoneButton to="/admin/levels" tone="wood">Alle Level bearbeiten</StoneButton>
      </div>
    </div>
  )
}
