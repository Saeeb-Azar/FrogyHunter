/**
 * Zentrale Sound-Hilfe: später echte Dateien unter src/assets/audio ablegen
 * und hier registrieren. Aktuell no-op, wenn keine Dateien vorhanden.
 */
import { useSettingsStore } from '../stores/settingsStore'

const cache = new Map<string, HTMLAudioElement>()

export type SoundId = 'tap' | 'found' | 'miss' | 'win' | 'ui'

const paths: Partial<Record<SoundId, string>> = {
  // Beispiel nach dem Ablegen von Dateien:
  // tap: new URL('../assets/audio/tap.mp3', import.meta.url).href,
}

function getVolume(): number {
  const { volume, sfxEnabled } = useSettingsStore.getState()
  return sfxEnabled ? Math.max(0, Math.min(1, volume)) : 0
}

export function playSound(id: SoundId) {
  const url = paths[id]
  if (!url) return
  let el = cache.get(url)
  if (!el) {
    el = new Audio(url)
    el.preload = 'auto'
    cache.set(url, el)
  }
  el.volume = getVolume()
  void el.play().catch(() => {})
}

export function playMusicLoop(_id: string) {
  const { musicEnabled } = useSettingsStore.getState()
  if (!musicEnabled) return () => {}
  // Platzhalter: bei importierter Musik-Datei Audio-Element loopen
  return () => {}
}
