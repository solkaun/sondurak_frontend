import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const Repairs = () => {
  const isFirstRender = useRef(true)
  const [repairs, setRepairs] = useState([])
  const [parts, setParts] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchPart, setSearchPart] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8
  })
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerVehicle: '',
    currentKm: '',
    currentIssues: '',
    isOilChange: false,
    nextOilChangeKm: '',
    description: '',
    parts: [],
    laborCost: 0
  })
  const [tempPart, setTempPart] = useState({ part: '', quantity: 1, price: 0 })

  useEffect(() => {
    if (isFirstRender.current) {
      return
    }
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      const timer = setTimeout(() => {
        setLoading(true)
        fetchData()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
    setLoading(true)
    fetchData()
  }, [currentPage])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 8);

      const queryString = params.toString();

      const [repairsRes, partsRes, vehiclesRes] = await Promise.all([
        api.get(`/repairs?${queryString}`),
        api.get('/parts?limit=1000'),
        api.get('/customer-vehicles?limit=1000')
      ])
      setRepairs(repairsRes.data.repairs)
      setPagination(repairsRes.data.pagination)
      setParts(partsRes.data.parts || partsRes.data)
      setVehicles(vehiclesRes.data.vehicles || vehiclesRes.data)
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId)
    setFormData({
      ...formData,
      customerVehicle: vehicleId
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/repairs/${editingId}`, formData)
      } else {
        await api.post('/repairs', formData)
      }
      fetchData()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    setSubmitting(true)
    try {
      await api.delete(`/repairs/${id}`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentReceived = async (id) => {
    if (!confirm('Ödeme alındı olarak işaretlenecek. Bu işlem geri alınamaz!')) return
    
    setSubmitting(true)
    try {
      await api.patch(`/repairs/${id}/payment`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Ödeme durumu güncellenemedi')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePartSelect = (partId) => {
    const selectedPart = parts.find(p => p._id === partId)
    if (selectedPart) {
      setTempPart({ 
        ...tempPart, 
        part: partId,
        price: selectedPart.lastPrice || 0
      })
      setSearchPart(selectedPart.name)
    }
  }

  const addPart = () => {
    if (!tempPart.part) {
      alert('Parça seçiniz')
      return
    }
    setFormData({
      ...formData,
      parts: [...formData.parts, tempPart]
    })
    setTempPart({ part: '', quantity: 1, price: 0 })
    setSearchPart('')
  }

  const removePart = (index) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index)
    })
  }

  const openModal = (repair = null) => {
    if (repair) {
      setEditingId(repair._id)
      setSelectedVehicle(repair.customerVehicle?._id || '')
      setFormData({
        date: repair.date.split('T')[0],
        customerVehicle: repair.customerVehicle?._id || '',
        currentKm: repair.currentKm || '',
        currentIssues: repair.currentIssues || '',
        isOilChange: repair.isOilChange || false,
        nextOilChangeKm: repair.nextOilChangeKm || '',
        description: repair.description,
        parts: repair.parts.map(p => ({
          part: p.part?._id,
          quantity: p.quantity,
          price: p.price
        })),
        laborCost: repair.laborCost
      })
    } else {
      setEditingId(null)
      setSelectedVehicle('')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerVehicle: '',
        currentKm: '',
        currentIssues: '',
        isOilChange: false,
        nextOilChangeKm: '',
        description: '',
        parts: [],
        laborCost: 0
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setSelectedVehicle('')
    setSearchPart('')
    setTempPart({ part: '', quantity: 1, price: 0 })
  }

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchPart.toLowerCase())
  )

  const getTotalPartsCost = () => {
    return formData.parts.reduce((sum, p) => sum + (p.quantity * p.price), 0)
  }

  const getTotalCost = () => {
    return getTotalPartsCost() + parseFloat(formData.laborCost || 0)
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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Tamir Edilen Araçlar</h1>
          <button 
            className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
            onClick={() => openModal()}
          >
            + Yeni Tamir Kaydı
          </button>
        </div>

        {/* Arama */}
        <div className="bg-secondary-black border border-border-color rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block mb-1.5 text-secondary-white font-medium text-xs">🔍 Ara</label>
              <input
                type="text"
                className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Müşteri, plaka, araç veya açıklama ara..."
              />
            </div>
            {searchQuery && (
              <div className="flex items-end">
                <button
                  className="w-full sm:w-auto px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                  onClick={clearSearch}
                >
                  ✖ Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Tarih</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Müşteri</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Araç</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Plaka</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Açıklama</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">İşçilik</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Parça</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Toplam</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Ödeme</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(repair => (
                <tr key={repair._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-3 py-2 text-xs text-primary-white">{new Date(repair.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">
                    {repair.customerVehicle?.customerName || '-'}
                  </td>
                  <td className="px-3 py-2 text-xs text-primary-white">
                    {repair.customerVehicle ? `${repair.customerVehicle.brand} ${repair.customerVehicle.model}` : `${repair.brand} ${repair.model}`}
                  </td>
                  <td className="px-3 py-2 text-xs text-primary-red font-bold">
                    {repair.customerVehicle?.plate || repair.plate}
                  </td>
                  <td className="px-3 py-2 text-xs text-primary-white">{repair.description}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{repair.laborCost.toFixed(2)} ₺</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{repair.partsCost.toFixed(2)} ₺</td>
                  <td className="px-3 py-2 text-xs text-primary-red font-bold">{repair.totalCost.toFixed(2)} ₺</td>
                  <td className="px-3 py-2 text-xs">
                    {repair.isPaid ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-green-600 text-primary-white rounded text-xs font-semibold">
                          ✓ Alındı
                        </span>
                        {repair.paidAt && (
                          <span className="text-text-gray text-xs">
                            {new Date(repair.paidAt).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        className="px-2.5 py-1 bg-yellow-600 text-primary-white rounded text-xs transition-all btn-touch hover:bg-yellow-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        onClick={() => handlePaymentReceived(repair._id)}
                        disabled={submitting}
                        title="Ödeme Alındı olarak işaretle"
                      >
                        💰 Tahsil Et
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      <button 
                        className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-50"
                        onClick={() => openModal(repair)}
                        disabled={submitting}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDelete(repair._id)}
                        disabled={submitting}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {repairs.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-3 py-6 text-center text-text-gray text-xs">
                    {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz kayıt yok'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary-black border border-border-color rounded-lg p-4">
          <div className="text-sm text-secondary-white">
            Toplam <span className="font-semibold text-primary-red">{pagination.totalItems}</span> kayıt
            <span className="ml-2 text-text-gray">
              (Sayfa {pagination.currentPage}/{pagination.totalPages})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 bg-border-color text-primary-white rounded text-xs font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              « İlk
            </button>
            <button
              className="px-3 py-1.5 bg-border-color text-primary-white rounded text-xs font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Önceki
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all btn-touch ${
                        currentPage === pageNum
                          ? 'bg-primary-red text-primary-white'
                          : 'bg-border-color text-primary-white hover:bg-text-gray active:scale-95'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="text-text-gray px-1">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>

            <button
              className="px-3 py-1.5 bg-border-color text-primary-white rounded text-xs font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Sonraki ›
            </button>
            <button
              className="px-3 py-1.5 bg-border-color text-primary-white rounded text-xs font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages}
            >
              Son »
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-xl font-bold text-secondary-white">
                {editingId ? 'Tamir Düzenle' : 'Yeni Tamir'}
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
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Tarih</label>
                <input
                  type="date"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">
                  Müşteri Aracı Seç <span className="text-primary-red">*</span>
                </label>
                <select
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={selectedVehicle}
                  onChange={e => handleVehicleSelect(e.target.value)}
                  required
                >
                  <option value="">Araç Seçiniz</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model} ({vehicle.customerName})
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="text-xs text-text-gray mt-1">
                    Henüz müşteri aracı yok. Önce "Müşteri Araçları" sayfasından araç ekleyin.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">
                    Mevcut KM <span className="text-text-gray">(Opsiyonel)</span>
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.currentKm}
                    onChange={e => setFormData({ ...formData, currentKm: e.target.value })}
                    placeholder="Örn: 125000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">
                    Mevcut Arızalar <span className="text-text-gray">(Opsiyonel)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.currentIssues}
                    onChange={e => setFormData({ ...formData, currentIssues: e.target.value })}
                    placeholder="Örn: Motor ısınması, fren sesi"
                  />
                </div>
              </div>

              {/* Yağ Bakımı */}
              <div className="bg-primary-black border border-border-color rounded-md p-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="isOilChange"
                    className="w-4 h-4 accent-primary-red cursor-pointer"
                    checked={formData.isOilChange}
                    onChange={e => setFormData({ 
                      ...formData, 
                      isOilChange: e.target.checked,
                      nextOilChangeKm: e.target.checked ? formData.nextOilChangeKm : ''
                    })}
                  />
                  <label htmlFor="isOilChange" className="text-secondary-white font-medium text-sm cursor-pointer select-none">
                    🛢️ Yağ Bakımı Yapıldı
                  </label>
                </div>

                {formData.isOilChange && (
                  <div>
                    <label className="block mb-1.5 text-secondary-white font-medium text-xs">
                      Gelecek Yağ Bakımı KM <span className="text-text-gray">(Opsiyonel)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 bg-secondary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                      value={formData.nextOilChangeKm}
                      onChange={e => setFormData({ ...formData, nextOilChangeKm: e.target.value })}
                      placeholder="Örn: 135000"
                      min="0"
                    />
                    <p className="text-xs text-text-gray mt-1">
                      💡 İpucu: Mevcut KM + 10,000 KM
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Yapılan İşlem Açıklaması</label>
                <textarea
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Yapılan tamir işleminin detaylı açıklaması..."
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Takılan Parçalar</label>
                <div className="space-y-2 mb-4">
                  {formData.parts.map((p, index) => {
                    const partData = parts.find(part => part._id === p.part)
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-primary-black border border-border-color rounded-md">
                        <div className="flex-1">
                          <span className="text-primary-white">{partData?.name}</span>
                          <span className="text-text-gray ml-4">{p.quantity} adet</span>
                          <span className="text-primary-red ml-4 font-semibold">{(p.quantity * p.price).toFixed(2)} ₺</span>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-primary-red text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                          onClick={() => removePart(index)}
                        >
                          Sil
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="relative md:col-span-2">
                    <label className="block mb-1.5 text-secondary-white font-medium text-xs">Parça</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                      value={searchPart}
                      onChange={e => setSearchPart(e.target.value)}
                      placeholder="Parça ara..."
                    />
                    {searchPart && filteredParts.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-primary-black border border-border-color rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredParts.slice(0, 5).map(part => (
                          <div
                            key={part._id}
                            className="px-3 py-2 text-primary-white text-sm hover:bg-secondary-black cursor-pointer transition-colors"
                            onClick={() => handlePartSelect(part._id)}
                          >
                            <div className="flex justify-between items-center">
                              <span>{part.name}</span>
                              {part.lastPrice > 0 && (
                                <span className="text-xs text-primary-red">{part.lastPrice.toFixed(2)} ₺</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 text-secondary-white font-medium text-xs">Adet</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                      value={tempPart.quantity}
                      onChange={e => setTempPart({ ...tempPart, quantity: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-secondary-white font-medium text-xs">
                      Fiyat <span className="text-text-gray">(Son alım)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                      value={tempPart.price}
                      onChange={e => setTempPart({ ...tempPart, price: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <button 
                    type="button" 
                    className="px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 h-fit self-end"
                    onClick={addPart}
                  >
                    Ekle
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">İşçilik Ücreti (₺)</label>
                <input
                  type="number"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.laborCost}
                  onChange={e => setFormData({ ...formData, laborCost: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-secondary-white font-medium text-sm">Parça Toplam</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white font-semibold opacity-75 cursor-not-allowed"
                    value={`${getTotalPartsCost().toFixed(2)} ₺`}
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-2 text-secondary-white font-medium text-sm">İşçilik</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white font-semibold opacity-75 cursor-not-allowed"
                    value={`${parseFloat(formData.laborCost || 0).toFixed(2)} ₺`}
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-2 text-secondary-white font-medium text-sm">Genel Toplam</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-red font-bold opacity-75 cursor-not-allowed"
                    value={`${getTotalCost().toFixed(2)} ₺`}
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
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
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Repairs
