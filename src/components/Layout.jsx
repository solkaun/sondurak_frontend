import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">SON DURAK</h1>
          <p className="logo-subtitle">Oto Elektrik</p>
        </div>
        
        <div className="nav-links">
          {user?.role === 'admin' && (
            <>
              <NavLink to="/purchases" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                📦 Parça Satın Alımları
              </NavLink>
              <NavLink to="/repairs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                🔧 Tamir Edilen Araçlar
              </NavLink>
              <NavLink to="/expenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                💰 Dükkan Giderleri
              </NavLink>
              <NavLink to="/suppliers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                🏪 Parçacılar
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                👥 Kullanıcılar
              </NavLink>
              <NavLink to="/analysis" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                📊 Analiz
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
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

