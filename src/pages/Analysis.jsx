import { useState, useEffect } from 'react'
import api from '../services/api'
import './Pages.css'

const Analysis = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async (filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await api.get(`/analysis?${params.toString()}`)
      setData(response.data)
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    fetchAnalysis(dateRange)
  }

  const resetFilter = () => {
    setDateRange({ startDate: '', endDate: '' })
    fetchAnalysis()
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  if (!data) {
    return <div className="text-center text-gray">Veri yüklenemedi</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analiz Raporu</h1>
      </div>

      <div className="filter-section">
        <h3 style={{marginBottom: '1rem'}}>Tarih Filtresi</h3>
        <div className="filter-row">
          <div className="form-group">
            <label>Başlangıç Tarihi</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.startDate}
              onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Bitiş Tarihi</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.endDate}
              onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={handleFilter}>
            Filtrele
          </button>
          <button className="btn btn-secondary" onClick={resetFilter}>
            Sıfırla
          </button>
        </div>
      </div>

      <h2 style={{marginBottom: '1rem', color: 'var(--primary-red)'}}>Özet</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Toplam Gelir</div>
          <div className="stat-value green">{data.summary.totalRevenue.toFixed(2)} ₺</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Gider</div>
          <div className="stat-value red">{data.summary.totalCosts.toFixed(2)} ₺</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Kar (İşçilik - Giderler)</div>
          <div className={`stat-value ${data.summary.netProfit >= 0 ? 'green' : 'red'}`}>
            {data.summary.netProfit.toFixed(2)} ₺
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Brüt Kar (Tüm - Giderler)</div>
          <div className={`stat-value ${data.summary.grossProfit >= 0 ? 'green' : 'red'}`}>
            {data.summary.grossProfit.toFixed(2)} ₺
          </div>
        </div>
      </div>

      <h2 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-red)'}}>
        Parça Satın Alımları
      </h2>
      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div className="stat-card">
          <div className="stat-label">Toplam Kayıt</div>
          <div className="stat-value">{data.purchases.itemsCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Parça Adedi</div>
          <div className="stat-value">{data.purchases.totalCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Maliyet</div>
          <div className="stat-value red">{data.purchases.totalCost.toFixed(2)} ₺</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Parçacı</th>
              <th>Parça</th>
              <th>Adet</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {data.purchases.list.map(purchase => (
              <tr key={purchase._id}>
                <td>{new Date(purchase.date).toLocaleDateString('tr-TR')}</td>
                <td>{purchase.supplier.shopName}</td>
                <td>{purchase.part.name}</td>
                <td>{purchase.quantity}</td>
                <td>{purchase.totalCost.toFixed(2)} ₺</td>
              </tr>
            ))}
            {data.purchases.list.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray">
                  Bu tarih aralığında kayıt yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-red)'}}>
        Tamir Edilen Araçlar
      </h2>
      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div className="stat-card">
          <div className="stat-label">Toplam Araç</div>
          <div className="stat-value">{data.repairs.itemsCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">İşçilik Geliri</div>
          <div className="stat-value green">{data.repairs.laborRevenue.toFixed(2)} ₺</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Parça Geliri</div>
          <div className="stat-value green">{data.repairs.partsRevenue.toFixed(2)} ₺</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Gelir</div>
          <div className="stat-value green">{data.repairs.totalRevenue.toFixed(2)} ₺</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Araç</th>
              <th>Plaka</th>
              <th>İşçilik</th>
              <th>Parça</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {data.repairs.list.map(repair => (
              <tr key={repair._id}>
                <td>{new Date(repair.date).toLocaleDateString('tr-TR')}</td>
                <td>{repair.brand} {repair.model}</td>
                <td><strong>{repair.plate}</strong></td>
                <td>{repair.laborCost.toFixed(2)} ₺</td>
                <td>{repair.partsCost.toFixed(2)} ₺</td>
                <td className="text-red"><strong>{repair.totalCost.toFixed(2)} ₺</strong></td>
              </tr>
            ))}
            {data.repairs.list.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray">
                  Bu tarih aralığında kayıt yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-red)'}}>
        Dükkan Giderleri
      </h2>
      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div className="stat-card">
          <div className="stat-label">Toplam Gider Kalemi</div>
          <div className="stat-value">{data.expenses.itemsCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Gider</div>
          <div className="stat-value red">{data.expenses.totalCost.toFixed(2)} ₺</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Adet</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {data.expenses.list.map(expense => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                <td>{expense.category === 'yemek' ? 'Yemek' : expense.category === 'malzeme' ? 'Malzeme' : 'Diğer'}</td>
                <td>{expense.name}</td>
                <td>{expense.quantity}</td>
                <td>{expense.totalCost.toFixed(2)} ₺</td>
              </tr>
            ))}
            {data.expenses.list.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray">
                  Bu tarih aralığında kayıt yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Analysis

