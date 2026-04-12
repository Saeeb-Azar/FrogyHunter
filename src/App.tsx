import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes/AppRoutes'
import { useSettingsStore } from './stores/settingsStore'

function ThemeRoot() {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
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
