import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { token, ...userData } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    
    return response.data
  }

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData)
    const { token, ...user } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    
    return response.data
  }

  const logout = async () => {
    try {
      // Backend'e logout isteği gönder (token'ı blacklist'e ekler)
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout hatası:', error)
    } finally {
      // Her durumda local storage temizle
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

