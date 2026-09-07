import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkerEditor } from '../../components/admin/MarkerEditor'
import { getLevel, updateLevel } from '../../services/levelsService'
import { getMarkers, saveMarkers } from '../../services/markersService'
import { uploadLevelImage } from '../../services/storageService'
import { levelSignature, berlinInput, parseBerlinInput } from '../../lib/levelValidation'
import { validateMarkers } from '../../lib/gameRules'
import type { FrogMarker, Level } from '../../types/models'
export function AdminLevelEditPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [markers, setMarkers] = useState<FrogMarker[]>([])
  const [title, setTitle] = useState('')
  const [publishAt, setPublishAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    if (!id) return
    let active = true
    void Promise.all([getLevel(id), getMarkers(id)]).then(([l, m]) => {
      if (!active || !l) return
      setLevel(l); setTitle(l.title); setPublishAt(berlinInput(l.publishAt)); setMarkers(m)
    }).catch(() => { if (active) setMsg('Level konnte nicht geladen werden.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const locked = level?.status === 'published'
  async function save(preview = false) {
    if (!id || !level || saving) return
    setSaving(true); setMsg(null)
    try {
      if (!title.trim()) throw new Error('Bitte einen Titel angeben.')
      if (!validateMarkers(markers)) throw new Error('Bitte 1 bis 50 gültige Fundstellen markieren.')
      const signature = await levelSignature(level.imageUrl, markers)
      if (!locked) {
        await saveMarkers(id, markers)
        const patch = { title: title.trim(), frogCount: markers.length, publishAt: parseBerlinInput(publishAt), testedSignature: level.testedSignature === signature ? signature : null }
        await updateLevel(id, patch)
        setLevel({ ...level, ...patch })
      }
      setDirty(false); setMsg('Entwurf und Fundstellen gespeichert.')
      if (preview) nav(`/admin/levels/${id}/preview`)
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.') }
    finally { setSaving(false) }
  }
  async function publish() {
    if (!id || !level || dirty || locked) return
    setSaving(true); setMsg(null)
    try {
      const [fresh, savedMarkers] = await Promise.all([getLevel(id), getMarkers(id)])
      if (!fresh || !validateMarkers(savedMarkers) || fresh.testedSignature !== await levelSignature(fresh.imageUrl, savedMarkers)) throw new Error('Bitte erst speichern und alle Froggys im Test finden.')
      const when = fresh.publishAt ?? Date.now()
      await updateLevel(id, { status: 'published', publishAt: when })
      setLevel({ ...fresh, status: 'published', publishAt: when })
      setMsg(when > Date.now() ? 'Geplant! Dieses Level wird zum gewählten Zeitpunkt automatisch spielbar.' : 'Veröffentlicht! Das Level ist jetzt spielbar.')
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Freigabe fehlgeschlagen.') }
    finally { setSaving(false) }
  }
  async function replaceImage(file: File) {
    if (!id || locked) return
    setSaving(true)
    try {
      const url = await uploadLevelImage(id, file)
      await saveMarkers(id, [])
      await updateLevel(id, { imageUrl: url, testedSignature: null, frogCount: 0 })
      setLevel(l => l ? { ...l, imageUrl: url, testedSignature: null, frogCount: 0 } : null)
      setMarkers([]); setDirty(true); setMsg('Neues Bild gespeichert. Bitte die Froggys neu markieren.')
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Upload fehlgeschlagen.') }
    finally { setSaving(false) }
  }
  if (loading) return <div className="spinner" />
  if (!id || !level) return <p role="alert">{msg ?? 'Level nicht gefunden.'} <Link to="/admin/levels">Zur Übersicht</Link></p>
  return <div>
    <h2 className="h2">{level.title}</h2><p className="studio-help">{locked ? 'Freigegeben. Suchbild und Fundstellen sind gesperrt, damit bestehende Ergebnisse gültig bleiben.' : 'Klicke jeden versteckten Froggy an. Passe seinen Trefferbereich an und teste dein Level.'}</p>
    {msg && <p className="studio-status" role="status">{msg}</p>}
    <div className="card card--pad">
      <div className="field"><label htmlFor="edit-title">Titel</label><input id="edit-title" className="input" value={title} maxLength={100} disabled={locked || saving} onChange={e => { setTitle(e.target.value); setDirty(true) }} /></div>
      <div className="field"><label htmlFor="edit-date">Veröffentlichung · Europe/Berlin</label><input id="edit-date" className="input" type="datetime-local" value={publishAt} disabled={locked || saving} onChange={e => { setPublishAt(e.target.value); setDirty(true) }} /></div>
      {!locked && <div className="field"><label htmlFor="replace-image">Suchbild ersetzen (setzt Fundstellen zurück)</label><input id="replace-image" type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={e => { const file = e.target.files?.[0]; if (file && confirm('Bild ersetzen und alle bisherigen Fundstellen dieses Entwurfs entfernen?')) void replaceImage(file) }} /></div>}
    </div>
    {level.imageUrl && <div inert={locked || saving}><MarkerEditor imageUrl={level.imageUrl} markers={markers} onChange={next => { setMarkers(next); setDirty(true) }} /></div>}
    <div className="studio-toolbar">
      {!locked && <button className="btn btn--ghost" disabled={saving} onClick={() => void save()}>Entwurf speichern</button>}
      <button className="btn btn--primary" disabled={saving || !markers.length} onClick={() => void save(true)}>{locked ? 'Level testen' : 'Speichern & Level testen'}</button>
      {!locked && <button className="btn btn--primary" disabled={saving || dirty || !level.testedSignature} onClick={() => void publish()}>{level.publishAt && level.publishAt > Date.now() ? 'Veröffentlichung planen' : 'Jetzt veröffentlichen'}</button>}
    </div>
    <p className="studio-help">{dirty ? 'Ungespeicherte Änderungen. Bitte speichern und erneut testen.' : level.testedSignature ? '✓ Spieltest bestanden.' : 'Die Freigabe wird nach einem vollständigen Spieltest aktiviert.'}</p>
  </div>
}
