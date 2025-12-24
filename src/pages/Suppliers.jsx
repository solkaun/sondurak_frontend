import { useState, useEffect } from 'react'
import api from '../services/api'

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers')
      setSuppliers(response.data)
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
        await api.put(`/suppliers/${editingId}`, formData)
      } else {
        await api.post('/suppliers', formData)
      }
      fetchSuppliers()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu parçacıyı silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/suppliers/${id}`)
      fetchSuppliers()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    }
  }

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingId(supplier._id)
      setFormData({
        shopName: supplier.shopName,
        phone: supplier.phone,
        address: supplier.address
      })
    } else {
      setEditingId(null)
      setFormData({
        shopName: '',
        phone: '',
        address: ''
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
        <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Parçacılar</h1>
        <button 
          className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
          onClick={() => openModal()}
        >
          + Yeni Parçacı
        </button>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Dükkan Adı</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Telefon</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Adres</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(supplier => (
                <tr key={supplier._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-white font-semibold">{supplier.shopName}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{supplier.phone}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{supplier.address}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        className="px-3 py-1.5 bg-border-color text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-text-gray active:scale-95"
                        onClick={() => openModal(supplier)}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-primary-red text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                        onClick={() => handleDelete(supplier._id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-text-gray">
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
            <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-xl font-bold text-secondary-white">
                {editingId ? 'Parçacı Düzenle' : 'Yeni Parçacı'}
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
                <label className="block mb-2 text-secondary-white font-medium text-sm">Dükkan Adı</label>
                <input
                  type="text"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Telefon</label>
                <input
                  type="tel"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Adres</label>
                <textarea
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red resize-none"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  required
                />
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

export default Suppliers
