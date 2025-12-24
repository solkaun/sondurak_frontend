import { useState, useEffect } from 'react'
import api from '../services/api'
import './Pages.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    role: 'user'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
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
        await api.put(`/users/${editingId}`, formData)
      } else {
        await api.post('/users', formData)
      }
      fetchUsers()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    }
  }

  const openModal = (user = null) => {
    if (user) {
      setEditingId(user._id)
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        phone: user.phone,
        emergencyPhone: user.emergencyPhone,
        address: user.address,
        role: user.role
      })
    } else {
      setEditingId(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        emergencyPhone: '',
        address: '',
        role: 'user'
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
        <h1>Kullanıcılar</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Yeni Kullanıcı
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Yakın Telefon</th>
              <th>Rol</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td><strong>{user.firstName} {user.lastName}</strong></td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.emergencyPhone}</td>
                <td>
                  <span className={user.role === 'admin' ? 'text-red' : ''}>
                    {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={() => openModal(user)}>
                      Düzenle
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(user._id)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray">
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
                {editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
              </h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label>Ad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Soyad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Şifre {editingId && '(Değiştirmek istemiyorsanız boş bırakın)'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
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
                  <label>Yakın Telefonu</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.emergencyPhone}
                    onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    required
                  />
                </div>
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

              <div className="form-group">
                <label>Rol</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
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

export default Users

