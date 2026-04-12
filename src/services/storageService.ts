import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, isFirebaseConfigured } from '../lib/firebase'

export async function uploadLevelImage(levelId: string, file: File): Promise<string> {
  if (!isFirebaseConfigured() || !getFirebaseStorage()) {
    return URL.createObjectURL(file)
  }
  const storage = getFirebaseStorage()!
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `levels/${levelId}/cover.${ext}`
  const r = ref(storage, path)
  await uploadBytes(r, file, { contentType: file.type || 'image/jpeg' })
  return getDownloadURL(r)
}
