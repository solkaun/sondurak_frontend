import { useState, useEffect } from 'react'
import api from '../services/api'
import './Pages.css'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dükkan Giderleri</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Yeni Gider
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Adet</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                <td>{getCategoryLabel(expense.category)}</td>
                <td>{expense.name}</td>
                <td>{expense.quantity}</td>
                <td>{expense.price.toFixed(2)} ₺</td>
                <td className="text-red">{expense.totalCost.toFixed(2)} ₺</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={() => openModal(expense)}>
                      Düzenle
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(expense._id)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-gray">
                  Henüz kayıt yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Gider Düzenle' : 'Yeni Gider'}
              </h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tarih</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="yemek">Yemek</option>
                  <option value="malzeme">Malzeme</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Adet</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Birim Fiyat (₺)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Toplam</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${(formData.quantity * formData.price).toFixed(2)} ₺`}
                  disabled
                />
              </div>

              <div className="flex gap-1">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
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

