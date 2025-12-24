import { useState, useEffect } from 'react'
import api from '../services/api'

const Repairs = () => {
  const [repairs, setRepairs] = useState([])
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchPart, setSearchPart] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    brand: '',
    model: '',
    plate: '',
    description: '',
    parts: [],
    laborCost: 0
  })
  const [tempPart, setTempPart] = useState({ part: '', quantity: 1, price: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [repairsRes, partsRes] = await Promise.all([
        api.get('/repairs'),
        api.get('/parts')
      ])
      setRepairs(repairsRes.data)
      setParts(partsRes.data)
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
        await api.put(`/repairs/${editingId}`, formData)
      } else {
        await api.post('/repairs', formData)
      }
      fetchData()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/repairs/${id}`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
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
      setFormData({
        date: repair.date.split('T')[0],
        brand: repair.brand,
        model: repair.model,
        plate: repair.plate,
        description: repair.description,
        parts: repair.parts.map(p => ({
          part: p.part._id,
          quantity: p.quantity,
          price: p.price
        })),
        laborCost: repair.laborCost
      })
    } else {
      setEditingId(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        brand: '',
        model: '',
        plate: '',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Tamir Edilen Araçlar</h1>
        <button 
          className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
          onClick={() => openModal()}
        >
          + Yeni Tamir Kaydı
        </button>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Marka</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Model</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Plaka</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Açıklama</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">İşçilik</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Parça</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Toplam</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(repair => (
                <tr key={repair._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-white">{new Date(repair.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.brand}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.model}</td>
                  <td className="px-4 py-3 text-sm text-primary-white font-semibold">{repair.plate}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.description}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.laborCost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.partsCost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-sm text-primary-red font-bold">{repair.totalCost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        className="px-3 py-1.5 bg-border-color text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-text-gray active:scale-95"
                        onClick={() => openModal(repair)}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-primary-red text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                        onClick={() => handleDelete(repair._id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {repairs.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-text-gray">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Tarih</label>
                <input
                  type="date"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-secondary-white font-medium text-sm">Marka</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-secondary-white font-medium text-sm">Model</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Plaka</label>
                <input
                  type="text"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red uppercase"
                  value={formData.plate}
                  onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Açıklama</label>
                <textarea
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
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
                    <label className="block mb-2 text-secondary-white font-medium text-sm">Parça</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                      value={searchPart}
                      onChange={e => setSearchPart(e.target.value)}
                      placeholder="Parça ara..."
                    />
                    {searchPart && filteredParts.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-primary-black border border-border-color rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredParts.slice(0, 5).map(part => (
                          <div
                            key={part._id}
                            className="px-4 py-2 text-primary-white hover:bg-secondary-black cursor-pointer transition-colors"
                            onClick={() => {
                              setTempPart({ ...tempPart, part: part._id })
                              setSearchPart(part.name)
                            }}
                          >
                            {part.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-secondary-white font-medium text-sm">Adet</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                      value={tempPart.quantity}
                      onChange={e => setTempPart({ ...tempPart, quantity: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-secondary-white font-medium text-sm">Fiyat</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                      value={tempPart.price}
                      onChange={e => setTempPart({ ...tempPart, price: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <button 
                    type="button" 
                    className="px-4 py-3 bg-border-color text-primary-white rounded-md font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
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
                  className="flex-1 px-4 py-3 bg-primary-red text-primary-white rounded-md font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3 bg-border-color text-primary-white rounded-md font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
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

export default Repairs
