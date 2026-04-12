import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLevelDraft, updateLevel } from '../../services/levelsService'
import { uploadLevelImage } from '../../services/storageService'
import type { LevelStatus } from '../../types/models'

export function AdminLevelNewPage() {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [publishAt, setPublishAt] = useState('')
  const [status, setStatus] = useState<LevelStatus>('draft')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    if (!title.trim()) {
      setErr('Bitte Titel angeben.')
      return
    }
    if (!file) {
      setErr('Bitte ein Bild wählen.')
      return
    }
    setBusy(true)
    try {
      const pub = publishAt ? new Date(publishAt).getTime() : null
      const id = await createLevelDraft({
        title: title.trim(),
        imageUrl: '',
        publishAt: pub,
        status,
      })
      const url = await uploadLevelImage(id, file)
      await updateLevel(id, { imageUrl: url })
      nav(`/admin/levels/${id}`)
    } catch {
      setErr('Speichern fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card card--pad" style={{ maxWidth: 520 }}>
      <h2 className="h2" style={{ marginTop: 0 }}>
        Neues Level
      </h2>
      {err && (
        <p style={{ color: 'var(--danger)' }} role="alert">
          {err}
        </p>
      )}
      <div className="field">
        <label htmlFor="t">Titel</label>
        <input id="t" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="p">Veröffentlichungsdatum</label>
        <input id="p" className="input" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="s">Status</label>
        <select id="s" className="select" value={status} onChange={(e) => setStatus(e.target.value as LevelStatus)}>
          <option value="draft">Entwurf</option>
          <option value="published">Veröffentlicht</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f">Bild</label>
        <input id="f" type="file" accept="image/*" className="input" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <button type="button" className="btn btn--primary" disabled={busy} onClick={() => void submit()}>
        {busy ? 'Lädt…' : 'Erstellen & weiter'}
      </button>
    </div>
  )
}
