import { useEffect, useState } from 'react'
import { FiSave, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

interface CommissionRate {
  id: number
  type: string
  typeName: string
  rate: number
  maxDaily: number
  calculationType: 'turnover' | 'profit'
  enabled: boolean
}

export default function ReferralSettings() {
  const [rates, setRates] = useState<CommissionRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.get('/referral/settings')
      setRates(response.data.data || [])
      
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
      
      // Set default rates if API fails
      setRates([
        {
          id: 1,
          type: 'casino',
          typeName: 'คาสิโน',
          rate: 0.3,
          maxDaily: 5000,
          calculationType: 'turnover',
          enabled: true
        },
        {
          id: 2,
          type: 'slot',
          typeName: 'สล็อต',
          rate: 0.5,
          maxDaily: 5000,
          calculationType: 'turnover',
          enabled: true
        },
        {
          id: 3,
          type: 'lottery',
          typeName: 'หวย',
          rate: 3.0,
          maxDaily: 5000,
          calculationType: 'turnover',
          enabled: true
        },
        {
          id: 4,
          type: 'crypto',
          typeName: '1234 คริปโต',
          rate: 0.3,
          maxDaily: 5000,
          calculationType: 'turnover',
          enabled: true
        },
        {
          id: 5,
          type: 'sport',
          typeName: 'กีฬา',
          rate: 1.0,
          maxDaily: 2000,
          calculationType: 'profit',
          enabled: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRateChange = (id: number, field: keyof CommissionRate, value: string | number | boolean) => {
    setRates(rates.map(rate => 
      rate.id === id ? { ...rate, [field]: value } : rate
    ))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      await apiClient.put('/referral/settings', { rates })
      toast.success('บันทึกการตั้งค่าเรียบร้อย')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('ยืนยันการรีเซ็ตค่าเริ่มต้น?')) {
      fetchSettings()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gold-500">ตั้งค่าเรทคอมมิชชั่น</h1>
          <p className="text-brown-300 mt-1">กำหนดเปอร์เซ็นต์คอมมิชชั่นสำหรับแต่ละประเภทเกม</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-brown-700 rounded-md text-brown-100 bg-admin-dark hover:bg-brown-800 transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            รีเซ็ต
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-admin-dark bg-gold-500 hover:bg-gold-600 disabled:opacity-50 transition-colors"
          >
            <FiSave className="mr-2" />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-admin-card rounded-lg border border-brown-700">
        <div className="p-6">
          <div className="space-y-6">
            {rates.map((rate) => (
              <div key={rate.id} className="border-b border-brown-700 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gold-400">{rate.typeName}</h3>
                    <span className="text-xs text-brown-300 bg-admin-dark px-2 py-1 rounded">
                      {rate.type}
                    </span>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rate.enabled}
                      onChange={(e) => handleRateChange(rate.id, 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-brown-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brown-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                    <span className="ml-3 text-sm font-medium text-brown-100">
                      {rate.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-medium text-brown-200 mb-2">
                      เปอร์เซ็นต์คอมมิชชั่น (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rate.rate}
                        onChange={(e) => handleRateChange(rate.id, 'rate', parseFloat(e.target.value))}
                        step="0.1"
                        min="0"
                        max="100"
                        disabled={!rate.enabled}
                        className="input disabled:opacity-50"
                      />
                      <span className="absolute right-3 top-2 text-brown-400">%</span>
                    </div>
                  </div>

                  {/* Max Daily */}
                  <div>
                    <label className="block text-sm font-medium text-brown-200 mb-2">
                      จำนวนสูงสุดต่อวัน (บาท)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rate.maxDaily}
                        onChange={(e) => handleRateChange(rate.id, 'maxDaily', parseInt(e.target.value))}
                        step="100"
                        min="0"
                        disabled={!rate.enabled}
                        className="input disabled:opacity-50"
                      />
                      <span className="absolute right-3 top-2 text-brown-400">฿</span>
                    </div>
                  </div>

                  {/* Calculation Type */}
                  <div>
                    <label className="block text-sm font-medium text-brown-200 mb-2">
                      คำนวณจาก
                    </label>
                    <select
                      value={rate.calculationType}
                      onChange={(e) => handleRateChange(rate.id, 'calculationType', e.target.value)}
                      disabled={!rate.enabled}
                      className="input disabled:opacity-50"
                    >
                      <option value="turnover">Turnover (ยอดเดิมพัน)</option>
                      <option value="profit">Profit (ยอดได้)</option>
                    </select>
                  </div>
                </div>

                {/* Example Calculation */}
                {rate.enabled && (
                  <div className="mt-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-md">
                    <p className="text-sm text-gold-200">
                      <strong>ตัวอย่าง:</strong> หากสมาชิกที่แนะนำมา
                      {rate.calculationType === 'turnover' ? 'เดิมพัน' : 'ได้กำไร'} 10,000 บาท 
                      คุณจะได้รับคอมมิชชั่น {(10000 * rate.rate / 100).toLocaleString()} บาท
                      {rate.maxDaily && (10000 * rate.rate / 100) > rate.maxDaily && (
                        <span className="text-yellow-400"> (จำกัดสูงสุด {rate.maxDaily.toLocaleString()} บาท/วัน)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-admin-card rounded-lg border border-brown-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gold-400 mb-4">เงื่อนไขเพิ่มเติม</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-brown-700 rounded-lg bg-admin-dark/30">
              <div>
                <h4 className="font-medium text-brown-100">ต้องมีการฝากเงินก่อนถอนคอมมิชชั่น</h4>
                <p className="text-sm text-brown-300 mt-1">
                  สมาชิกต้องมีรายการฝากเงินอย่างน้อย 1 ครั้งในเดือนที่ขอถอน
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-brown-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brown-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-brown-700 rounded-lg bg-admin-dark/30">
              <div>
                <h4 className="font-medium text-brown-100">ตรวจสอบการทุจริต</h4>
                <p className="text-sm text-brown-300 mt-1">
                  ระบบจะตรวจสอบการเดิมพันผิดปกติและบัญชีซ้ำซ้อนอัตโนมัติ
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-brown-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brown-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
              </label>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-200">
                <strong>หมายเหตุ:</strong> การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีกับการคำนวณคอมมิชชั่นใหม่ 
                แต่จะไม่ส่งผลกับคอมมิชชั่นที่คำนวณไว้แล้ว
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
