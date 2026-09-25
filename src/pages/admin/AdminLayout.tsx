import { Link, Outlet, useLocation } from 'react-router-dom'
import { GameStage } from '../../components/game-ui/GameStage'
import { WoodRoundButton } from '../../components/game-ui/WoodButton'

export function AdminLayout() {
  const { pathname } = useLocation()
  const homeActive = pathname === '/admin' || pathname === '/admin/'
  const newActive = pathname === '/admin/levels/new'
  const levelsActive = pathname.startsWith('/admin/levels') && !newActive
  const tab = (to: string, label: string, active: boolean) => (
    <Link to={to} className={`stone-btn stone-btn--wood stone-btn--sm${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
      <span className="stone-btn__face">{label}</span>
    </Link>
  )
  return (
    <GameStage scene="forest" wide>
      <div className="studio">
        <header className="screen-header">
          <WoodRoundButton icon="home" label="Zur Lobby" to="/" />
          <h1 className="plank-title"><span>LEVEL STUDIO</span></h1>
          <div className="screen-header__right" />
        </header>
        <nav className="studio-nav" aria-label="Admin Navigation">
          {tab('/admin', 'Übersicht', homeActive)}
          {tab('/admin/levels', 'Alle Level', levelsActive)}
          {tab('/admin/levels/new', '+ Neues Level', newActive)}
        </nav>
        <Outlet />
      </div>
    </GameStage>
  )
}
