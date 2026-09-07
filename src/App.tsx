import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes/AppRoutes'
import { useSettingsStore } from './stores/settingsStore'
import { playMusicLoop, playSound, unlockAudio, disposeAudio } from './audio/soundManager'

function ThemeRoot() {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  const reduceMotion = useSettingsStore(s => s.reduceMotion)
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion)
  }, [reduceMotion])
  useEffect(() => {
    const unlock = () => unlockAudio()
    const click = (e: MouseEvent) => { if ((e.target as HTMLElement)?.closest('button, a')) playSound('tap') }
    document.addEventListener('pointerdown', unlock)
    document.addEventListener('keydown', unlock)
    document.addEventListener('click', click)
    const stop = playMusicLoop('forest')
    return () => { stop(); disposeAudio(); document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', unlock); document.removeEventListener('click', click) }
  }, [])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeRoot />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
