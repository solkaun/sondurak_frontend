import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Parts = () => {
  const { user } = useAuth()
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    fetchParts()
  }, [])

  const fetchParts = async () => {
    try {
      const response = await api.get('/parts')
      setParts(response.data)
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/parts/${editingId}`, formData)
      } else {
        await api.post('/parts', formData)
      }
      fetchParts()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu parçayı silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/parts/${id}`)
      fetchParts()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    }
  }

  const openModal = (part = null) => {
    if (part) {
      setEditingId(part._id)
      setFormData({ name: part.name })
    } else {
      setEditingId(null)
      setFormData({ name: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-border-color border-t-primary-red rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Parçalar</h1>
        <button 
          className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
          onClick={() => openModal()}
        >
          + Yeni Parça
        </button>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Parça Adı</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Eklenme Tarihi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(part => (
                <tr key={part._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-3 py-2 text-xs text-primary-white font-semibold">{part.name}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">
                    {new Date(part.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      {user?.role === 'admin' && (
                        <>
                          <button 
                            className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95"
                            onClick={() => openModal(part)}
                          >
                            Düzenle
                          </button>
                          <button 
                            className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                            onClick={() => handleDelete(part._id)}
                          >
                            Sil
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {parts.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-3 py-6 text-center text-text-gray text-xs">
                    Henüz kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-lg font-bold text-secondary-white">
                {editingId ? 'Parça Düzenle' : 'Yeni Parça'}
              </h2>
              <button 
                className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Parça Adı</label>
                <input
                  type="text"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Alternatör, Enjektör, Sigorta..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
                <button 
                  type="button" 
                  className="flex-1 px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                  onClick={closeModal}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Parts

