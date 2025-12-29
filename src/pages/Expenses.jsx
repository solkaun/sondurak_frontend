import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const Expenses = () => {
  const isFirstRender = useRef(true)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
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
    name: '',
    category: 'diger',
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    if (isFirstRender.current) {
      return
    }
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      const timer = setTimeout(() => {
        setLoading(true)
        fetchExpenses()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
    setLoading(true)
    fetchExpenses()
  }, [currentPage])

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 8);

      const queryString = params.toString();
      const response = await api.get(`/expenses?${queryString}`)
      setExpenses(response.data.expenses)
      setPagination(response.data.pagination)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, formData)
      } else {
        await api.post('/expenses', formData)
      }
      fetchExpenses()
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
      await api.delete(`/expenses/${id}`)
      fetchExpenses()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    } finally {
      setSubmitting(false)
    }
  }

  const openModal = (expense = null) => {
    if (expense) {
      setEditingId(expense._id)
      setFormData({
        date: expense.date.split('T')[0],
        name: expense.name,
        category: expense.category,
        quantity: expense.quantity,
        price: expense.price
      })
    } else {
      setEditingId(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        category: 'diger',
        quantity: 1,
        price: 0
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const getCategoryLabel = (category) => {
    const labels = {
      yemek: 'Yemek',
      malzeme: 'Malzeme',
      diger: 'Diğer'
    }
    return labels[category] || category
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
          <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Dükkan Giderleri</h1>
          <button 
            className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
            onClick={() => openModal()}
          >
            + Yeni Gider
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
                placeholder="Açıklama veya kategori ara..."
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Açıklama</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Adet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Birim Fiyat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Toplam</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-white">{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{getCategoryLabel(expense.category)}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{expense.name}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{expense.quantity}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{expense.price.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-sm text-primary-red font-semibold">{expense.totalCost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-50"
                        onClick={() => openModal(expense)}
                        disabled={submitting}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDelete(expense._id)}
                        disabled={submitting}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-gray">
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
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-xl font-bold text-secondary-white">
                {editingId ? 'Gider Düzenle' : 'Yeni Gider'}
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

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Kategori</label>
                <select
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="yemek">Yemek</option>
                  <option value="malzeme">Malzeme</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Açıklama</label>
                <input
                  type="text"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Adet</label>
                <input
                  type="number"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Birim Fiyat (₺)</label>
                <input
                  type="number"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary-white font-medium text-sm">Toplam</label>
                <input
                  type="text"
                  className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-red font-semibold opacity-75 cursor-not-allowed"
                  value={`${(formData.quantity * formData.price).toFixed(2)} ₺`}
                  disabled
                />
              </div>

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
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
