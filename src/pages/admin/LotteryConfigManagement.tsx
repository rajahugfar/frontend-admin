import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, Lottery, LotteryConfig } from '../../api/adminLotteryAPI'
import toast from 'react-hot-toast'
import {
  FiEdit2, FiSave, FiX, FiRefreshCw, FiDollarSign, FiSettings,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'

const LotteryConfigManagement: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null)
  const [configs, setConfigs] = useState<LotteryConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingConfigs, setLoadingConfigs] = useState(false)
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({})
  const [editValues, setEditValues] = useState<{ [key: number]: Partial<LotteryConfig> }>({})
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedConfigs, setSelectedConfigs] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchLotteries()
  }, [])

  const fetchLotteries = async () => {
    setLoading(true)
    try {
      const data = await adminLotteryAPI.getAllLotteries()
      setLotteries(data)
      if (data.length > 0 && !selectedLottery) {
        setSelectedLottery(data[0])
        fetchConfigs(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      toast.error('ไม่สามารถโหลดข้อมูลหวยได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigs = async (lotteryId: number) => {
    setLoadingConfigs(true)
    try {
      const data = await adminLotteryAPI.getLotteryConfig(lotteryId.toString())
      setConfigs(data)
      setEditMode({})
      setEditValues({})
      setSelectedConfigs(new Set())
    } catch (error) {
      console.error('Failed to fetch configs:', error)
      toast.error('ไม่สามารถโหลดค่าคอนฟิกได้')
    } finally {
      setLoadingConfigs(false)
    }
  }

  const handleLotterySelect = (lottery: Lottery) => {
    setSelectedLottery(lottery)
    fetchConfigs(lottery.id)
  }

  const handleInitDefaults = async () => {
    if (!selectedLottery) return

    const confirmed = window.confirm(
      `คุณต้องการสร้างค่าเริ่มต้นสำหรับ ${selectedLottery.huayName} หรือไม่?`
    )

    if (!confirmed) return

    try {
      await adminLotteryAPI.initDefaultConfigs(
        selectedLottery.id.toString(),
        selectedLottery.huayType
      )
      toast.success('สร้างค่าเริ่มต้นสำเร็จ')
      fetchConfigs(selectedLottery.id)
    } catch (error: any) {
      console.error('Failed to init defaults:', error)
      if (error.response?.data?.message?.includes('duplicate key')) {
        toast.error('มีค่าคอนฟิกอยู่แล้ว')
      } else {
        toast.error('ไม่สามารถสร้างค่าเริ่มต้นได้')
      }
    }
  }

  const handleEditClick = (config: LotteryConfig) => {
    setEditMode({ ...editMode, [config.id]: true })
    setEditValues({
      ...editValues,
      [config.id]: {
        multiply: config.multiply,
        minPrice: config.minPrice,
        maxPrice: config.maxPrice,
        maxPricePerNum: config.maxPricePerNum,
        maxPricePerUser: config.maxPricePerUser,
      }
    })
  }

  const handleCancelEdit = (configId: number) => {
    const newEditMode = { ...editMode }
    delete newEditMode[configId]
    setEditMode(newEditMode)

    const newEditValues = { ...editValues }
    delete newEditValues[configId]
    setEditValues(newEditValues)
  }

  const handleSaveEdit = async (config: LotteryConfig) => {
    const updates = editValues[config.id]
    if (!updates) return

    try {
      await adminLotteryAPI.updateConfig(config.id, updates)
      toast.success('อัพเดทสำเร็จ')
      handleCancelEdit(config.id)
      if (selectedLottery) {
        fetchConfigs(selectedLottery.id)
      }
    } catch (error) {
      console.error('Failed to update config:', error)
      toast.error('ไม่สามารถอัพเดทได้')
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedConfigs.size === 0) {
      toast.error('กรุณาเลือกรายการที่ต้องการอัพเดท')
      return
    }

    const updates = Array.from(selectedConfigs).map(id => {
      const config = configs.find(c => c.id === id)
      const editValue = editValues[id]
      return {
        id,
        multiply: editValue?.multiply,
        maxPrice: editValue?.maxPrice,
      }
    }).filter(u => u.multiply !== undefined || u.maxPrice !== undefined)

    if (updates.length === 0) {
      toast.error('ไม่มีการเปลี่ยนแปลง')
      return
    }

    try {
      await adminLotteryAPI.bulkUpdateConfigs(updates)
      toast.success(`อัพเดท ${updates.length} รายการสำเร็จ`)
      setBulkEditMode(false)
      setSelectedConfigs(new Set())
      setEditValues({})
      if (selectedLottery) {
        fetchConfigs(selectedLottery.id)
      }
    } catch (error) {
      console.error('Failed to bulk update:', error)
      toast.error('ไม่สามารถอัพเดทได้')
    }
  }

  const toggleSelectConfig = (configId: number) => {
    const newSelected = new Set(selectedConfigs)
    if (newSelected.has(configId)) {
      newSelected.delete(configId)
    } else {
      newSelected.add(configId)
    }
    setSelectedConfigs(newSelected)
  }

  const getOptionTypeLabel = (optionType: string): string => {
    const labels: { [key: string]: string } = {
      'teng_bon_4': '4 ตัวบน',
      'tode_4': '4 ตัวโต๊ด',
      'teng_bon_3': '3 ตัวบน',
      'tode_3': '3 ตัวโต๊ด',
      'teng_lang_3': '3 ตัวล่าง',
      'teng_bon_2': '2 ตัวบน',
      'teng_lang_2': '2 ตัวล่าง',
      'teng_bon_1': 'วิ่งบน',
      'teng_lang_1': 'วิ่งล่าง',
    }
    return labels[optionType] || optionType
  }

  const getTypeConfigLabel = (typeConfig: number): string => {
    return typeConfig === 1 ? 'อัตราจ่าย' : 'ลิมิต'
  }

  const getTypeConfigBadge = (typeConfig: number): string => {
    return typeConfig === 1 ? 'bg-green-500' : 'bg-blue-500'
  }

  const payoutConfigs = configs.filter(c => c.typeConfig === 1)
  const limitConfigs = configs.filter(c => c.typeConfig === 2)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการค่าคอนฟิกหวย</h1>
        <p className="text-gray-600">จัดการอัตราจ่ายและลิมิตการแทงหวย</p>
      </div>

      {/* Lottery Selector */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">เลือกหวย</label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {lotteries.map((lottery) => (
            <button
              key={lottery.id}
              onClick={() => handleLotterySelect(lottery)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedLottery?.id === lottery.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'
              }`}
            >
              <div className="text-sm font-medium">{lottery.huayName}</div>
              <div className="text-xs text-gray-500 mt-1">{lottery.huayCode}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      {selectedLottery && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleInitDefaults}
            disabled={loadingConfigs}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <FiRefreshCw />
            สร้างค่าเริ่มต้น
          </button>
          <button
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              bulkEditMode
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiSettings />
            {bulkEditMode ? 'ยกเลิกแก้ไขแบบกลุ่ม' : 'แก้ไขแบบกลุ่ม'}
          </button>
          {bulkEditMode && selectedConfigs.size > 0 && (
            <button
              onClick={handleBulkUpdate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FiSave />
              บันทึก {selectedConfigs.size} รายการ
            </button>
          )}
        </div>
      )}

      {/* Configs Display */}
      {selectedLottery && (
        <div className="space-y-6">
          {/* Payout Rates */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-green-50 px-6 py-3 border-b border-green-100">
              <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                <FiDollarSign />
                อัตราจ่าย (Payout Rates)
              </h3>
            </div>
            {loadingConfigs ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">กำลังโหลด...</p>
              </div>
            ) : (
              <div className="p-6">
                {payoutConfigs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiAlertCircle className="mx-auto mb-2" size={24} />
                    <p>ไม่พบค่าคอนฟิกอัตราจ่าย</p>
                    <p className="text-sm">คลิก "สร้างค่าเริ่มต้น" เพื่อเริ่มต้น</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payoutConfigs.map((config) => (
                      <ConfigCard
                        key={config.id}
                        config={config}
                        editMode={editMode[config.id] || false}
                        editValues={editValues[config.id]}
                        bulkEditMode={bulkEditMode}
                        isSelected={selectedConfigs.has(config.id)}
                        onToggleSelect={() => toggleSelectConfig(config.id)}
                        onEdit={() => handleEditClick(config)}
                        onSave={() => handleSaveEdit(config)}
                        onCancel={() => handleCancelEdit(config.id)}
                        onEditValueChange={(field, value) => {
                          setEditValues({
                            ...editValues,
                            [config.id]: {
                              ...editValues[config.id],
                              [field]: value,
                            },
                          })
                        }}
                        getOptionTypeLabel={getOptionTypeLabel}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Betting Limits */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
              <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <FiSettings />
                ลิมิตการแทง (Betting Limits)
              </h3>
            </div>
            {loadingConfigs ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">กำลังโหลด...</p>
              </div>
            ) : (
              <div className="p-6">
                {limitConfigs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiAlertCircle className="mx-auto mb-2" size={24} />
                    <p>ไม่พบค่าคอนฟิกลิมิต</p>
                    <p className="text-sm">คลิก "สร้างค่าเริ่มต้น" เพื่อเริ่มต้น</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {limitConfigs.map((config) => (
                      <ConfigCard
                        key={config.id}
                        config={config}
                        editMode={editMode[config.id] || false}
                        editValues={editValues[config.id]}
                        bulkEditMode={bulkEditMode}
                        isSelected={selectedConfigs.has(config.id)}
                        onToggleSelect={() => toggleSelectConfig(config.id)}
                        onEdit={() => handleEditClick(config)}
                        onSave={() => handleSaveEdit(config)}
                        onCancel={() => handleCancelEdit(config.id)}
                        onEditValueChange={(field, value) => {
                          setEditValues({
                            ...editValues,
                            [config.id]: {
                              ...editValues[config.id],
                              [field]: value,
                            },
                          })
                        }}
                        getOptionTypeLabel={getOptionTypeLabel}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Config Card Component
interface ConfigCardProps {
  config: LotteryConfig
  editMode: boolean
  editValues?: Partial<LotteryConfig>
  bulkEditMode: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditValueChange: (field: string, value: any) => void
  getOptionTypeLabel: (optionType: string) => string
}

const ConfigCard: React.FC<ConfigCardProps> = ({
  config,
  editMode,
  editValues,
  bulkEditMode,
  isSelected,
  onToggleSelect,
  onEdit,
  onSave,
  onCancel,
  onEditValueChange,
  getOptionTypeLabel,
}) => {
  const isPayout = config.typeConfig === 1

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        bulkEditMode && isSelected
          ? 'border-purple-500 bg-purple-50'
          : editMode
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {bulkEditMode && (
        <div className="mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 text-purple-600"
          />
          <label className="ml-2 text-sm text-gray-700">เลือกรายการนี้</label>
        </div>
      )}

      <div className="mb-3">
        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {getOptionTypeLabel(config.optionType)}
          {config.status ? (
            <FiCheckCircle className="text-green-500" size={16} />
          ) : (
            <FiAlertCircle className="text-red-500" size={16} />
          )}
        </h4>
        <p className="text-xs text-gray-500">
          {isPayout ? 'อัตราจ่าย' : 'ลิมิตการแทง'}
        </p>
      </div>

      {editMode ? (
        <div className="space-y-3">
          {isPayout && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                อัตราจ่าย (Multiply)
              </label>
              <input
                type="number"
                step="0.01"
                value={editValues?.multiply ?? config.multiply}
                onChange={(e) => onEditValueChange('multiply', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {!isPayout && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ขั้นต่ำ (Min)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues?.minPrice ?? config.minPrice}
                  onChange={(e) => onEditValueChange('minPrice', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  สูงสุด (Max)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues?.maxPrice ?? config.maxPrice}
                  onChange={(e) => onEditValueChange('maxPrice', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  สูงสุดต่อเลข
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues?.maxPricePerNum ?? config.maxPricePerNum}
                  onChange={(e) => onEditValueChange('maxPricePerNum', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  สูงสุดต่อคน
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues?.maxPricePerUser ?? config.maxPricePerUser}
                  onChange={(e) => onEditValueChange('maxPricePerUser', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
            >
              <FiSave size={14} />
              บันทึก
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center justify-center gap-1"
            >
              <FiX size={14} />
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {isPayout ? (
            <div className="text-center py-2">
              <div className="text-3xl font-bold text-green-600">
                {config.multiply}x
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ขั้นต่ำ:</span>
                <span className="font-medium">{config.minPrice.toLocaleString('th-TH')} ฿</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สูงสุด:</span>
                <span className="font-medium">{config.maxPrice.toLocaleString('th-TH')} ฿</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สูงสุด/เลข:</span>
                <span className="font-medium">{config.maxPricePerNum.toLocaleString('th-TH')} ฿</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สูงสุด/คน:</span>
                <span className="font-medium">{config.maxPricePerUser.toLocaleString('th-TH')} ฿</span>
              </div>
            </div>
          )}
          {!bulkEditMode && (
            <button
              onClick={onEdit}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
            >
              <FiEdit2 size={14} />
              แก้ไข
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default LotteryConfigManagement
