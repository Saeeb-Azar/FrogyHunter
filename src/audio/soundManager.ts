import { useSettingsStore } from '../stores/settingsStore'
import { configureAudio, playSound as emit, playMusicLoop as loop } from './froggyAudio'
export { unlockAudio, disposeAudio } from './froggyAudio'
export type SoundId = 'tap' | 'found' | 'miss' | 'win' | 'ui' | 'start' | 'hint' | 'levelup'
export function playSound(id: SoundId) { configureAudio(useSettingsStore.getState()); emit(id) }
export function playMusicLoop(id: string) { configureAudio(useSettingsStore.getState()); return loop(id) }
useSettingsStore.subscribe(state => configureAudio(state))
