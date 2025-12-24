import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = () => {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 pb-20 bg-primary-black min-h-screen lg:ml-[280px] lg:p-8 lg:pb-8">
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-4 bg-secondary-black border-b border-border-color sticky top-0 z-50 -m-4 mb-4 lg:hidden">
          <h1 className="text-2xl font-extrabold text-primary-red tracking-wide">SON DURAK</h1>
        </div>
        <Outlet />
      </main>

      {/* Mobile: Bottom Navigation, Desktop: Left Sidebar */}
      <nav className="w-full bg-secondary-black border-t border-border-color flex flex-row fixed bottom-0 left-0 z-[100] overflow-x-auto lg:w-[280px] lg:border-t-0 lg:border-r lg:flex-col lg:fixed lg:h-screen lg:bottom-auto lg:top-0">
        {/* Desktop Sidebar Header */}
        <div className="hidden lg:block p-8 pt-8 pb-6 border-b border-border-color bg-gradient-to-br from-primary-black to-secondary-black">
          <h1 className="text-3xl font-extrabold text-primary-red mb-1 tracking-[2px]">SON DURAK</h1>
          <p className="text-sm text-text-gray tracking-wide">Oto Elektrik</p>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-row gap-0 overflow-x-auto scrollbar-none lg:flex-col lg:flex-1 lg:py-4 lg:overflow-y-auto">
          {/* Tüm kullanıcılar */}
          <NavLink 
            to="/purchases" 
            className={({ isActive }) => `
              flex flex-col items-center justify-center p-3 px-4 text-secondary-white no-underline transition-all text-xs border-b-[3px] border-transparent whitespace-nowrap min-w-[80px] text-center gap-1
              lg:flex-row lg:p-4 lg:px-6 lg:text-base lg:border-b-0 lg:border-l-[3px] lg:min-w-0 lg:text-left lg:gap-2
              ${isActive ? 'bg-primary-black text-primary-red border-primary-red font-semibold' : 'hover:bg-primary-black hover:text-primary-white hover:border-primary-red lg:hover:border-primary-red'}
            `}
          >
            <span>📦</span>
            <span>Satın Alım</span>
          </NavLink>
          
          {/* Sadece admin */}
          {user?.role === 'admin' && (
            <>
              <NavLink 
                to="/repairs"
                className={({ isActive }) => `
                  flex flex-col items-center justify-center p-3 px-4 text-secondary-white no-underline transition-all text-xs border-b-[3px] border-transparent whitespace-nowrap min-w-[80px] text-center gap-1
                  lg:flex-row lg:p-4 lg:px-6 lg:text-base lg:border-b-0 lg:border-l-[3px] lg:min-w-0 lg:text-left lg:gap-2
                  ${isActive ? 'bg-primary-black text-primary-red border-primary-red font-semibold' : 'hover:bg-primary-black hover:text-primary-white hover:border-primary-red lg:hover:border-primary-red'}
                `}
              >
                <span>🔧</span>
                <span>Tamir</span>
              </NavLink>
              <NavLink 
                to="/expenses"
                className={({ isActive }) => `
                  flex flex-col items-center justify-center p-3 px-4 text-secondary-white no-underline transition-all text-xs border-b-[3px] border-transparent whitespace-nowrap min-w-[80px] text-center gap-1
                  lg:flex-row lg:p-4 lg:px-6 lg:text-base lg:border-b-0 lg:border-l-[3px] lg:min-w-0 lg:text-left lg:gap-2
                  ${isActive ? 'bg-primary-black text-primary-red border-primary-red font-semibold' : 'hover:bg-primary-black hover:text-primary-white hover:border-primary-red lg:hover:border-primary-red'}
                `}
              >
                <span>💰</span>
                <span>Giderler</span>
              </NavLink>
              <NavLink 
                to="/suppliers"
                className={({ isActive }) => `
                  flex flex-col items-center justify-center p-3 px-4 text-secondary-white no-underline transition-all text-xs border-b-[3px] border-transparent whitespace-nowrap min-w-[80px] text-center gap-1
                  lg:flex-row lg:p-4 lg:px-6 lg:text-base lg:border-b-0 lg:border-l-[3px] lg:min-w-0 lg:text-left lg:gap-2
                  ${isActive ? 'bg-primary-black text-primary-red border-primary-red font-semibold' : 'hover:bg-primary-black hover:text-primary-white hover:border-primary-red lg:hover:border-primary-red'}
                `}
              >
                <span>🏪</span>
                <span>Parçacılar</span>
              </NavLink>
              <NavLink 
                to="/users"
                className={({ isActive }) => `
                  flex flex-col items-center justify-center p-3 px-4 text-secondary-white no-underline transition-all text-xs border-b-[3px] border-transparent whitespace-nowrap min-w-[80px] text-center gap-1
                  lg:flex-row lg:p-4 lg:px-6 lg:text-base lg:border-b-0 lg:border-l-[3px] lg:min-w-0 lg:text-left lg:gap-2
                  ${isActive ? 'bg-primary-black text-primary-red border-primary-red font-semibold' : 'hover:bg-primary-black hover:text-primary-white hover:border-primary-red lg:hover:border-primary-red'}
                `}
              >
                <span>👥</span>
                <span>Kullanıcılar</span>
              </NavLink>
              <NavLink 
                to="/analysis"
                className={({ isActive }) => `
                  flex flex-col items-center justify-center p-3 px-4 text-secondary-white no-underline transition-all text-xs border-b-[3px] border-transparent whitespace-nowrap min-w-[80px] text-center gap-1
                  lg:flex-row lg:p-4 lg:px-6 lg:text-base lg:border-b-0 lg:border-l-[3px] lg:min-w-0 lg:text-left lg:gap-2
                  ${isActive ? 'bg-primary-black text-primary-red border-primary-red font-semibold' : 'hover:bg-primary-black hover:text-primary-white hover:border-primary-red lg:hover:border-primary-red'}
                `}
              >
                <span>📊</span>
                <span>Analiz</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="flex items-center p-3 px-4 border-l border-border-color bg-primary-black min-w-[80px] lg:block lg:p-6 lg:border-l-0 lg:border-t lg:min-w-0">
          <div className="hidden lg:block mb-4">
            <p className="font-semibold text-primary-white mb-0.5">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-text-gray">{user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}</p>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 p-2 bg-transparent text-primary-red border border-primary-red rounded-md cursor-pointer text-xs font-medium transition-all btn-touch hover:bg-primary-red hover:text-primary-white active:bg-primary-red active:text-primary-white active:scale-95 lg:p-3 lg:text-base"
          >
            <span>🚪</span>
            <span>Çıkış</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Layout

