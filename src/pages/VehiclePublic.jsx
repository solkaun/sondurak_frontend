import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const VehiclePublic = () => {
  const { qrCode } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVehicleData()
  }, [qrCode])

  const fetchVehicleData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customer-vehicles/public/${qrCode}`)
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Araç bulunamadı')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-black to-secondary-black">
        <div className="w-12 h-12 border-4 border-border-color border-t-primary-red rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-black to-secondary-black p-4">
        <div className="bg-secondary-black border border-border-color rounded-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-primary-red mb-2">Araç Bulunamadı</h2>
          <p className="text-text-gray text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const { vehicle, statistics, nextOilChange, repairs } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black to-secondary-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-secondary-black border border-border-color rounded-xl p-6 mb-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-extrabold text-primary-red mb-2 tracking-[2px]">SON DURAK</h1>
            <p className="text-xs text-text-gray">Oto Elektrik - Araç Takip Sistemi</p>
          </div>

          <div className="border-t border-border-color pt-4">
            <h2 className="text-xl font-bold text-secondary-white mb-3 text-center">
              {vehicle.brand} {vehicle.model}
            </h2>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-primary-black p-3 rounded-md border border-border-color">
                <p className="text-xs text-text-gray mb-1">Plaka</p>
                <p className="text-primary-red font-bold text-lg">{vehicle.plate}</p>
              </div>
              <div className="bg-primary-black p-3 rounded-md border border-border-color">
                <p className="text-xs text-text-gray mb-1">Yıl</p>
                <p className="text-secondary-white font-semibold text-lg">{vehicle.year || '-'}</p>
              </div>
              <div className="bg-primary-black p-3 rounded-md border border-border-color">
                <p className="text-xs text-text-gray mb-1">Müşteri</p>
                <p className="text-secondary-white font-semibold">{vehicle.customerName}</p>
              </div>
              <div className="bg-primary-black p-3 rounded-md border border-border-color">
                <p className="text-xs text-text-gray mb-1">Telefon</p>
                <p className="text-secondary-white font-semibold">{vehicle.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-secondary-black border border-border-color rounded-lg p-4 text-center">
            <p className="text-xs text-text-gray mb-1">Toplam Tamir</p>
            <p className="text-2xl font-bold text-primary-red">{statistics.totalRepairs}</p>
          </div>
          <div className="bg-secondary-black border border-border-color rounded-lg p-4 text-center">
            <p className="text-xs text-text-gray mb-1">Toplam Harcama</p>
            <p className="text-xl font-bold text-primary-white">{statistics.totalCost.toFixed(2)} ₺</p>
          </div>
          <div className="bg-secondary-black border border-border-color rounded-lg p-4 text-center">
            <p className="text-xs text-text-gray mb-1">Kullanılan Parça</p>
            <p className="text-2xl font-bold text-primary-white">{statistics.totalParts}</p>
          </div>
          <div className="bg-secondary-black border border-border-color rounded-lg p-4 text-center">
            <p className="text-xs text-text-gray mb-1">İlk Tamir</p>
            <p className="text-sm font-semibold text-primary-white">
              {statistics.firstRepairDate ? new Date(statistics.firstRepairDate).toLocaleDateString('tr-TR') : '-'}
            </p>
          </div>
        </div>

        {/* Gelecek Yağ Bakımı */}
        {nextOilChange && (
          <div className={`bg-secondary-black border-2 ${nextOilChange.isOverdue ? 'border-primary-red' : 'border-green-600'} rounded-xl p-6 mb-4`}>
            <h3 className="text-lg font-bold text-secondary-white mb-4 flex items-center gap-2">
              🛢️ Yağ Bakımı Durumu
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-primary-black p-3 rounded-md">
                <p className="text-xs text-text-gray mb-1">Son Bakım KM</p>
                <p className="text-lg font-bold text-primary-white">{nextOilChange.lastChangeKm.toLocaleString()}</p>
              </div>
              <div className="bg-primary-black p-3 rounded-md">
                <p className="text-xs text-text-gray mb-1">Mevcut KM</p>
                <p className="text-lg font-bold text-primary-white">{nextOilChange.currentKm.toLocaleString()}</p>
              </div>
              <div className="bg-primary-black p-3 rounded-md">
                <p className="text-xs text-text-gray mb-1">Bakım Aralığı</p>
                <p className="text-lg font-bold text-primary-white">{nextOilChange.intervalKm.toLocaleString()} km</p>
              </div>
              <div className="bg-primary-black p-3 rounded-md">
                <p className="text-xs text-text-gray mb-1">Kalan KM</p>
                <p className={`text-lg font-bold ${nextOilChange.isOverdue ? 'text-primary-red' : 'text-green-500'}`}>
                  {nextOilChange.remainingKm.toLocaleString()} km
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${nextOilChange.isOverdue ? 'bg-primary-red/20 border border-primary-red' : 'bg-green-600/20 border border-green-600'}`}>
              <p className={`text-sm font-semibold ${nextOilChange.isOverdue ? 'text-primary-red' : 'text-green-500'}`}>
                {nextOilChange.isOverdue ? (
                  <>⚠️ Yağ bakımı süresi geçmiş! En kısa sürede bakım yaptırın.</>
                ) : (
                  <>✅ Sonraki yağ bakımı: {nextOilChange.estimatedNextKm.toLocaleString()} km'de</>
                )}
              </p>
              <p className="text-xs text-text-gray mt-1">
                Son bakım tarihi: {new Date(nextOilChange.lastChangeDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        )}

        {/* Tamir Geçmişi */}
        <div className="bg-secondary-black border border-border-color rounded-xl p-6">
          <h3 className="text-lg font-bold text-secondary-white mb-4 flex items-center gap-2">
            🔧 Tamir Geçmişi
          </h3>

          {repairs.length === 0 ? (
            <div className="text-center text-text-gray text-sm py-8">
              Bu araç için henüz tamir kaydı bulunmamaktadır
            </div>
          ) : (
            <div className="space-y-4">
              {repairs.map((repair, index) => (
                <div key={repair._id} className="bg-primary-black p-4 rounded-lg border border-border-color">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary-red">#{repairs.length - index}</span>
                        <span className="text-xs text-text-gray">
                          {new Date(repair.date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      {repair.currentKm && (
                        <p className="text-xs text-text-gray">
                          📍 KM: <span className="text-secondary-white font-semibold">{repair.currentKm.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-red">{repair.totalCost.toFixed(2)} ₺</p>
                    </div>
                  </div>

                  {repair.currentIssues && (
                    <div className="mb-3 p-2 bg-secondary-black rounded border border-border-color">
                      <p className="text-xs text-text-gray mb-1">Arızalar:</p>
                      <p className="text-xs text-primary-white">{repair.currentIssues}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs text-text-gray mb-1">Yapılan İşlem:</p>
                    <p className="text-sm text-secondary-white">{repair.description}</p>
                  </div>

                  {repair.parts.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-text-gray mb-2">Kullanılan Parçalar:</p>
                      <div className="space-y-1">
                        {repair.parts.map((part, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-secondary-black p-2 rounded">
                            <span className="text-primary-white">
                              {part.name} <span className="text-text-gray">x{part.quantity}</span>
                            </span>
                            <span className="text-primary-white font-semibold">
                              {(part.quantity * part.price).toFixed(2)} ₺
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs pt-3 border-t border-border-color">
                    <div>
                      <span className="text-text-gray">İşçilik: </span>
                      <span className="text-secondary-white font-semibold">{repair.laborCost.toFixed(2)} ₺</span>
                    </div>
                    <div>
                      <span className="text-text-gray">Parça: </span>
                      <span className="text-secondary-white font-semibold">{repair.partsCost.toFixed(2)} ₺</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-text-gray">
          <p>© 2024 Son Durak Oto Elektrik - Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  )
}

export default VehiclePublic

