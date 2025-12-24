import { useState, useEffect } from 'react'
import api from '../services/api'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    category: 'diger',
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses')
      setExpenses(response.data)
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
        await api.put(`/expenses/${editingId}`, formData)
      } else {
        await api.post('/expenses', formData)
      }
      fetchExpenses()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/expenses/${id}`)
      fetchExpenses()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Dükkan Giderleri</h1>
        <button 
          className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
          onClick={() => openModal()}
        >
          + Yeni Gider
        </button>
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
                        className="px-3 py-1.5 bg-border-color text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-text-gray active:scale-95"
                        onClick={() => openModal(expense)}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-primary-red text-primary-white rounded-md text-sm transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
                        onClick={() => handleDelete(expense._id)}
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

export default Expenses
