import { useAuth } from '../../contexts/AuthContext'

export function UserBar() {
  const { user, demoMode, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="user-bar">
      <div className="user-bar__who">
        {user.photoURL ? (
          <img className="user-bar__avatar" src={user.photoURL} alt="" />
        ) : (
          <div className="user-bar__avatar user-bar__avatar--placeholder" aria-hidden>
            🐸
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div className="user-bar__name">{user.displayName ?? 'Spieler'}</div>
          <div className="user-bar__meta">{user.email ?? user.uid}</div>
        </div>
      </div>
      <div className="user-bar__actions">
        {demoMode && <span className="badge badge--warn">Demo</span>}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => void signOut()}>
          Abmelden
        </button>
      </div>
    </div>
  )
}
