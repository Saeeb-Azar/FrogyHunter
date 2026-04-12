import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'

export function AdminLayout() {
  const { pathname } = useLocation()

  const homeActive = pathname === '/admin' || pathname === '/admin/'
  const newActive = pathname === '/admin/levels/new'
  const levelsActive =
    pathname.startsWith('/admin/levels') && !newActive

  return (
    <AppLayout showBack backTo="/">
      <header className="admin-shell">
        <h1 className="admin-shell__title">Admin</h1>
        <p className="admin-shell__lead">Level, Medien und Fundstellen verwalten – klar strukturiert, ohne Spiel-FX.</p>
      </header>
      <nav className="admin-nav" aria-label="Admin Navigation">
        <NavLink
          to="/admin"
          end
          className={() => `admin-nav__link${homeActive ? ' admin-nav__link--active' : ''}`}
        >
          Übersicht
        </NavLink>
        <NavLink
          to="/admin/levels"
          className={() => `admin-nav__link${levelsActive ? ' admin-nav__link--active' : ''}`}
        >
          Level
        </NavLink>
        <NavLink
          to="/admin/levels/new"
          className={() => `admin-nav__link${newActive ? ' admin-nav__link--active' : ''}`}
        >
          Neu
        </NavLink>
      </nav>
      <Outlet />
    </AppLayout>
  )
}
