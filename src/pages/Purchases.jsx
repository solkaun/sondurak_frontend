import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const Purchases = () => {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchPart, setSearchPart] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  })
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    partName: '',
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const fetchData = async () => {
    try {
      // Filtre ve pagination için query params oluştur
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedSupplier) params.append('supplier', selectedSupplier);
      params.append('page', currentPage);
      params.append('limit', 50);

      const queryString = params.toString();

      const [purchasesRes, suppliersRes, partsRes] = await Promise.all([
        api.get(`/purchases?${queryString}`),
        api.get('/suppliers'),
        api.get('/parts')
      ])
      
      setPurchases(purchasesRes.data.purchases)
      setPagination(purchasesRes.data.pagination)
      setSuppliers(suppliersRes.data)
      setParts(partsRes.data)
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = () => {
    setCurrentPage(1) // Filtreleme yaparken ilk sayfaya dön
    setLoading(true)
    setTimeout(() => fetchData(), 100)
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setSelectedSupplier('')
    setCurrentPage(1)
    setLoading(true)
    setTimeout(() => fetchData(), 100)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    setLoading(true)
    setTimeout(() => fetchData(), 100)
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape', // Yatay sayfa - daha geniş tablo için
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // ============ HEADER ============
    // Kırmızı header bar
    doc.setFillColor(220, 38, 38) // primary-red
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    // Şirket adı (beyaz, bold)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('SON DURAK', pageWidth / 2, 15, { align: 'center' })
    
    // Alt başlık
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.text('Oto Elektrik & Tamir Servisi', pageWidth / 2, 22, { align: 'center' })
    doc.text('Parça Satın Alım Raporu', pageWidth / 2, 28, { align: 'center' })
    
    // ============ RAPOR BİLGİLERİ ============
    let yPos = 45
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    
    // Rapor tarihi (sağ üst)
    const reportDate = new Date().toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Rapor Tarihi: ${reportDate}`, pageWidth - 14, yPos, { align: 'right' })
    yPos += 6
    
    // ============ FİLTRELER ============
    if (startDate || endDate || selectedSupplier) {
      doc.setFillColor(245, 245, 245) // Açık gri arka plan
      doc.rect(14, yPos - 4, pageWidth - 28, 18, 'F')
      
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text('Uygulanan Filtreler:', 18, yPos)
      
      doc.setFont(undefined, 'normal')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      yPos += 6
      
      let filterText = []
      if (startDate) {
        filterText.push(`Başlangıç: ${new Date(startDate).toLocaleDateString('tr-TR')}`)
      }
      if (endDate) {
        filterText.push(`Bitiş: ${new Date(endDate).toLocaleDateString('tr-TR')}`)
      }
      if (selectedSupplier) {
        const supplier = suppliers.find(s => s._id === selectedSupplier)
        filterText.push(`Parçacı: ${supplier?.shopName || '-'}`)
      }
      
      doc.text(filterText.join('  •  '), 18, yPos)
      yPos += 10
    } else {
      yPos += 5
    }
    
    // ============ TABLO ============
    const tableData = purchases.map((purchase, index) => [
      (index + 1).toString(),
      new Date(purchase.date).toLocaleDateString('tr-TR'),
      purchase.supplier.shopName || '-',
      purchase.part.name || '-',
      purchase.quantity.toString(),
      `${purchase.price.toFixed(2)} ₺`,
      `${purchase.totalCost.toFixed(2)} ₺`,
      purchase.createdBy 
        ? `${purchase.createdBy.firstName} ${purchase.createdBy.lastName}` 
        : '-'
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Tarih', 'Parçacı', 'Parça Adı', 'Adet', 'Birim Fiyat', 'Toplam', 'Ekleyen']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [220, 38, 38], // Kırmızı
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // #
        1: { halign: 'center', cellWidth: 25 }, // Tarih
        2: { halign: 'left', cellWidth: 40 },   // Parçacı
        3: { halign: 'left', cellWidth: 50 },   // Parça
        4: { halign: 'center', cellWidth: 15 }, // Adet
        5: { halign: 'right', cellWidth: 25 },  // Birim Fiyat
        6: { halign: 'right', cellWidth: 25 },  // Toplam
        7: { halign: 'left', cellWidth: 35 }    // Ekleyen
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250] // Zebra stripes
      },
      margin: { left: 14, right: 14 }
    })
    
    // ============ ÖZET TABLOSU ============
    const finalY = doc.lastAutoTable.finalY + 10
    const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0)
    const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0)
    
    // Özet kutusu
    const summaryX = pageWidth - 80
    const summaryY = finalY
    const summaryWidth = 65
    
    // Kutu çerçevesi
    doc.setFillColor(245, 245, 245)
    doc.rect(summaryX, summaryY, summaryWidth, 25, 'F')
    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.5)
    doc.rect(summaryX, summaryY, summaryWidth, 25, 'S')
    
    // Özet başlık
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text('Rapor Özeti', summaryX + 32.5, summaryY + 6, { align: 'center' })
    
    // Özet değerleri
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Toplam Kayıt:`, summaryX + 5, summaryY + 12)
    doc.setFont(undefined, 'bold')
    doc.text(`${pagination.totalItems}`, summaryX + summaryWidth - 5, summaryY + 12, { align: 'right' })
    
    doc.setFont(undefined, 'normal')
    doc.text(`Toplam Adet:`, summaryX + 5, summaryY + 17)
    doc.setFont(undefined, 'bold')
    doc.text(`${totalQuantity}`, summaryX + summaryWidth - 5, summaryY + 17, { align: 'right' })
    
    doc.setFont(undefined, 'normal')
    doc.text(`Toplam Tutar:`, summaryX + 5, summaryY + 22)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text(`${totalCost.toFixed(2)} ₺`, summaryX + summaryWidth - 5, summaryY + 22, { align: 'right' })
    
    // ============ FOOTER ============
    doc.setTextColor(120, 120, 120)
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text(
      'Bu rapor Son Durak Oto Elektrik tarafından otomatik olarak oluşturulmuştur.',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    
    // Sayfa numarası
    doc.setFont(undefined, 'normal')
    doc.text(`Sayfa 1`, pageWidth - 14, pageHeight - 10, { align: 'right' })
    
    // ============ KAYDET ============
    const fileName = `SonDurak_Parca_Raporu_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    setSubmitting(true)
    try {
      await api.delete(`/purchases/${id}`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Silme hatası')
    } finally {
      setSubmitting(false)
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-border-color border-t-primary-red rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-secondary-white">Parça Satın Alımları</h1>
          <button 
            className="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary-red text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-primary-red-hover active:scale-95"
            onClick={() => openModal()}
          >
            + Yeni Satın Alım
          </button>
        </div>

        {/* Filtreler */}
        <div className="bg-secondary-black border border-border-color rounded-lg p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Başlangıç Tarihi</label>
                <input
                  type="date"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Parçacı</label>
                <select
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="">Tümü</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.shopName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-blue-700 active:scale-95"
                onClick={handleFilterChange}
              >
                🔍 Filtrele
              </button>
              <button
                className="flex-1 sm:flex-none px-4 py-2 bg-border-color text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-text-gray active:scale-95"
                onClick={clearFilters}
              >
                ✖ Temizle
              </button>
              <button
                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-primary-white rounded-md text-sm font-medium transition-all btn-touch hover:bg-green-700 active:scale-95"
                onClick={exportToPDF}
                disabled={purchases.length === 0}
              >
                📄 PDF İndir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary-black rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-black border-b border-border-color">
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Tarih</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Parçacı</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Parça Adı</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Adet</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Birim Fiyat</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Toplam</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">Ekleyen</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-white">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase._id} className="border-b border-border-color hover:bg-primary-black/50 transition-colors">
                  <td className="px-3 py-2 text-xs text-primary-white">{new Date(purchase.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{purchase.supplier.shopName}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{purchase.part.name}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{purchase.quantity}</td>
                  <td className="px-3 py-2 text-xs text-primary-white">{purchase.price.toFixed(2)} ₺</td>
                  <td className="px-3 py-2 text-xs text-primary-red font-semibold">{purchase.totalCost.toFixed(2)} ₺</td>
                  <td className="px-3 py-2 text-xs text-primary-white">
                    {purchase.createdBy ? 
                      `${purchase.createdBy.firstName} ${purchase.createdBy.lastName}` : 
                      '-'
                    }
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      {/* User sadece kendi kayıtlarını, Admin tümünü düzenleyebilir */}
                      {(user?.role === 'admin' || purchase.createdBy?._id === user?._id) && (
                        <button 
                          className="px-2.5 py-1 bg-border-color text-primary-white rounded text-xs transition-all btn-touch hover:bg-text-gray active:scale-95 disabled:opacity-50"
                          onClick={() => openModal(purchase)}
                          disabled={submitting}
                        >
                          Düzenle
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button 
                          className="px-2.5 py-1 bg-primary-red text-primary-white rounded text-xs transition-all btn-touch hover:bg-primary-red-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(purchase._id)}
                          disabled={submitting}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-6 text-center text-text-gray text-xs">
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
            <div className="flex justify-between items-center p-4 border-b border-border-color sticky top-0 bg-secondary-black z-10">
              <h2 className="text-lg font-bold text-secondary-white">
                {editingId ? 'Satın Alım Düzenle' : 'Yeni Satın Alım'}
              </h2>
              <button 
                className="text-3xl text-text-gray hover:text-primary-red transition-colors"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Tarih</label>
                <input
                  type="date"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Parçacı</label>
                <select
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
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

              <div className="relative">
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Parça Adı</label>
                <input
                  type="text"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={formData.partName}
                  onChange={e => {
                    setFormData({ ...formData, partName: e.target.value })
                    setSearchPart(e.target.value)
                  }}
                  placeholder="Parça adı yazın veya seçin"
                  required
                />
                {searchPart && filteredParts.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-primary-black border border-border-color rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredParts.slice(0, 5).map(part => (
                      <div
                        key={part._id}
                        className="px-3 py-2 text-primary-white text-sm hover:bg-secondary-black cursor-pointer transition-colors"
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

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Adet</label>
                <input
                  type="number"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Birim Fiyat (₺)</label>
                <input
                  type="number"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-white text-sm focus:outline-none focus:border-primary-red"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-secondary-white font-medium text-xs">Toplam</label>
                <input
                  type="text"
                  className="w-full p-2 bg-primary-black border border-border-color rounded-md text-primary-red text-sm font-semibold opacity-75 cursor-not-allowed"
                  value={`${(formData.quantity * formData.price).toFixed(2)} ₺`}
                  disabled
                />
              </div>

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
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Purchases

