import { useState, useEffect } from 'react'
import api from '../services/api'
import './Pages.css'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tamir Edilen Araçlar</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Yeni Tamir Kaydı
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Marka</th>
              <th>Model</th>
              <th>Plaka</th>
              <th>Açıklama</th>
              <th>İşçilik</th>
              <th>Parça</th>
              <th>Toplam</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map(repair => (
              <tr key={repair._id}>
                <td>{new Date(repair.date).toLocaleDateString('tr-TR')}</td>
                <td>{repair.brand}</td>
                <td>{repair.model}</td>
                <td><strong>{repair.plate}</strong></td>
                <td>{repair.description}</td>
                <td>{repair.laborCost.toFixed(2)} ₺</td>
                <td>{repair.partsCost.toFixed(2)} ₺</td>
                <td className="text-red"><strong>{repair.totalCost.toFixed(2)} ₺</strong></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={() => openModal(repair)}>
                      Düzenle
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(repair._id)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {repairs.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-gray">
                  Henüz kayıt yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: '800px'}}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Tamir Düzenle' : 'Yeni Tamir'}
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

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label>Marka</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Plaka</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.plate}
                  onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Takılan Parçalar</label>
                <div className="parts-list">
                  {formData.parts.map((p, index) => {
                    const partData = parts.find(part => part._id === p.part)
                    return (
                      <div key={index} className="part-item">
                        <div className="part-info">
                          <span>{partData?.name}</span>
                          <span>{p.quantity} adet</span>
                          <span>{(p.quantity * p.price).toFixed(2)} ₺</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removePart(index)}
                        >
                          Sil
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end'}}>
                  <div className="form-group" style={{position: 'relative'}}>
                    <label>Parça</label>
                    <input
                      type="text"
                      className="form-control"
                      value={searchPart}
                      onChange={e => setSearchPart(e.target.value)}
                      placeholder="Parça ara..."
                    />
                    {searchPart && filteredParts.length > 0 && (
                      <div className="autocomplete-list">
                        {filteredParts.slice(0, 5).map(part => (
                          <div
                            key={part._id}
                            className="autocomplete-item"
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

                  <div className="form-group">
                    <label>Adet</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tempPart.quantity}
                      onChange={e => setTempPart({ ...tempPart, quantity: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fiyat</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tempPart.price}
                      onChange={e => setTempPart({ ...tempPart, price: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <button type="button" className="btn btn-secondary" onClick={addPart}>
                    Ekle
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>İşçilik Ücreti (₺)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.laborCost}
                  onChange={e => setFormData({ ...formData, laborCost: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                <div className="form-group">
                  <label>Parça Toplam</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${getTotalPartsCost().toFixed(2)} ₺`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>İşçilik</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${parseFloat(formData.laborCost || 0).toFixed(2)} ₺`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Genel Toplam</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{fontWeight: 'bold', color: 'var(--primary-red)'}}
                    value={`${getTotalCost().toFixed(2)} ₺`}
                    disabled
                  />
                </div>
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

export default Repairs

