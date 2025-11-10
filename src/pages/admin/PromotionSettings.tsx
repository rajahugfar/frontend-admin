import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiGift, FiX, FiImage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import ImageUploadModal from '@/components/admin/ImageUploadModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

interface Promotion {
  id: string
  code: string
  name: string
  description: string
  type: string // new_member, daily_first, normal, cashback, deposit
  bonusType?: string // API uses bonusType (camelCase)
  bonus_type?: 'percentage' | 'fixed' // Frontend uses bonus_type (snake_case)
  bonusValue?: number // API uses bonusValue
  bonus_value?: number // Frontend uses bonus_value
  maxBonus?: number // API uses maxBonus
  max_bonus?: number // Frontend uses max_bonus
  minDeposit?: number // API uses minDeposit
  min_deposit?: number // Frontend uses min_deposit
  turnoverRequirement?: number // API uses turnoverRequirement
  turnover_requirement?: number // Frontend uses turnover_requirement
  maxWithdraw?: number // API uses maxWithdraw
  max_withdraw?: number // Frontend uses max_withdraw
  imageUrl?: string // API uses imageUrl
  image_url?: string // Frontend uses image_url
  isActive?: boolean // API uses isActive
  is_active?: boolean // Frontend uses is_active
  termsAndConditions?: string // API uses termsAndConditions
  terms_and_conditions?: string // Frontend uses terms_and_conditions
}

const PromotionSettings = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [showImageModal, setShowImageModal] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'normal',
    bonus_type: 'percentage' as 'percentage' | 'fixed',
    bonus_value: 0,
    max_bonus: 0,
    min_deposit: 1,
    turnover_requirement: 1,
    max_withdraw: 0,
    image_url: '',
    is_active: true,
    terms_and_conditions: ''
  })

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    try {
      setLoading(true)
      const adminSelector = localStorage.getItem('admin_selector')
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions`, {
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        // API returns data.promotions, not data.data
        const promotionsData = Array.isArray(data.data?.promotions) 
          ? data.data.promotions 
          : Array.isArray(data.data) 
            ? data.data 
            : []
        setPromotions(promotionsData)
      } else {
        setPromotions([])
      }
    } catch (error) {
      console.error('Error loading promotions:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
      setPromotions([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (promo?: Promotion) => {
    if (promo) {
      setEditingPromo(promo)
      setFormData({
        code: promo.code,
        name: promo.name,
        description: promo.description,
        type: promo.type,
        bonus_type: (promo.bonus_type || promo.bonusType || 'percentage') as 'percentage' | 'fixed',
        bonus_value: promo.bonus_value || promo.bonusValue || 0,
        max_bonus: promo.max_bonus || promo.maxBonus || 0,
        min_deposit: promo.min_deposit || promo.minDeposit || 1,
        turnover_requirement: promo.turnover_requirement || promo.turnoverRequirement || 1,
        max_withdraw: promo.max_withdraw || promo.maxWithdraw || 0,
        image_url: promo.image_url || promo.imageUrl || '',
        is_active: promo.is_active !== undefined ? promo.is_active : promo.isActive !== undefined ? promo.isActive : true,
        terms_and_conditions: promo.terms_and_conditions || promo.termsAndConditions || ''
      })
      setImagePreview(promo.image_url || promo.imageUrl || '')
    } else {
      setEditingPromo(null)
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'normal',
        bonus_type: 'percentage',
        bonus_value: 0,
        max_bonus: 0,
        min_deposit: 1,
        turnover_requirement: 1,
        max_withdraw: 0,
        image_url: '',
        is_active: true,
        terms_and_conditions: ''
      })
      setImagePreview('')
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const adminSelector = localStorage.getItem('admin_selector')
      const url = editingPromo 
        ? `${API_URL}${API_BASE_PATH}/admin/promotions/${editingPromo.id}`
        : `${API_URL}${API_BASE_PATH}/admin/promotions`
      
      const response = await fetch(url, {
        method: editingPromo ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(editingPromo ? 'แก้ไขโปรโมชั่นสำเร็จ' : 'เพิ่มโปรโมชั่นสำเร็จ')
        setShowModal(false)
        loadPromotions()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error saving promotion:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบโปรโมชั่น "${name}" ใช่หรือไม่?`)) return

    try {
      const adminSelector = localStorage.getItem('admin_selector')
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('ลบโปรโมชั่นสำเร็จ')
        loadPromotions()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
      toast.error('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'new_member': 'ลูกค้าใหม่ (รับได้ครั้งเดียว)',
      'daily_first': 'ครั้งแรกของวัน (รับได้ 1 ครั้งต่อวัน)',
      'normal': 'โปรปกติ (รับได้ตลอด)',
      'cashback': 'CashBack'
    }
    return types[type] || type
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gold-500">จัดการโปรโมชั่น</h1>
        <p className="text-brown-400 mt-1">สร้าง แก้ไข และจัดการโปรโมชั่นทั้งหมด</p>
      </div>

      {/* Add Button */}
      <div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium shadow-lg"
        >
          <FiPlus />
          เพิ่มโปรโมชั่น
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <FiGift className="mx-auto text-6xl text-brown-500 mb-4" />
          <p className="text-brown-400">ยังไม่มีโปรโมชั่น</p>
        </div>
      ) : (
        /* Promotions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-admin-card border border-admin-border rounded-xl p-6 shadow-lg hover:border-gold-500/50 transition-all">
              {/* Title */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gold-500">{promo.name}</h3>
              </div>

              {/* Image */}
              <div className="mb-4">
                <img
                  src={(() => {
                    const imageUrl = promo.image_url || promo.imageUrl || ''
                    // If already has http, use as is
                    if (imageUrl.startsWith('http')) return imageUrl
                    // If starts with /images/, convert to /uploads/promotions/
                    if (imageUrl.startsWith('/images/')) {
                      const filename = imageUrl.split('/').pop()
                      return `${API_URL}/uploads/promotions/${filename}`
                    }
                    // If starts with /uploads/, prepend API_URL
                    if (imageUrl.startsWith('/uploads/')) {
                      return `${API_URL}${imageUrl}`
                    }
                    // Default fallback
                    return `${API_URL}/uploads/promotions/promo-1.jpg`
                  })()}
                  alt={promo.name}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `${API_URL}/uploads/promotions/promo-1.jpg`
                  }}
                />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-brown-400">รายละเอียด:</span>
                  <span className="text-brown-200 text-right flex-1 ml-2">{promo.description}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">การคำนวนโบนัส:</span>
                  <span className="text-brown-200">
                    {(promo.bonus_type || promo.bonusType) === 'percentage' ? 'เปอร์เซ็น' : 'เครดิต'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">จำนวนรางวัล:</span>
                  <span className="text-gold-500 font-semibold">
                    {(promo.bonus_type || promo.bonusType) === 'percentage' 
                      ? `${promo.bonus_value || promo.bonusValue}%` 
                      : `${promo.bonus_value || promo.bonusValue} เครดิต`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">รับโบนัสสูงสุด:</span>
                  <span className="text-success font-semibold">
                    {(promo.max_bonus || promo.maxBonus) === 0 ? 'ไม่จำกัด' : `${promo.max_bonus || promo.maxBonus} เครดิต`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">ฝากเงินขั้นต่ำ:</span>
                  <span className="text-brown-200">{promo.min_deposit || promo.minDeposit} บาท</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">ประเภทโบนัส:</span>
                  <span className="text-brown-200 text-right flex-1 ml-2">
                    {getTypeLabel(promo.type)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">ยอดเทิร์น:</span>
                  <span className="text-info font-semibold">
                    มากกว่า {promo.turnover_requirement || promo.turnoverRequirement} เท่า
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">ถอนได้สูงสุด:</span>
                  <span className="text-brown-200">
                    {(promo.max_withdraw || promo.maxWithdraw) === 0 ? 'ไม่ระบุ' : `${promo.max_withdraw || promo.maxWithdraw} บาท`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brown-400">แสดงหน้าลูกค้า:</span>
                  <span className={(promo.is_active !== undefined ? promo.is_active : promo.isActive) ? 'text-success' : 'text-error'}>
                    {(promo.is_active !== undefined ? promo.is_active : promo.isActive) ? 'แสดง' : 'ไม่แสดง'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleOpenModal(promo)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium"
                >
                  <FiEdit2 />
                  แก้ไขโปรโมชั่น
                </button>

                <button
                  onClick={() => handleDelete(promo.id, promo.name)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-error/20 text-error border border-error/30 rounded-lg hover:bg-error/30 transition-colors font-medium"
                >
                  <FiTrash2 />
                  ลบโปรโมชั่น
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 shadow-xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gold-500">
                {editingPromo ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่น'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-brown-400 hover:text-gold-500"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-brown-400 mb-2">
                  รูปโปรโมชั่น <small className="text-brown-500">(ขนาดแนะนำ 680x210 px)</small>
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-admin-border rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
                >
                  <FiImage />
                  <span>{formData.image_url ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</span>
                </button>
                {formData.image_url && (
                  <div className="mt-2 relative">
                    <img
                      src={(() => {
                        const imageUrl = formData.image_url
                        // If already has http, use as is
                        if (imageUrl.startsWith('http')) return imageUrl
                        // If starts with /images/, convert to /uploads/promotions/
                        if (imageUrl.startsWith('/images/')) {
                          const filename = imageUrl.split('/').pop()
                          return `${API_URL}/uploads/promotions/${filename}`
                        }
                        // If starts with /uploads/, prepend API_URL
                        if (imageUrl.startsWith('/uploads/')) {
                          return `${API_URL}${imageUrl}`
                        }
                        // Default
                        return imageUrl
                      })()}
                      alt="Preview"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `${API_URL}/uploads/promotions/promo-1.jpg`
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image_url: '' })
                        setImagePreview('')
                      }}
                      className="absolute top-2 right-2 p-2 bg-error/80 text-white rounded-lg hover:bg-error transition-colors"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  รหัสโปรโมชั่น
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="WELCOME100"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ชื่อโปรโมชั่น *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  รายละเอียด
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input h-20 resize-none"
                />
              </div>

              {/* Bonus Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  การคำนวนโบนัส
                </label>
                <select
                  value={formData.bonus_type}
                  onChange={(e) => setFormData({ ...formData, bonus_type: e.target.value as 'percentage' | 'fixed' })}
                  className="input"
                >
                  <option value="percentage">เปอร์เซ็น</option>
                  <option value="fixed">เครดิต</option>
                </select>
              </div>

              {/* Bonus Value */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  จำนวนรางวัล (% หรือ เครดิต)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bonus_value}
                  onChange={(e) => setFormData({ ...formData, bonus_value: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              {/* Max Bonus */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  รับโบนัสสูงสุด <small className="text-red-400">(0 = ไม่จำกัด)</small>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.max_bonus}
                  onChange={(e) => setFormData({ ...formData, max_bonus: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              {/* Min Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ฝากเงินขั้นต่ำ <small className="text-red-400">(ขั้นต่ำ 1 บาท)</small>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.min_deposit}
                  onChange={(e) => setFormData({ ...formData, min_deposit: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ประเภทโบนัส
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="new_member">ลูกค้าใหม่ (รับได้ครั้งเดียว)</option>
                  <option value="daily_first">ครั้งแรกของวัน (รับได้ 1 ครั้งต่อวัน)</option>
                  <option value="normal">โปรปกติ (รับได้ตลอด)</option>
                  <option value="cashback">CashBack</option>
                </select>
              </div>

              {/* Turnover */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ยอดเทิร์น (เท่า)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.turnover_requirement}
                  onChange={(e) => setFormData({ ...formData, turnover_requirement: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              {/* Max Withdraw */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ถอนได้สูงสุด <small className="text-red-400">(0 = ไม่จำกัด)</small>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.max_withdraw}
                  onChange={(e) => setFormData({ ...formData, max_withdraw: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  แสดงให้ลูกค้าเลือก
                </label>
                <select
                  value={formData.is_active ? '1' : '0'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                  className="input"
                >
                  <option value="1">แสดงให้ลูกค้าเห็น</option>
                  <option value="0">ไม่แสดงให้ลูกค้าเห็น</option>
                </select>
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  เงื่อนไข
                </label>
                <textarea
                  value={formData.terms_and_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                  className="input h-24 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-admin-border">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium"
              >
                บันทึก
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-admin-hover text-brown-300 rounded-lg hover:bg-admin-border transition-colors font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelect={(image) => {
          setFormData({ ...formData, image_url: image.url })
          setImagePreview(image.url)
        }}
        currentImage={formData.image_url}
      />
    </div>
  )
}

export default PromotionSettings
