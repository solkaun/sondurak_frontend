import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const CustomerVehicles = () => {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    brand: '',
    model: '',
    plate: '',
    year: new Date().getFullYear(),
    notes: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/customer-vehicles')
      setVehicles(response.data)
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
        await api.put(`/customer-vehicles/${editingId}`, formData)
      } else {
        await api.post('/customer-vehicles', formData)
      }
      fetchVehicles()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/customer-vehicles/${id}`)
      fetchVehicles()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    }
  }

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingId(vehicle._id)
      setFormData({
        customerName: vehicle.customerName,
        customerPhone: vehicle.customerPhone,
        brand: vehicle.brand,
        model: vehicle.model,
        plate: vehicle.plate,
        year: vehicle.year || new Date().getFullYear(),
        notes: vehicle.notes || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        customerName: '',
        customerPhone: '',
        brand: '',
        model: '',
        plate: '',
        year: new Date().getFullYear(),
        notes: ''
      })
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
        <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Müşteri Araçları</h1>
        <button 
          className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
          onClick={() => openModal()}
        >
          + Yeni Araç
        </button>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Müşteri</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Telefon</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Araç</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Plaka</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Yıl</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-3 py-2 text-xs text-primary-white font-semibold">{vehicle.customerName}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{vehicle.customerPhone}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{vehicle.brand} {vehicle.model}</td>
                  <td className="px-3 py-2 text-xs text-primary-red font-bold">{vehicle.plate}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{vehicle.year || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      <button 
                        className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95"
                        onClick={() => openModal(vehicle)}
                      >
                        {user?.role === 'admin' ? 'Düzenle' : 'Detay'}
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                          onClick={() => handleDelete(vehicle._id)}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-text-gray text-xs">
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
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-lg font-bold text-secondary-white">
                {editingId ? (user?.role === 'admin' ? 'Araç Düzenle' : 'Araç Detayı') : 'Yeni Araç'}
              </h2>
              <button 
                className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Müşteri Adı</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Müşteri Telefon</label>
                  <input
                    type="tel"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Marka</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Model</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Plaka</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red uppercase"
                    value={formData.plate}
                    onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    disabled={editingId && user?.role !== 'admin'}
                    placeholder="34ABC123"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Yıl</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    disabled={editingId && user?.role !== 'admin'}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Notlar (Opsiyonel)</label>
                <textarea
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  disabled={editingId && user?.role !== 'admin'}
                  rows="3"
                  placeholder="Araç hakkında notlar..."
                />
              </div>

              {(!editingId || user?.role === 'admin') && (
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
              )}

              {editingId && user?.role !== 'admin' && (
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    className="flex-1 px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                    onClick={closeModal}
                  >
                    Kapat
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerVehicles

