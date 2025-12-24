import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Users from './pages/Users'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import Repairs from './pages/Repairs'
import Expenses from './pages/Expenses'
import Analysis from './pages/Analysis'
import './App.css'

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/purchases" />} />
          <Route path="users" element={user?.role === 'admin' ? <Users /> : <Navigate to="/" />} />
          <Route path="suppliers" element={user?.role === 'admin' ? <Suppliers /> : <Navigate to="/" />} />
          <Route path="purchases" element={user?.role === 'admin' ? <Purchases /> : <Navigate to="/" />} />
          <Route path="repairs" element={user?.role === 'admin' ? <Repairs /> : <Navigate to="/" />} />
          <Route path="expenses" element={user?.role === 'admin' ? <Expenses /> : <Navigate to="/" />} />
          <Route path="analysis" element={user?.role === 'admin' ? <Analysis /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

