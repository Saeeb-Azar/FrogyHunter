import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLevelDraft, updateLevel } from '../../services/levelsService'
import { uploadLevelImage } from '../../services/storageService'
import { berlinInput, parseBerlinInput } from '../../lib/levelValidation'
import { getNextWednesdayMidnightBerlin } from '../../lib/wednesdayCountdownBerlin'
export function AdminLevelNewPage() {
  const nav = useNavigate()
  const createdId = useRef<string | null>(null)
  const [title, setTitle] = useState('')
  const [publishAt, setPublishAt] = useState(berlinInput(getNextWednesdayMidnightBerlin().toMillis()))
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit() {
    setError(null)
    if (!title.trim() || !file) { setError('Bitte einen Titel und ein Suchbild angeben.'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) { setError('Bitte JPG, PNG oder WebP bis 12 MB auswählen.'); return }
    setBusy(true)
    try {
      const publish = parseBerlinInput(publishAt)
      const id = createdId.current ?? await createLevelDraft({ title: title.trim(), imageUrl: '', publishAt: publish, status: 'draft' })
      createdId.current = id
      const url = await uploadLevelImage(id, file)
      await updateLevel(id, { title: title.trim(), publishAt: publish, imageUrl: url, status: 'draft' })
      nav(`/admin/levels/${id}`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen. Bitte erneut versuchen.') }
    finally { setBusy(false) }
  }
  return <form className="card card--pad" style={{ maxWidth: 600 }} onSubmit={e => { e.preventDefault(); void submit() }}>
    <p className="hunt-eyebrow">1 BILD · 2 FUNDSTELLEN · 3 TEST · 4 VERÖFFENTLICHEN</p><h2 className="h2">Ein neues Waldabenteuer</h2>
    <p className="studio-help">Lade das fertige Suchbild mit den versteckten Froggys hoch. Im nächsten Schritt markierst du ihre Positionen.</p>
    {error && <p className="studio-status" role="alert">{error}</p>}
    <div className="field"><label htmlFor="new-title">Titel</label><input id="new-title" className="input" maxLength={100} required value={title} onChange={e => setTitle(e.target.value)} /></div>
    <div className="field"><label htmlFor="new-date">Geplante Veröffentlichung · Europe/Berlin</label><input id="new-date" className="input" type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} /></div>
    <div className="field"><label htmlFor="new-image">Suchbild · JPG, PNG oder WebP · bis 12 MB</label><input id="new-image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
    <p className="studio-help">Bleibt zunächst ein Entwurf. Vor der Freigabe musst du alle Froggys im Test finden.</p>
    <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? 'Bild wird gespeichert …' : 'Entwurf anlegen & markieren'}</button>
  </form>
}
