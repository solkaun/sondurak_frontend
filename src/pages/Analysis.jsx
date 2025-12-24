import { useState, useEffect } from 'react'
import api from '../services/api'

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-border-color border-t-primary-red rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-gray">Veri yüklenemedi</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-white mb-4">Analiz Raporu</h1>
        
        <div className="bg-secondary-black p-4 md:p-6 rounded-lg border border-border-color">
          <h3 className="text-lg font-semibold text-secondary-white mb-4">Tarih Filtresi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block mb-2 text-secondary-white font-medium text-sm">Başlangıç Tarihi</label>
              <input
                type="date"
                className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                value={dateRange.startDate}
                onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2 text-secondary-white font-medium text-sm">Bitiş Tarihi</label>
              <input
                type="date"
                className="w-full p-3 bg-primary-black border border-border-color rounded-md text-primary-white focus:outline-none focus:border-primary-red"
                value={dateRange.endDate}
                onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <button 
              className="px-4 py-3 bg-primary-red text-primary-white rounded-md font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95 h-fit self-end"
              onClick={handleFilter}
            >
              Filtrele
            </button>
            <button 
              className="px-4 py-3 bg-border-color text-primary-white rounded-md font-medium transition-all btn-touch hover:bg-text-gray active:scale-95 h-fit self-end"
              onClick={resetFilter}
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-primary-red mb-4">Özet</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Gelir</div>
          <div className="text-2xl font-bold text-green-500">{data.summary.totalRevenue.toFixed(2)} ₺</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Gider</div>
          <div className="text-2xl font-bold text-primary-red">{data.summary.totalCosts.toFixed(2)} ₺</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Net Kar (İşçilik - Giderler)</div>
          <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-green-500' : 'text-primary-red'}`}>
            {data.summary.netProfit.toFixed(2)} ₺
          </div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Brüt Kar (Tüm - Giderler)</div>
          <div className={`text-2xl font-bold ${data.summary.grossProfit >= 0 ? 'text-green-500' : 'text-primary-red'}`}>
            {data.summary.grossProfit.toFixed(2)} ₺
          </div>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-primary-red mb-4 mt-8">Parça Satın Alımları</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Kayıt</div>
          <div className="text-2xl font-bold text-primary-white">{data.purchases.itemsCount}</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Parça Adedi</div>
          <div className="text-2xl font-bold text-primary-white">{data.purchases.totalCount}</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Maliyet</div>
          <div className="text-2xl font-bold text-primary-red">{data.purchases.totalCost.toFixed(2)} ₺</div>
        </div>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Parçacı</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Parça</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Adet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {data.purchases.list.map(purchase => (
                <tr key={purchase._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-white">{new Date(purchase.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{purchase.supplier.shopName}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{purchase.part.name}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{purchase.quantity}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{purchase.totalCost.toFixed(2)} ₺</td>
                </tr>
              ))}
              {data.purchases.list.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-gray">
                    Bu tarih aralığında kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-primary-red mb-4 mt-8">Tamir Edilen Araçlar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Araç</div>
          <div className="text-2xl font-bold text-primary-white">{data.repairs.itemsCount}</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">İşçilik Geliri</div>
          <div className="text-2xl font-bold text-green-500">{data.repairs.laborRevenue.toFixed(2)} ₺</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Parça Geliri</div>
          <div className="text-2xl font-bold text-green-500">{data.repairs.partsRevenue.toFixed(2)} ₺</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Gelir</div>
          <div className="text-2xl font-bold text-green-500">{data.repairs.totalRevenue.toFixed(2)} ₺</div>
        </div>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Araç</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Plaka</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">İşçilik</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Parça</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {data.repairs.list.map(repair => (
                <tr key={repair._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-white">{new Date(repair.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.brand} {repair.model}</td>
                  <td className="px-4 py-3 text-sm text-primary-white font-semibold">{repair.plate}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.laborCost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{repair.partsCost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-sm text-primary-red font-bold">{repair.totalCost.toFixed(2)} ₺</td>
                </tr>
              ))}
              {data.repairs.list.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-gray">
                    Bu tarih aralığında kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-primary-red mb-4 mt-8">Dükkan Giderleri</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Gider Kalemi</div>
          <div className="text-2xl font-bold text-primary-white">{data.expenses.itemsCount}</div>
        </div>
        <div className="bg-secondary-black p-6 rounded-lg border border-border-color">
          <div className="text-text-gray text-sm mb-2">Toplam Gider</div>
          <div className="text-2xl font-bold text-primary-red">{data.expenses.totalCost.toFixed(2)} ₺</div>
        </div>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Açıklama</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Adet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-white">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.list.map(expense => (
                <tr key={expense._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-white">{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">
                    {expense.category === 'yemek' ? 'Yemek' : expense.category === 'malzeme' ? 'Malzeme' : 'Diğer'}
                  </td>
                  <td className="px-4 py-3 text-sm text-primary-white">{expense.name}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{expense.quantity}</td>
                  <td className="px-4 py-3 text-sm text-primary-white">{expense.totalCost.toFixed(2)} ₺</td>
                </tr>
              ))}
              {data.expenses.list.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-gray">
                    Bu tarih aralığında kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analysis
