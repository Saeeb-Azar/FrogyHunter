import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '../types/models'

const defaults: UserSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  volume: 0.7,
  reduceMotion: false,
  theme: 'dark',
}

interface SettingsState extends UserSettings {
  setMusic: (v: boolean) => void
  setSfx: (v: boolean) => void
  setVolume: (v: number) => void
  setReduceMotion: (v: boolean) => void
  setTheme: (v: UserSettings['theme']) => void
  hydrateFromRemote: (s: Partial<UserSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setMusic: (musicEnabled) => set({ musicEnabled }),
      setSfx: (sfxEnabled) => set({ sfxEnabled }),
      setVolume: (volume) => set({ volume }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setTheme: (theme) => set({ theme }),
      hydrateFromRemote: (s) => set((prev) => ({ ...prev, ...s })),
    }),
    { name: 'froggy-settings-v1' }
  )
)
