import React, { useState, useEffect, useMemo } from 'react'
import { FiX, FiPlus, FiEdit2, FiTrash2, FiStar, FiAlertCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { Lottery } from '@/api/adminLotteryAPI'
import { adminHuayConfigAPI, HuayConfig, CreateHuayConfigRequest } from '@/api/adminHuayConfigAPI'
import toast from 'react-hot-toast'

interface HuayConfigModalProps {
  isOpen: boolean
  onClose: () => void
  lottery: Lottery
}

type TabType = 1 | 2 // 1 = payout, 2 = limits
type SortField = 'optionType' | 'minPrice' | 'maxPrice' | 'multiply' | 'status' | 'default'
type SortOrder = 'asc' | 'desc'

const OPTION_TYPES = [
  { value: 'teng_bon_4', label: '4 ตัวบน', shortLabel: '4บน' },
  { value: 'tode_4', label: '4 ตัวโต๊ด', shortLabel: '4โต๊ด' },
  { value: 'teng_bon_3', label: '3 ตัวบน', shortLabel: '3บน' },
  { value: 'tode_3', label: '3 ตัวโต๊ด', shortLabel: '3โต๊ด' },
  { value: 'teng_lang_nha_3', label: '3 ตัวหน้า', shortLabel: '3หน้า', gloOnly: true },
  { value: 'teng_lang_3', label: '3 ตัวหลัง', shortLabel: '3หลัง', gloOnly: true },
  { value: 'teng_bon_2', label: '2 ตัวบน', shortLabel: '2บน' },
  { value: 'teng_lang_2', label: '2 ตัวล่าง', shortLabel: '2ล่าง' },
  { value: 'teng_bon_1', label: 'วิ่งบน', shortLabel: 'วิ่งบน' },
  { value: 'teng_lang_1', label: 'วิ่งล่าง', shortLabel: 'วิ่งล่าง' }
]

const HuayConfigModal: React.FC<HuayConfigModalProps> = ({ isOpen, onClose, lottery }) => {
  const [activeTab, setActiveTab] = useState<TabType>(1)
  const [configs, setConfigs] = useState<HuayConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<HuayConfig | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sortField, setSortField] = useState<SortField>('optionType')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const [formData, setFormData] = useState<CreateHuayConfigRequest>({
    optionType: 'teng_bon_3',
    minPrice: 1,
    maxPrice: 10000,
    multiply: 850,
    status: 1,
    default: 0,
    maxPricePerNum: 0,
    maxPricePerUser: 0,
    typeConfig: 1
  })

  useEffect(() => {
    if (isOpen) {
      fetchConfigs()
    }
  }, [isOpen, activeTab, lottery.id])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const data = await adminHuayConfigAPI.getConfigsByLottery(lottery.id, activeTab)
      setConfigs(data)
    } catch (error) {
      console.error('Failed to fetch configs:', error)
      toast.error('ไม่สามารถโหลดข้อมูล Config ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedConfigs = useMemo(() => {
    const sorted = [...configs].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle string comparison for optionType
      if (sortField === 'optionType') {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [configs, sortField, sortOrder])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setShowForm(false)
    setEditingConfig(null)
  }

  // Filter option types based on lottery code
  const getAvailableOptionTypes = () => {
    const isGLO = lottery.huayCode === 'GLO'
    if (isGLO) {
      return OPTION_TYPES // GLO shows all types
    }
    return OPTION_TYPES.filter(type => !type.gloOnly) // Others exclude GLO-only types
  }

  const handleAddNew = () => {
    setEditingConfig(null)
    setFormData({
      optionType: 'teng_bon_3',
      minPrice: 1,
      maxPrice: 10000,
      multiply: activeTab === 1 ? 850 : 0,
      status: 1,
      default: 0,
      maxPricePerNum: 0,
      maxPricePerUser: 0,
      typeConfig: activeTab
    })
    setShowForm(true)
  }

  const handleEdit = (config: HuayConfig) => {
    setEditingConfig(config)
    setFormData({
      optionType: config.optionType,
      minPrice: config.minPrice,
      maxPrice: config.maxPrice,
      multiply: config.multiply,
      status: config.status,
      default: config.default,
      maxPricePerNum: config.maxPricePerNum || 0,
      maxPricePerUser: config.maxPricePerUser || 0,
      typeConfig: config.typeConfig
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.optionType) {
      toast.error('กรุณาเลือกประเภท')
      return
    }

    if (formData.minPrice < 0 || formData.maxPrice < 0) {
      toast.error('ราคาต้องไม่ติดลบ')
      return
    }

    if (formData.minPrice > formData.maxPrice) {
      toast.error('ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด')
      return
    }

    if (activeTab === 1 && formData.multiply <= 0) {
      toast.error('อัตราจ่ายต้องมากกว่า 0')
      return
    }

    try {
      setSubmitting(true)
      if (editingConfig) {
        await adminHuayConfigAPI.updateConfig(editingConfig.id, formData)
        toast.success('อัปเดต Config สำเร็จ')
      } else {
        await adminHuayConfigAPI.createConfig(lottery.id, formData)
        toast.success('สร้าง Config สำเร็จ')
      }
      setShowForm(false)
      setEditingConfig(null)
      fetchConfigs()
    } catch (error: any) {
      console.error('Failed to save config:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (config: HuayConfig) => {
    if (!confirm(`คุณต้องการลบ Config "${getOptionTypeLabel(config.optionType)}" หรือไม่?`)) {
      return
    }

    try {
      await adminHuayConfigAPI.deleteConfig(config.id)
      toast.success('ลบ Config สำเร็จ')
      fetchConfigs()
    } catch (error: any) {
      console.error('Failed to delete config:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถลบ Config ได้')
    }
  }

  const handleSetDefault = async (config: HuayConfig) => {
    if (config.default === 1) {
      toast('Config นี้เป็น Default อยู่แล้ว', { icon: 'ℹ️' })
      return
    }

    try {
      await adminHuayConfigAPI.setDefault(config.id)
      toast.success('ตั้งเป็น Default สำเร็จ')
      fetchConfigs()
    } catch (error: any) {
      console.error('Failed to set default:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถตั้งเป็น Default ได้')
    }
  }

  const getOptionTypeLabel = (optionType: string): string => {
    return OPTION_TYPES.find(t => t.value === optionType)?.label || optionType
  }

  const SortHeader: React.FC<{ field: SortField; label: string; className?: string }> = ({ field, label, className = '' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-4 py-3 text-xs font-medium text-brown-300 uppercase tracking-wider cursor-pointer hover:bg-admin-hover transition-colors select-none ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{label}</span>
        {sortField === field && (
          sortOrder === 'asc' ?
            <FiArrowUp className="w-4 h-4 text-gold-500" /> :
            <FiArrowDown className="w-4 h-4 text-gold-500" />
        )}
      </div>
    </th>
  )

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success border border-success/20">
          เปิดใช้งาน
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-error/10 text-error border border-error/20">
        ปิดใช้งาน
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-20">
          <div>
            <h2 className="text-2xl font-display font-bold text-gold-500">
              จัดการ Config หวย
            </h2>
            <p className="text-brown-400 text-sm mt-1">
              {lottery.huayName} ({lottery.huayCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-admin-hover rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-brown-400 hover:text-gold-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-admin-border bg-admin-bg sticky top-[88px] z-10">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => handleTabChange(1)}
              className={`py-3 px-4 font-medium transition-all relative ${
                activeTab === 1
                  ? 'text-gold-500 border-b-2 border-gold-500'
                  : 'text-brown-400 hover:text-brown-200'
              }`}
            >
              ค่าจ่าย (Type 1)
            </button>
            <button
              onClick={() => handleTabChange(2)}
              className={`py-3 px-4 font-medium transition-all relative ${
                activeTab === 2
                  ? 'text-gold-500 border-b-2 border-gold-500'
                  : 'text-brown-400 hover:text-brown-200'
              }`}
            >
              จำกัดการแทง (Type 2)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Box */}
          <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
              <div className="text-sm text-info">
                {activeTab === 1 ? (
                  <>
                    <strong>Type 1 (ค่าจ่าย):</strong> กำหนดอัตราการจ่ายเงินรางวัลสำหรับแต่ละประเภทการเล่น
                    <br />
                    - <strong>Default = 1:</strong> ใช้เป็นอัตราจ่ายพื้นฐาน (เมื่อไม่มี Config ช่วงราคา)
                    <br />
                    - <strong>Default = 0:</strong> เป็น Config สำหรับช่วงราคาเฉพาะ (tiered config)
                  </>
                ) : (
                  <>
                    <strong>Type 2 (จำกัดการแทง):</strong> กำหนดวงเงินจำกัดการแทงต่อหมายเลขและต่อผู้ใช้
                    <br />
                    - <strong>maxPricePerNum:</strong> จำนวนเงินสูงสุดที่สามารถแทงต่อหมายเลขได้
                    <br />
                    - <strong>maxPricePerUser:</strong> จำนวนเงินสูงสุดที่ผู้ใช้แต่ละคนสามารถแทงได้
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Add Button */}
          {!showForm && (
            <div className="mb-4">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50"
              >
                <FiPlus size={20} />
                เพิ่ม Config ใหม่
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-6 bg-admin-bg border border-admin-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold-500 mb-4">
                {editingConfig ? 'แก้ไข Config' : 'เพิ่ม Config ใหม่'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option Type */}
                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-2">
                      ประเภท <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.optionType}
                      onChange={(e) => setFormData({ ...formData, optionType: e.target.value })}
                      className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required
                    >
                      {getAvailableOptionTypes().map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-2">
                      ราคาต่ำสุด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-2">
                      ราคาสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({ ...formData, maxPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Multiply (only for Type 1) */}
                  {activeTab === 1 && (
                    <div>
                      <label className="block text-sm font-medium text-brown-300 mb-2">
                        อัตราจ่าย (Multiply) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.multiply}
                        onChange={(e) => setFormData({ ...formData, multiply: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  )}

                  {/* Max Price Per Num (Type 2) */}
                  {activeTab === 2 && (
                    <div>
                      <label className="block text-sm font-medium text-brown-300 mb-2">
                        จำกัดต่อหมายเลข
                      </label>
                      <input
                        type="number"
                        value={formData.maxPricePerNum}
                        onChange={(e) => setFormData({ ...formData, maxPricePerNum: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* Max Price Per User (Type 2) */}
                  {activeTab === 2 && (
                    <div>
                      <label className="block text-sm font-medium text-brown-300 mb-2">
                        จำกัดต่อผู้ใช้
                      </label>
                      <input
                        type="number"
                        value={formData.maxPricePerUser}
                        onChange={(e) => setFormData({ ...formData, maxPricePerUser: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-2">
                      สถานะ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required
                    >
                      <option value={1}>เปิดใช้งาน</option>
                      <option value={0}>ปิดใช้งาน</option>
                    </select>
                  </div>

                  {/* Default */}
                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-2">
                      Default <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.default}
                      onChange={(e) => setFormData({ ...formData, default: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required
                    >
                      <option value={1}>Default Config</option>
                      <option value={0}>Tiered Config</option>
                    </select>
                    <p className="text-xs text-brown-500 mt-1">
                      {formData.default === 1
                        ? 'ใช้เป็น Config พื้นฐาน (เมื่อไม่ตรงกับช่วงราคา)'
                        : 'ใช้สำหรับช่วงราคาเฉพาะ (ตรงตาม minPrice-maxPrice)'}
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-admin-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingConfig(null)
                    }}
                    className="px-6 py-2 text-brown-300 bg-admin-card border border-admin-border rounded-lg hover:border-gold-500/50 transition-colors"
                    disabled={submitting}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'กำลังบันทึก...' : (editingConfig ? 'บันทึก' : 'เพิ่ม Config')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Configs Table */}
          <div className="bg-admin-bg border border-admin-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
                <p className="mt-4 text-brown-300">กำลังโหลด...</p>
              </div>
            ) : configs.length === 0 ? (
              <div className="p-8 text-center text-brown-400">
                ไม่มี Config สำหรับ {activeTab === 1 ? 'ค่าจ่าย' : 'จำกัดการแทง'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-admin-border">
                  <thead className="bg-admin-card">
                    <tr>
                      <SortHeader field="optionType" label="ประเภท" className="text-left" />
                      <th className="px-4 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                        ราคาต่ำสุด-สูงสุด
                      </th>
                      {activeTab === 1 ? (
                        <SortHeader field="multiply" label="อัตราจ่าย" className="text-center" />
                      ) : (
                        <>
                          <th className="px-4 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                            จำกัดต่อหมายเลข
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                            จำกัดต่อผู้ใช้
                          </th>
                        </>
                      )}
                      <SortHeader field="status" label="สถานะ" className="text-center" />
                      <SortHeader field="default" label="Default" className="text-center" />
                      <th className="px-4 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border">
                    {sortedConfigs.map((config) => (
                      <tr key={config.id} className="hover:bg-admin-hover transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-brown-200">
                          {getOptionTypeLabel(config.optionType)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                          {config.minPrice.toLocaleString()} - {config.maxPrice.toLocaleString()}
                        </td>
                        {activeTab === 1 ? (
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gold-500">
                            {config.multiply.toLocaleString()}
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                              {config.maxPricePerNum ? config.maxPricePerNum.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                              {config.maxPricePerUser ? config.maxPricePerUser.toLocaleString() : '-'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          {getStatusBadge(config.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          {config.default === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-warning/10 text-warning border border-warning/20">
                              <FiStar className="w-3 h-3" />
                              Default
                            </span>
                          ) : (
                            <span className="text-brown-500 text-xs">Tiered</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            {config.default !== 1 && (
                              <button
                                onClick={() => handleSetDefault(config)}
                                className="text-warning hover:text-warning/80 transition-colors"
                                title="ตั้งเป็น Default"
                              >
                                <FiStar />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(config)}
                              className="text-info hover:text-info/80 transition-colors"
                              title="แก้ไข"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(config)}
                              className="text-error hover:text-error/80 transition-colors"
                              title="ลบ"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-admin-border sticky bottom-0 bg-admin-card">
          <button
            onClick={onClose}
            className="px-6 py-2 text-brown-200 bg-admin-bg border border-admin-border rounded-lg hover:border-gold-500/50 hover:text-gold-500 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}

export default HuayConfigModal
