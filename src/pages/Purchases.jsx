import { useState, useEffect } from 'react'
import api from '../services/api'
import './Pages.css'

const Purchases = () => {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchPart, setSearchPart] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    partName: '',
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [purchasesRes, suppliersRes, partsRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers'),
        api.get('/parts')
      ])
      setPurchases(purchasesRes.data)
      setSuppliers(suppliersRes.data)
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
        await api.put(`/purchases/${editingId}`, formData)
      } else {
        await api.post('/purchases', formData)
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
      await api.delete(`/purchases/${id}`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    }
  }

  const openModal = (purchase = null) => {
    if (purchase) {
      setEditingId(purchase._id)
      setFormData({
        date: purchase.date.split('T')[0],
        supplier: purchase.supplier._id,
        partName: purchase.part.name,
        quantity: purchase.quantity,
        price: purchase.price
      })
    } else {
      setEditingId(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        partName: '',
        quantity: 1,
        price: 0
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setSearchPart('')
  }

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchPart.toLowerCase())
  )

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Parça Satın Alımları</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Yeni Satın Alım
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Parçacı</th>
              <th>Parça Adı</th>
              <th>Adet</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
              <th>Ekleyen</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase._id}>
                <td>{new Date(purchase.date).toLocaleDateString('tr-TR')}</td>
                <td>{purchase.supplier.shopName}</td>
                <td>{purchase.part.name}</td>
                <td>{purchase.quantity}</td>
                <td>{purchase.price.toFixed(2)} ₺</td>
                <td className="text-red">{purchase.totalCost.toFixed(2)} ₺</td>
                <td>
                  {purchase.createdBy ? 
                    `${purchase.createdBy.firstName} ${purchase.createdBy.lastName}` : 
                    '-'
                  }
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={() => openModal(purchase)}>
                      Düzenle
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(purchase._id)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray">
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
                {editingId ? 'Satın Alım Düzenle' : 'Yeni Satın Alım'}
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
                <label>Parçacı</label>
                <select
                  className="form-control"
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  required
                >
                  <option value="">Parçacı Seçin</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.shopName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Parça Adı</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.partName}
                  onChange={e => {
                    setFormData({ ...formData, partName: e.target.value })
                    setSearchPart(e.target.value)
                  }}
                  placeholder="Parça adı yazın veya seçin"
                  required
                />
                {searchPart && filteredParts.length > 0 && (
                  <div className="autocomplete-list">
                    {filteredParts.slice(0, 5).map(part => (
                      <div
                        key={part._id}
                        className="autocomplete-item"
                        onClick={() => {
                          setFormData({ ...formData, partName: part.name })
                          setSearchPart('')
                        }}
                      >
                        {part.name}
                      </div>
                    ))}
                  </div>
                )}
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

export default Purchases

