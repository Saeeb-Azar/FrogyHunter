import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, isFirebaseConfigured } from '../lib/firebase'
import { checkDbError, supabase } from '../lib/supabase'

export async function uploadLevelImage(levelId: string, file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Bitte PNG, JPG oder WebP wählen.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Das Bild darf höchstens 12 MB groß sein.')
  if (supabase) {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${levelId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('level-images').upload(path, file, { contentType: file.type, upsert: false })
    checkDbError(error)
    return supabase.storage.from('level-images').getPublicUrl(path).data.publicUrl
  }
  if (!isFirebaseConfigured() || !getFirebaseStorage()) {
    if (file.size > 2 * 1024 * 1024) throw new Error('Im lokalen Demo Modus bitte ein Bild unter 2 MB verwenden. Für große Bilder einen Cloud Speicher konfigurieren.')
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Bild konnte nicht gelesen werden.'))
      reader.readAsDataURL(file)
    })
  }
  const storage = getFirebaseStorage()!
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `levels/${levelId}/${crypto.randomUUID()}.${ext}`
  const r = ref(storage, path)
  await uploadBytes(r, file, { contentType: file.type || 'image/jpeg' })
  return getDownloadURL(r)
}
