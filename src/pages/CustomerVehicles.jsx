import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const CustomerVehicles = () => {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingQR, setLoadingQR] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [vehicleHistory, setVehicleHistory] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    brand: '',
    model: '',
    plate: '',
    year: new Date().getFullYear(),
    notes: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/customer-vehicles')
      setVehicles(response.data)
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/customer-vehicles/${editingId}`, formData)
      } else {
        await api.post('/customer-vehicles', formData)
      }
      fetchVehicles()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return
    setSubmitting(true)
    try {
      await api.delete(`/customer-vehicles/${id}`)
      fetchVehicles()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    } finally {
      setSubmitting(false)
    }
  }

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingId(vehicle._id)
      setFormData({
        customerName: vehicle.customerName,
        customerPhone: vehicle.customerPhone,
        brand: vehicle.brand,
        model: vehicle.model,
        plate: vehicle.plate,
        year: vehicle.year || new Date().getFullYear(),
        notes: vehicle.notes || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        customerName: '',
        customerPhone: '',
        brand: '',
        model: '',
        plate: '',
        year: new Date().getFullYear(),
        notes: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const viewHistory = async (vehicleId) => {
    setLoadingHistory(true)
    try {
      const response = await api.get(`/customer-vehicles/${vehicleId}/history`)
      setVehicleHistory(response.data)
      console.log(response.data)
      setShowHistoryModal(true)
    } catch (error) {
      alert(error.response?.data?.message || 'Geçmiş yüklenemedi')
    } finally {
      setLoadingHistory(false)
    }
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
    setVehicleHistory(null)
  }

  const turkishToEnglish = (text) => {
    if (!text) return text
    const map = {
      'ş': 's', 'Ş': 'S',
      'ğ': 'g', 'Ğ': 'G',
      'ç': 'c', 'Ç': 'C',
      'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O',
      'ü': 'u', 'Ü': 'U',
      '₺': 'TL'
    }
    return text.toString().replace(/[şŞğĞçÇıİöÖüÜ₺]/g, char => map[char] || char)
  }

  const exportHistoryToPDF = () => {
    if (!vehicleHistory) return

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // ============ HEADER ============
    doc.setFillColor(220, 38, 38)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text(turkishToEnglish('SON DURAK'), pageWidth / 2, 15, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.text(turkishToEnglish('Oto Elektrik & Tamir Servisi'), pageWidth / 2, 23, { align: 'center' })
    doc.text(turkishToEnglish('Arac Tamir Gecmis Raporu'), pageWidth / 2, 30, { align: 'center' })

    // ============ ARAÇ BİLGİLERİ ============
    let yPos = 50
    const { vehicle } = vehicleHistory

    // Araç bilgi kutusu
    doc.setFillColor(245, 245, 245)
    doc.rect(14, yPos - 5, pageWidth - 28, 40, 'F')
    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.5)
    doc.rect(14, yPos - 5, pageWidth - 28, 40, 'S')

    doc.setTextColor(220, 38, 38)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text(turkishToEnglish('Arac Bilgileri'), 18, yPos)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    yPos += 7
    doc.text(turkishToEnglish(`Plaka: ${vehicle.plate}`), 18, yPos)
    yPos += 5
    doc.text(turkishToEnglish(`Marka/Model: ${vehicle.brand} ${vehicle.model}`), 18, yPos)
    yPos += 5
    doc.text(turkishToEnglish(`Musteri: ${vehicle.customerName}`), 18, yPos)
    yPos += 5
    doc.text(turkishToEnglish(`Telefon: ${vehicle.customerPhone}`), 18, yPos)
    yPos += 5
    doc.text(turkishToEnglish(`Yil: ${vehicle.year || '-'}`), 18, yPos)

    // ============ İSTATİSTİKLER ============
    yPos += 12
    doc.setFillColor(245, 245, 245)
    doc.rect(14, yPos - 5, pageWidth - 28, 22, 'F')

    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text(turkishToEnglish('Ozet'), 18, yPos)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    yPos += 6
    doc.text(turkishToEnglish(`Toplam Tamir Sayisi: ${vehicleHistory.totalRepairs}`), 18, yPos)
    yPos += 5
    doc.text(turkishToEnglish(`Toplam Harcama: ${vehicleHistory.totalCost.toFixed(2)} TL`), 18, yPos)
    yPos += 5
    doc.text(turkishToEnglish(`Toplam Parca: ${vehicleHistory.totalParts}`), 18, yPos)

    // ============ TAMİR GEÇMİŞİ TABLOSU ============
    yPos += 10

    if (vehicleHistory.repairs.length > 0) {
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text(turkishToEnglish('Tamir Gecmisi'), 18, yPos)
      yPos += 5

      const repairData = vehicleHistory.repairs.map((repair, index) => {
        const partsStr = repair.parts.map(p => 
          turkishToEnglish(`${p.part.name} (${p.quantity}x)`)
        ).join(', ') || '-'

        return [
          (index + 1).toString(),
          new Date(repair.date).toLocaleDateString('tr-TR'),
          repair.currentKm ? repair.currentKm.toString() : '-',
          turkishToEnglish(repair.description),
          partsStr,
          turkishToEnglish(`${repair.laborCost.toFixed(2)} TL`),
          turkishToEnglish(`${repair.partsCost.toFixed(2)} TL`),
          turkishToEnglish(`${repair.totalCost.toFixed(2)} TL`)
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [[
          turkishToEnglish('#'),
          turkishToEnglish('Tarih'),
          turkishToEnglish('KM'),
          turkishToEnglish('Aciklama'),
          turkishToEnglish('Parcalar'),
          turkishToEnglish('Iscilik'),
          turkishToEnglish('Parca'),
          turkishToEnglish('Toplam')
        ]],
        body: repairData,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 7,
          cellPadding: 2,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
          1: { halign: 'center', cellWidth: 22 },
          2: { halign: 'center', cellWidth: 15 },
          3: { halign: 'left', cellWidth: 35 },
          4: { halign: 'left', cellWidth: 40 },
          5: { halign: 'right', cellWidth: 18 },
          6: { halign: 'right', cellWidth: 18 },
          7: { halign: 'right', cellWidth: 20 }
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 14, right: 14 }
      })

      // Özet kutu - sağ alt
      const finalY = doc.lastAutoTable.finalY + 10
      const summaryX = pageWidth - 75
      const summaryY = finalY
      const summaryWidth = 60

      doc.setFillColor(245, 245, 245)
      doc.rect(summaryX, summaryY, summaryWidth, 20, 'F')
      doc.setDrawColor(220, 38, 38)
      doc.setLineWidth(0.5)
      doc.rect(summaryX, summaryY, summaryWidth, 20, 'S')

      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text(turkishToEnglish('Genel Toplam'), summaryX + 30, summaryY + 6, { align: 'center' })

      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(turkishToEnglish(`Tamir: ${vehicleHistory.totalRepairs}`), summaryX + 5, summaryY + 12)
      
      doc.setFont(undefined, 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text(turkishToEnglish(`${vehicleHistory.totalCost.toFixed(2)} TL`), summaryX + summaryWidth - 5, summaryY + 16, { align: 'right' })
    } else {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(turkishToEnglish('Bu arac icin henuz tamir kaydi bulunmamaktadir.'), pageWidth / 2, yPos, { align: 'center' })
    }

    // ============ FOOTER ============
    doc.setTextColor(120, 120, 120)
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text(
      turkishToEnglish('Bu rapor Son Durak Oto Elektrik tarafindan otomatik olarak olusturulmustur.'),
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    doc.setFont(undefined, 'normal')
    const reportDate = new Date().toLocaleDateString('tr-TR')
    doc.text(turkishToEnglish(`Tarih: ${reportDate}`), pageWidth - 14, pageHeight - 10, { align: 'right' })

    // ============ KAYDET ============
    const fileName = turkishToEnglish(`SonDurak_Arac_Gecmis_${vehicle.plate}_${new Date().toISOString().split('T')[0]}.pdf`)
    doc.save(fileName)
  }

  const viewQRCode = async (vehicleId) => {
    setLoadingQR(true)
    try {
      const response = await api.get(`/customer-vehicles/${vehicleId}/qr`)
      setQrData(response.data)
      setShowQRModal(true)
    } catch (error) {
      alert(error.response?.data?.message || 'QR kod yüklenemedi')
    } finally {
      setLoadingQR(false)
    }
  }

  const closeQRModal = () => {
    setShowQRModal(false)
    setQrData(null)
  }

  const downloadQRCode = () => {
    if (!qrData) return
    
    const link = document.createElement('a')
    link.href = qrData.qrCodeImage
    link.download = `QR_${qrData.vehicle.plate}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRCode = () => {
    if (!qrData) return
    
    const printWindow = window.open('', '', 'width=600,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Kod - ${qrData.vehicle.plate}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
            }
            h2 { color: #DC2626; margin-bottom: 10px; }
            img { margin: 20px 0; }
            .info { margin: 10px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>SON DURAK - Oto Elektrik</h2>
          <h3>${qrData.vehicle.brand} ${qrData.vehicle.model}</h3>
          <div class="info"><strong>Plaka:</strong> ${qrData.vehicle.plate}</div>
          <div class="info"><strong>Müşteri:</strong> ${qrData.vehicle.customerName}</div>
          <img src="${qrData.qrCodeImage}" alt="QR Kod" />
          <p style="font-size: 12px; color: #666;">Araç geçmişini görüntülemek için QR kodu okutun</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
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
        <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Müşteri Araçları</h1>
        <button 
          className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
          onClick={() => openModal()}
        >
          + Yeni Araç
        </button>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Müşteri</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Telefon</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Araç</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Plaka</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Yıl</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-3 py-2 text-xs text-primary-white font-semibold">{vehicle.customerName}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{vehicle.customerPhone}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{vehicle.brand} {vehicle.model}</td>
                  <td className="px-3 py-2 text-xs text-primary-red font-bold">{vehicle.plate}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{vehicle.year || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      <button 
                        className="px-2.5 py-1 bg-blue-600 text-primary-white rounded text-xs transition-all btn-touch hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => viewQRCode(vehicle._id)}
                        disabled={loadingQR || submitting}
                        title="QR Kod"
                      >
                        {loadingQR ? (
                          <span className="flex items-center justify-center gap-1">
                            <span className="inline-block w-3 h-3 border-2 border-blue-300 border-t-white rounded-full animate-spin"></span>
                          </span>
                        ) : (
                          '📱'
                        )}
                      </button>
                      <button 
                        className="px-2.5 py-1 bg-green-600 text-primary-white rounded text-xs transition-all btn-touch hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => viewHistory(vehicle._id)}
                        disabled={loadingHistory || submitting}
                      >
                        {loadingHistory ? (
                          <span className="flex items-center justify-center gap-1">
                            <span className="inline-block w-3 h-3 border-2 border-green-300 border-t-white rounded-full animate-spin"></span>
                          </span>
                        ) : (
                          'Geçmiş'
                        )}
                      </button>
                      <button 
                        className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-50"
                        onClick={() => openModal(vehicle)}
                        disabled={submitting}
                      >
                        {user?.role === 'admin' ? 'Düzenle' : 'Detay'}
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(vehicle._id)}
                          disabled={submitting}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-text-gray text-xs">
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
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-lg font-bold text-secondary-white">
                {editingId ? (user?.role === 'admin' ? 'Araç Düzenle' : 'Araç Detayı') : 'Yeni Araç'}
              </h2>
              <button 
                className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Müşteri Adı</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Müşteri Telefon</label>
                  <input
                    type="tel"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Marka</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Model</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    disabled={editingId && user?.role !== 'admin'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Plaka</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red uppercase"
                    value={formData.plate}
                    onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    disabled={editingId && user?.role !== 'admin'}
                    placeholder="34ABC123"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-secondary-white font-medium text-xs">Yıl</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    disabled={editingId && user?.role !== 'admin'}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Notlar (Opsiyonel)</label>
                <textarea
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  disabled={editingId && user?.role !== 'admin'}
                  rows="3"
                  placeholder="Araç hakkında notlar..."
                />
              </div>

              {(!editingId || user?.role === 'admin') && (
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
              )}

              {editingId && user?.role !== 'admin' && (
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    className="flex-1 px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                    onClick={closeModal}
                  >
                    Kapat
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* QR Kod Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeQRModal}>
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-border-color">
              <h2 className="text-lg font-bold text-secondary-white">QR Kod - {qrData.vehicle.plate}</h2>
              <button
                className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                onClick={closeQRModal}
              >
                &times;
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <p className="text-sm text-text-gray mb-1">
                  <span className="font-semibold text-secondary-white">{qrData.vehicle.brand} {qrData.vehicle.model}</span>
                </p>
                <p className="text-xs text-text-gray">{qrData.vehicle.customerName}</p>
              </div>

              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img 
                  src={qrData.qrCodeImage} 
                  alt="QR Kod" 
                  className="w-64 h-64"
                />
              </div>

              <p className="text-xs text-text-gray mb-4">
                Bu QR kodu okutarak aracın tamir geçmişini görüntüleyebilirsiniz
              </p>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-blue-700 active:scale-95"
                  onClick={downloadQRCode}
                >
                  📥 İndir
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-green-600 text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-green-700 active:scale-95"
                  onClick={printQRCode}
                >
                  🖨️ Yazdır
                </button>
              </div>

              <div className="mt-4 p-3 bg-primary-black rounded-md border border-border-color">
                <p className="text-xs text-text-gray mb-1">QR Kod URL:</p>
                <p className="text-xs text-primary-white font-mono break-all">{qrData.qrUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araç Geçmişi Modal */}
      {showHistoryModal && vehicleHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeHistoryModal}>
          <div className="bg-secondary-black border border-border-color rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <div>
                <h2 className="text-lg font-bold text-secondary-white">
                  Araç Geçmişi: {vehicleHistory.vehicle.plate}
                </h2>
                <p className="text-xs text-text-gray mt-1">
                  {vehicleHistory.vehicle.brand} {vehicleHistory.vehicle.model} - {vehicleHistory.vehicle.customerName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 bg-green-600 text-primary-white rounded text-xs font-medium transition-all btn-touch hover:bg-green-700 active:scale-95"
                  onClick={exportHistoryToPDF}
                >
                  📄 PDF İndir
                </button>
                <button 
                  className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                  onClick={closeHistoryModal}
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Özet Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-primary-black p-4 rounded-lg border border-border-color">
                  <div className="text-text-gray text-xs mb-1">Toplam Tamir</div>
                  <div className="text-xl font-bold text-primary-white">{vehicleHistory.totalRepairs}</div>
                </div>
                <div className="bg-primary-black p-4 rounded-lg border border-border-color">
                  <div className="text-text-gray text-xs mb-1">Toplam Harcama</div>
                  <div className="text-xl font-bold text-primary-red">{vehicleHistory.totalCost.toFixed(2)} ₺</div>
                </div>
              </div>

              {/* Tamir Geçmişi */}
              <h3 className="text-sm font-semibold text-secondary-white mb-3">Tamir Kayıtları</h3>
              
              {vehicleHistory.repairs.length === 0 ? (
                <div className="text-center text-text-gray text-xs py-8">
                  Bu araç için henüz tamir kaydı yok
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleHistory.repairs.map(repair => (
                    <div key={repair._id} className="bg-primary-black p-4 rounded-lg border border-border-color">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs text-text-gray">
                            {new Date(repair.date).toLocaleDateString('tr-TR')}
                          </div>
                          {repair.currentKm && (
                            <div className="text-xs text-text-gray">
                              KM: {repair.currentKm.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-primary-red">
                          {repair.totalCost.toFixed(2)} ₺
                        </div>
                      </div>

                      {repair.currentIssues && (
                        <div className="mb-2">
                          <div className="text-xs text-text-gray">Arızalar:</div>
                          <div className="text-xs text-primary-white">{repair.currentIssues}</div>
                        </div>
                      )}

                      <div className="mb-2">
                        <div className="text-xs text-text-gray">Yapılan İşlem:</div>
                        <div className="text-xs text-primary-white">{repair.description}</div>
                      </div>

                      {repair.parts && repair.parts.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-text-gray mb-1">Kullanılan Parçalar:</div>
                          <div className="space-y-1">
                            {repair.parts.map((p, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-primary-white bg-secondary-black p-2 rounded">
                                <span>{p.part.name} x{p.quantity}</span>
                                <span className="text-primary-red">{(p.quantity * p.price).toFixed(2)} ₺</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-xs pt-2 border-t border-border-color">
                        <span className="text-text-gray">İşçilik: {repair.laborCost.toFixed(2)} ₺</span>
                        <span className="text-text-gray">Parça: {repair.partsCost.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-4 mt-4 border-t border-border-color">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                  onClick={closeHistoryModal}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerVehicles

