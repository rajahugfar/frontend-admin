import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, Lottery, PayoutTier } from '../../api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiLayers } from 'react-icons/fi'

const OPTION_TYPES = [
  { value: 'teng_bon_3', label: '3 ตัวบน' },
  { value: 'teng_lang_3', label: '3 ตัวล่าง' },
  { value: 'tode_3', label: '3 ตัวโต๊ด' },
  { value: 'teng_bon_2', label: '2 ตัวบน' },
  { value: 'teng_lang_2', label: '2 ตัวล่าง' },
  { value: 'teng_bon_1', label: 'วิ่งบน' },
  { value: 'teng_lang_1', label: 'วิ่งล่าง' },
]

const PayoutTierManagement: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null)
  const [selectedOptionType, setSelectedOptionType] = useState<string>('teng_bon_3')
  const [selectedType, setSelectedType] = useState<number>(1)
  const [tiers, setTiers] = useState<PayoutTier[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<PayoutTier>>({})
  const [testAmount, setTestAmount] = useState<string>('')
  const [calculatedMultiply, setCalculatedMultiply] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTier, setNewTier] = useState({
    tierOrder: '',
    minAmount: '',
    maxAmount: '',
    multiply: '',
    status: true
  })

  useEffect(() => {
    fetchLotteries()
  }, [])

  useEffect(() => {
    if (selectedLottery) {
      fetchTiers()
      setCalculatedMultiply(null)
      setTestAmount('')
      setShowCreateForm(false)
    }
  }, [selectedLottery, selectedOptionType, selectedType])

  const fetchLotteries = async () => {
    setLoading(true)
    try {
      const data = await adminLotteryAPI.getAllLotteries()
      setLotteries(data.filter(l => l.status))
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      toast.error('ไม่สามารถโหลดข้อมูลหวยได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchTiers = async () => {
    if (!selectedLottery) return
    setLoading(true)
    try {
      const data = await adminLotteryAPI.getTiersByLottery(
        selectedLottery.id,
        selectedOptionType,
        selectedType
      )
      setTiers(data.sort((a, b) => a.tierOrder - b.tierOrder))
    } catch (error) {
      console.error('Failed to fetch tiers:', error)
      setTiers([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTier = async () => {
    if (!selectedLottery) return

    if (!newTier.tierOrder || !newTier.minAmount || !newTier.multiply) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      await adminLotteryAPI.createTier({
        lotteryId: selectedLottery.id,
        optionType: selectedOptionType,
        type: selectedType,
        tierOrder: parseInt(newTier.tierOrder),
        minAmount: parseFloat(newTier.minAmount),
        maxAmount: newTier.maxAmount ? parseFloat(newTier.maxAmount) : null,
        multiply: parseFloat(newTier.multiply),
        status: newTier.status
      })
      toast.success('สร้าง Tier สำเร็จ')
      setShowCreateForm(false)
      setNewTier({ tierOrder: '', minAmount: '', maxAmount: '', multiply: '', status: true })
      fetchTiers()
    } catch (error: any) {
      console.error('Failed to create tier:', error)
      toast.error(error.response?.data?.error || 'ไม่สามารถสร้าง Tier ได้')
    }
  }

  const handleSetupDefault = async () => {
    if (!selectedLottery) return

    const confirmed = window.confirm(
      `สร้าง Default Tiers สำหรับ ${selectedLottery.huayName} - ${OPTION_TYPES.find(o => o.value === selectedOptionType)?.label} (${selectedType === 1 ? 'ต่อหวย' : 'ต่อคน'})?`
    )
    if (!confirmed) return

    try {
      await adminLotteryAPI.setupDefaultTiers({
        lotteryId: selectedLottery.id,
        optionType: selectedOptionType,
        type: selectedType
      })
      toast.success('สร้าง Default Tiers สำเร็จ')
      fetchTiers()
    } catch (error: any) {
      console.error('Failed to setup default tiers:', error)
      toast.error(error.response?.data?.error || 'ไม่สามารถสร้าง Default Tiers ได้')
    }
  }

  const handleEdit = (tier: PayoutTier) => {
    setEditingId(tier.id)
    setEditValues({
      tierOrder: tier.tierOrder,
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount?.Valid ? tier.maxAmount.Float64 : undefined,
      multiply: tier.multiply,
      status: tier.status
    })
  }

  const handleSave = async (tierId: number) => {
    try {
      await adminLotteryAPI.updateTier(tierId, {
        tierOrder: editValues.tierOrder!,
        minAmount: editValues.minAmount!,
        maxAmount: editValues.maxAmount,
        multiply: editValues.multiply!,
        status: editValues.status!
      })
      toast.success('บันทึกสำเร็จ')
      setEditingId(null)
      fetchTiers()
    } catch (error: any) {
      console.error('Failed to update tier:', error)
      toast.error(error.response?.data?.error || 'ไม่สามารถบันทึกได้')
    }
  }

  const handleDelete = async (tierId: number) => {
    const confirmed = window.confirm('คุณต้องการลบ Tier นี้หรือไม่?')
    if (!confirmed) return

    try {
      await adminLotteryAPI.deleteTier(tierId)
      toast.success('ลบสำเร็จ')
      fetchTiers()
    } catch (error: any) {
      console.error('Failed to delete tier:', error)
      toast.error('ไม่สามารถลบได้')
    }
  }

  const handleCalculate = async () => {
    if (!selectedLottery || !testAmount) return

    try {
      const result = await adminLotteryAPI.calculateMultiply(
        selectedLottery.id,
        selectedOptionType,
        selectedType,
        parseFloat(testAmount)
      )
      setCalculatedMultiply(result.multiply)
    } catch (error: any) {
      console.error('Failed to calculate:', error)
      toast.error(error.response?.data?.error || 'ไม่พบ Tier สำหรับยอดนี้')
      setCalculatedMultiply(null)
    }
  }

  const formatMaxAmount = (tier: PayoutTier) => {
    if (!tier.maxAmount || !tier.maxAmount.Valid) {
      return 'ไม่จำกัด'
    }
    return tier.maxAmount.Float64.toLocaleString()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiLayers className="text-blue-600" />
            จัดการอัตราจ่ายแบบขั้นบันได
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            กำหนดอัตราจ่ายที่แตกต่างกันตามยอดแทง เช่น แทง 1-10฿ จ่าย 500x, แทง 11-20฿ จ่าย 450x
          </p>
        </div>
      </div>

      {/* Step 1: เลือกหวย */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">1. เลือกหวย</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {lotteries.map(lottery => (
            <button
              key={lottery.id}
              onClick={() => setSelectedLottery(lottery)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedLottery?.id === lottery.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-semibold text-center">{lottery.huayName}</div>
              <div className="text-xs text-gray-500 text-center mt-1">{lottery.huayType}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 & 3: แสดงเฉพาะเมื่อเลือกหวยแล้ว */}
      {selectedLottery && (
        <>
          {/* Tabs: ต่อหวย / ต่อคน */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">2. เลือกประเภทลิมิต</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiPlus /> เพิ่ม Tier
                </button>
                <button
                  onClick={handleSetupDefault}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <FiPlus /> สร้าง Default Tiers
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedType(1)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedType === 1
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">ต่อหวย (Per Lottery)</div>
                <div className="text-xs mt-1 opacity-80">จำกัดยอดรวมต่อเลข</div>
              </button>
              <button
                onClick={() => setSelectedType(2)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedType === 2
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">ต่อคน (Per Member)</div>
                <div className="text-xs mt-1 opacity-80">จำกัดยอดต่อสมาชิก</div>
              </button>
            </div>

            {/* ประเภทการแทง + ทดสอบคำนวณ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">3. เลือกประเภทการแทง</label>
                <select
                  value={selectedOptionType}
                  onChange={(e) => setSelectedOptionType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  {OPTION_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ทดสอบคำนวณอัตราจ่าย</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
                    placeholder="ใส่ยอดแทง"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                  <button
                    onClick={handleCalculate}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    คำนวณ
                  </button>
                </div>
                {calculatedMultiply !== null && (
                  <p className="text-sm mt-2 text-green-600 font-semibold">
                    ✓ อัตราจ่าย: {calculatedMultiply}x
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">เพิ่ม Tier ใหม่</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ลำดับ *</label>
                  <input
                    type="number"
                    value={newTier.tierOrder}
                    onChange={(e) => setNewTier({...newTier, tierOrder: e.target.value})}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ยอดขั้นต่ำ (฿) *</label>
                  <input
                    type="number"
                    value={newTier.minAmount}
                    onChange={(e) => setNewTier({...newTier, minAmount: e.target.value})}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ยอดสูงสุด (฿)</label>
                  <input
                    type="number"
                    value={newTier.maxAmount}
                    onChange={(e) => setNewTier({...newTier, maxAmount: e.target.value})}
                    placeholder="ว่างไว้ = ไม่จำกัด"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อัตราจ่าย (x) *</label>
                  <input
                    type="number"
                    value={newTier.multiply}
                    onChange={(e) => setNewTier({...newTier, multiply: e.target.value})}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <select
                    value={newTier.status ? 'true' : 'false'}
                    onChange={(e) => setNewTier({...newTier, status: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="true">เปิดใช้งาน</option>
                    <option value="false">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateTier}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                >
                  <FiSave /> บันทึก
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewTier({ tierOrder: '', minAmount: '', maxAmount: '', multiply: '', status: true })
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center gap-2"
                >
                  <FiX /> ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Tiers Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                รายการ Tiers - {selectedLottery.huayName} ({OPTION_TYPES.find(o => o.value === selectedOptionType)?.label})
                {selectedType === 1 ? ' - ต่อหวย' : ' - ต่อคน'}
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
            ) : tiers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">ยังไม่มี Tiers สำหรับการตั้งค่านี้</p>
                <p className="text-sm mt-2">กด "เพิ่ม Tier" หรือ "สร้าง Default Tiers" เพื่อเริ่มต้น</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ลำดับ</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ยอดขั้นต่ำ</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ยอดสูงสุด</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">อัตราจ่าย</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">สถานะ</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tiers.map((tier) => (
                      <tr key={tier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {editingId === tier.id ? (
                            <input
                              type="number"
                              value={editValues.tierOrder}
                              onChange={(e) => setEditValues({ ...editValues, tierOrder: parseInt(e.target.value) })}
                              className="w-20 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                            />
                          ) : (
                            <span className="font-semibold text-gray-900">#{tier.tierOrder}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingId === tier.id ? (
                            <input
                              type="number"
                              value={editValues.minAmount}
                              onChange={(e) => setEditValues({ ...editValues, minAmount: parseFloat(e.target.value) })}
                              className="w-32 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                            />
                          ) : (
                            <span className="text-gray-900 font-medium">{tier.minAmount.toLocaleString()} ฿</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingId === tier.id ? (
                            <input
                              type="number"
                              value={editValues.maxAmount ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                              placeholder="ไม่จำกัด"
                              className="w-32 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                            />
                          ) : (
                            <span className="text-gray-900 font-medium">{formatMaxAmount(tier)} {tier.maxAmount?.Valid && '฿'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingId === tier.id ? (
                            <input
                              type="number"
                              value={editValues.multiply}
                              onChange={(e) => setEditValues({ ...editValues, multiply: parseFloat(e.target.value) })}
                              className="w-32 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                            />
                          ) : (
                            <span className="font-bold text-green-600 text-lg">{tier.multiply}x</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingId === tier.id ? (
                            <select
                              value={editValues.status ? 'true' : 'false'}
                              onChange={(e) => setEditValues({ ...editValues, status: e.target.value === 'true' })}
                              className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                            >
                              <option value="true">เปิดใช้งาน</option>
                              <option value="false">ปิดใช้งาน</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${tier.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {tier.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === tier.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSave(tier.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="บันทึก"
                              >
                                <FiSave size={18} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="ยกเลิก"
                              >
                                <FiX size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(tier)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="แก้ไข"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(tier.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="ลบ"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 คำอธิบาย</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>ต่อหวย (Type 1):</strong> จำกัดยอดรวมต่อเลข เช่น เลข 123 ซื้อได้รวมไม่เกิน 100,000 บาท</li>
              <li>• <strong>ต่อคน (Type 2):</strong> จำกัดยอดต่อสมาชิก เช่น สมาชิก A ซื้อได้รวมไม่เกิน 50,000 บาท</li>
              <li>• ยอดแทงที่สูงขึ้นจะได้อัตราจ่ายที่ต่ำลง เพื่อลดความเสี่ยงของเว็บ</li>
              <li>• กด "สร้าง Default Tiers" จะสร้าง 5 ขั้นพื้นฐาน: 1-10฿, 11-20฿, 21-50฿, 51-100฿, &gt;100฿</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default PayoutTierManagement
