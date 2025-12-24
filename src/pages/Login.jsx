import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-black to-secondary-black p-4">
      <div className="bg-secondary-black border border-border-color rounded-2xl p-6 w-full max-w-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:p-10 md:rounded-xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl font-extrabold text-primary-red mb-2 tracking-[2px] md:text-4xl md:tracking-[3px]">SON DURAK</h1>
          <p className="text-text-gray text-sm md:text-base">Oto Elektrik Takip Sistemi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-md bg-primary-red/10 border border-primary-red text-primary-red text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 text-secondary-white font-medium text-sm">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 md:p-3 bg-secondary-black border border-border-color rounded-md text-primary-white text-base focus:outline-none focus:border-primary-red placeholder:text-text-gray"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@sondurak.com"
            />
          </div>

          <div>
            <label className="block mb-2 text-secondary-white font-medium text-sm">Şifre</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 md:p-3 bg-secondary-black border border-border-color rounded-md text-primary-white text-base focus:outline-none focus:border-primary-red placeholder:text-text-gray"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 p-3 md:p-3 bg-primary-red text-primary-white rounded-md cursor-pointer text-base font-medium transition-all btn-touch hover:bg-primary-red-hover hover:-translate-y-0.5 active:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-3 border-border-color border-t-primary-red rounded-full animate-spin"></span>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

