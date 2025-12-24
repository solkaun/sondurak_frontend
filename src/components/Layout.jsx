import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()

  return (
    <div className="layout">
      <main className="main-content">
        <div className="mobile-header">
          <h1 className="mobile-logo">SON DURAK</h1>
        </div>
        <Outlet />
      </main>

      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">SON DURAK</h1>
          <p className="logo-subtitle">Oto Elektrik</p>
        </div>
        
        <div className="nav-links">
          {/* Tüm kullanıcılar erişebilir */}
          <NavLink to="/purchases" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span>📦</span>
            <span>Satın Alım</span>
          </NavLink>
          
          {/* Sadece admin erişebilir */}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/repairs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span>🔧</span>
                <span>Tamir</span>
              </NavLink>
              <NavLink to="/expenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span>💰</span>
                <span>Giderler</span>
              </NavLink>
              <NavLink to="/suppliers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span>🏪</span>
                <span>Parçacılar</span>
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span>👥</span>
                <span>Kullanıcılar</span>
              </NavLink>
              <NavLink to="/analysis" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span>📊</span>
                <span>Analiz</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">{user?.firstName} {user?.lastName}</p>
            <p className="user-role">{user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}</p>
          </div>
          <button onClick={logout} className="btn btn-danger btn-block">
            <span>🚪</span>
            <span>Çıkış</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Layout

