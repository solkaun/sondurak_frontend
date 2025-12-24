import { useState, useEffect } from 'react'
import api from '../services/api'
import './Pages.css'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Parçacılar</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Yeni Parçacı
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Dükkan Adı</th>
              <th>Telefon</th>
              <th>Adres</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier._id}>
                <td><strong>{supplier.shopName}</strong></td>
                <td>{supplier.phone}</td>
                <td>{supplier.address}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={() => openModal(supplier)}>
                      Düzenle
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(supplier._id)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray">
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
                {editingId ? 'Parçacı Düzenle' : 'Yeni Parçacı'}
              </h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Dükkan Adı</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Adres</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  required
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

export default Suppliers

