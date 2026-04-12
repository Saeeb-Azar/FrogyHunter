import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminGuard } from './AdminGuard'
import { ProtectedLayout } from './ProtectedLayout'
import { AdminHomePage } from '../pages/admin/AdminHomePage'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { AdminLevelEditPage } from '../pages/admin/AdminLevelEditPage'
import { AdminLevelNewPage } from '../pages/admin/AdminLevelNewPage'
import { AdminLevelPreviewPage } from '../pages/admin/AdminLevelPreviewPage'
import { AdminLevelsPage } from '../pages/admin/AdminLevelsPage'
import { HistoryPage } from '../pages/HistoryPage'
import { InfoPage } from '../pages/InfoPage'
import { LobbyPage } from '../pages/LobbyPage'
import { LoginPage } from '../pages/LoginPage'
import { PlayPage } from '../pages/PlayPage'
import { SettingsPage } from '../pages/SettingsPage'

const baseUrl = import.meta.env.BASE_URL
const routerBasename =
  baseUrl === '/' ? undefined : baseUrl.replace(/\/$/, '')

export const router = createBrowserRouter(
  [
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <LobbyPage /> },
      { path: '/play', element: <PlayPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/info', element: <InfoPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminHomePage /> },
          { path: 'levels', element: <AdminLevelsPage /> },
          { path: 'levels/new', element: <AdminLevelNewPage /> },
          { path: 'levels/:id', element: <AdminLevelEditPage /> },
          { path: 'levels/:id/preview', element: <AdminLevelPreviewPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: routerBasename },
)
