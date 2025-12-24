import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const CustomerVehicles = () => {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [vehicleHistory, setVehicleHistory] = useState(null)
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
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return
    setSubmitting(true)
    try {
      await api.delete(`/customer-vehicles/${id}`)
      fetchVehicles()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    } finally {
      setSubmitting(false)
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

  const viewHistory = async (vehicleId) => {
    setLoadingHistory(true)
    try {
      const response = await api.get(`/customer-vehicles/${vehicleId}/history`)
      setVehicleHistory(response.data)
      setShowHistoryModal(true)
    } catch (error) {
      alert(error.response?.data?.message || 'Geçmiş yüklenemedi')
    } finally {
      setLoadingHistory(false)
    }
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
    setVehicleHistory(null)
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
                        className="px-2.5 py-1 bg-green-600 text-primary-white rounded text-xs transition-all btn-touch hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => viewHistory(vehicle._id)}
                        disabled={loadingHistory || submitting}
                      >
                        {loadingHistory ? (
                          <span className="flex items-center justify-center gap-1">
                            <span className="inline-block w-3 h-3 border-2 border-green-300 border-t-white rounded-full animate-spin"></span>
                          </span>
                        ) : (
                          'Geçmiş'
                        )}
                      </button>
                      <button 
                        className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-50"
                        onClick={() => openModal(vehicle)}
                        disabled={submitting}
                      >
                        {user?.role === 'admin' ? 'Düzenle' : 'Detay'}
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(vehicle._id)}
                          disabled={submitting}
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
                    className="flex-1 px-4 py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-border-color border-t-primary-white rounded-full animate-spin"></span>
                        <span>{editingId ? 'Güncelleniyor...' : 'Kaydediliyor...'}</span>
                      </span>
                    ) : (
                      editingId ? 'Güncelle' : 'Kaydet'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-50"
                    onClick={closeModal}
                    disabled={submitting}
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

      {/* Araç Geçmişi Modal */}
      {showHistoryModal && vehicleHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeHistoryModal}>
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <div>
                <h2 className="text-lg font-bold text-secondary-white">
                  Araç Geçmişi: {vehicleHistory.vehicle.plate}
                </h2>
                <p className="text-xs text-text-gray mt-1">
                  {vehicleHistory.vehicle.brand} {vehicleHistory.vehicle.model} - {vehicleHistory.vehicle.customerName}
                </p>
              </div>
              <button 
                className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                onClick={closeHistoryModal}
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              {/* Özet Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-primary-black p-4 rounded-lg border border-border-color">
                  <div className="text-text-gray text-xs mb-1">Toplam Tamir</div>
                  <div className="text-xl font-bold text-primary-white">{vehicleHistory.totalRepairs}</div>
                </div>
                <div className="bg-primary-black p-4 rounded-lg border border-border-color">
                  <div className="text-text-gray text-xs mb-1">Toplam Harcama</div>
                  <div className="text-xl font-bold text-primary-red">{vehicleHistory.totalCost.toFixed(2)} ₺</div>
                </div>
              </div>

              {/* Tamir Geçmişi */}
              <h3 className="text-sm font-semibold text-secondary-white mb-3">Tamir Kayıtları</h3>
              
              {vehicleHistory.repairs.length === 0 ? (
                <div className="text-center text-text-gray text-xs py-8">
                  Bu araç için henüz tamir kaydı yok
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleHistory.repairs.map(repair => (
                    <div key={repair._id} className="bg-primary-black p-4 rounded-lg border border-border-color">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs text-text-gray">
                            {new Date(repair.date).toLocaleDateString('tr-TR')}
                          </div>
                          {repair.currentKm && (
                            <div className="text-xs text-text-gray">
                              KM: {repair.currentKm.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-primary-red">
                          {repair.totalCost.toFixed(2)} ₺
                        </div>
                      </div>

                      {repair.currentIssues && (
                        <div className="mb-2">
                          <div className="text-xs text-text-gray">Arızalar:</div>
                          <div className="text-xs text-primary-white">{repair.currentIssues}</div>
                        </div>
                      )}

                      <div className="mb-2">
                        <div className="text-xs text-text-gray">Yapılan İşlem:</div>
                        <div className="text-xs text-primary-white">{repair.description}</div>
                      </div>

                      {repair.parts && repair.parts.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-text-gray mb-1">Kullanılan Parçalar:</div>
                          <div className="space-y-1">
                            {repair.parts.map((p, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-primary-white bg-secondary-black p-2 rounded">
                                <span>{p.part.name} x{p.quantity}</span>
                                <span className="text-primary-red">{(p.quantity * p.price).toFixed(2)} ₺</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-xs pt-2 border-t border-border-color">
                        <span className="text-text-gray">İşçilik: {repair.laborCost.toFixed(2)} ₺</span>
                        <span className="text-text-gray">Parça: {repair.partsCost.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-4 mt-4 border-t border-border-color">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                  onClick={closeHistoryModal}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerVehicles

