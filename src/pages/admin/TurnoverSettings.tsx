import { useEffect, useState } from 'react'
import { FiSave, FiAlertCircle, FiUsers } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface TurnoverConfig {
  id: number
  exchangeRate: number
  minTurnoverToRedeem: number
  maxRedeemPerDay: number | null
  isEnabled: boolean
  allowLotteryTurnover: boolean
  allowGameTurnover: boolean
  lotteryTurnoverMultiplier: number
  gameTurnoverMultiplier: number
  description: string
}

interface ReferralSetting {
  id: number
  level: number
  name: string
  commission: number
  gameCommission: number
  lotteryCommissionEnabled: boolean
  gameCommissionEnabled: boolean
  minDeposit: number
  minTurnover: number
  enabled: boolean
}

export default function TurnoverSettings() {
  const [config, setConfig] = useState<TurnoverConfig>({
    id: 0,
    exchangeRate: 0.1,
    minTurnoverToRedeem: 1000,
    maxRedeemPerDay: 10000,
    isEnabled: true,
    allowLotteryTurnover: true,
    allowGameTurnover: true,
    lotteryTurnoverMultiplier: 1,
    gameTurnoverMultiplier: 1,
    description: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [referralSettings, setReferralSettings] = useState<ReferralSetting[]>([])

  useEffect(() => {
    fetchConfig()
    fetchReferralSettings()
  }, [])

  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      // Fetch both configs in parallel
      const [configRes, referralRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/admin/turnover/config`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
          },
          credentials: 'include',
        }),
        fetch('/api/v1/admin/referral/settings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
          },
          credentials: 'include',
        })
      ])

      const configData = await configRes.json()
      const referralData = await referralRes.json()

      if (configData.success && configData.data) {
        setConfig(configData.data)
      }

      if (referralData.success && referralData.data) {
        setReferralSettings(referralData.data)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReferralSettings = async () => {
    try {
      const response = await fetch('/api/v1/admin/referral/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
      })

      const data = await response.json()
      if (data.success && data.data) {
        setReferralSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch referral settings:', error)
    }
  }

  const handleSaveReferralSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/v1/admin/referral/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ settings: referralSettings }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('บันทึกการตั้งค่าค่าคอมมิชชั่นสำเร็จ')
        fetchReferralSettings()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Failed to save referral settings:', error)
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้')
    } finally {
      setIsSaving(false)
    }
  }

  const updateReferralSetting = (id: number, field: keyof ReferralSetting, value: any) => {
    setReferralSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/admin/turnover/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('บันทึกการตั้งค่าสำเร็จ')
        fetchConfig()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้')
    } finally {
      setIsSaving(false)
    }
  }

  const calculateExample = (turnover: number) => {
    return (turnover * config.exchangeRate) / 100
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brown-100 mb-2">ตั้งค่าระบบเทิร์นโอเวอร์</h1>
        <p className="text-brown-400">จัดการการตั้งค่าระบบเทิร์นโอเวอร์และอัตราแลก</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* System Status */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brown-100 mb-4">สถานะระบบ</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
              className="w-5 h-5 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
            />
            <span className="text-brown-300">เปิดใช้งานระบบเทิร์นโอเวอร์</span>
          </label>
        </div>

        {/* Exchange Settings */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brown-100 mb-4">การตั้งค่าการแลก</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-brown-300 text-sm font-medium mb-2">
                อัตราแลก (%)
                <span className="text-brown-500 ml-1">* เช่น 0.10% = 1000 เทิร์น = 1 บาท</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.exchangeRate}
                onChange={(e) => setConfig({ ...config, exchangeRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            <div>
              <label className="block text-brown-300 text-sm font-medium mb-2">
                ยอดเทิร์นขั้นต่ำในการแลก (THB)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={config.minTurnoverToRedeem}
                onChange={(e) => setConfig({ ...config, minTurnoverToRedeem: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            <div>
              <label className="block text-brown-300 text-sm font-medium mb-2">
                ยอดแลกสูงสุดต่อวัน (THB)
                <span className="text-brown-500 ml-1">* ใส่ 0 หรือเว้นว่างเพื่อไม่จำกัด</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={config.maxRedeemPerDay || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxRedeemPerDay: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Source Settings */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brown-100 mb-4">ตั้งค่าแหล่งที่มาเทิร์น</h3>
          <div className="space-y-6">
            {/* Lottery */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowLotteryTurnover}
                  onChange={(e) => setConfig({ ...config, allowLotteryTurnover: e.target.checked })}
                  className="w-5 h-5 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                />
                <span className="text-brown-300">เปิดใช้งานเทิร์นจากหวย</span>
              </label>
              {config.allowLotteryTurnover && (
                <div className="ml-8">
                  <label className="block text-brown-400 text-sm mb-2">ตัวคูณเทิร์นหวย (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={config.lotteryTurnoverMultiplier}
                    onChange={(e) => setConfig({ ...config, lotteryTurnoverMultiplier: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
                    required
                  />
                  <p className="text-brown-500 text-xs mt-1">
                    ตัวอย่าง: แทงหวย 100 บาท × {config.lotteryTurnoverMultiplier} = {100 * config.lotteryTurnoverMultiplier} เทิร์น
                  </p>
                </div>
              )}
            </div>

            {/* Game */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowGameTurnover}
                  onChange={(e) => setConfig({ ...config, allowGameTurnover: e.target.checked })}
                  className="w-5 h-5 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                />
                <span className="text-brown-300">เปิดใช้งานเทิร์นจากเกมส์</span>
              </label>
              {config.allowGameTurnover && (
                <div className="ml-8">
                  <label className="block text-brown-400 text-sm mb-2">ตัวคูณเทิร์นเกมส์ (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={config.gameTurnoverMultiplier}
                    onChange={(e) => setConfig({ ...config, gameTurnoverMultiplier: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
                    required
                  />
                  <p className="text-brown-500 text-xs mt-1">
                    ตัวอย่าง: เกมส์ turnOver 50 × {config.gameTurnoverMultiplier} = {50 * config.gameTurnoverMultiplier} เทิร์น
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Affiliate Commission Settings */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiUsers className="text-gold-500" />
            <h3 className="text-lg font-semibold text-brown-100">ตั้งค่าค่าคอมมิชชั่นแนะนำเพื่อน</h3>
          </div>

          {referralSettings.length > 0 && (
            <div className="space-y-6">
              {referralSettings.filter(s => s.level === 1).map((setting) => (
                <div key={setting.id} className="space-y-4">
                  {/* Lottery Commission */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-brown-200 font-medium">ค่าคอมหวย</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.lotteryCommissionEnabled}
                          onChange={(e) => updateReferralSetting(setting.id, 'lotteryCommissionEnabled', e.target.checked)}
                          className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                        />
                        <span className="text-brown-400 text-sm">เปิดใช้งาน</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={setting.commission}
                        onChange={(e) => updateReferralSetting(setting.id, 'commission', parseFloat(e.target.value))}
                        className="w-24 px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
                      />
                      <span className="text-brown-400">%</span>
                      <span className="text-brown-500 text-sm ml-2">
                        ตัวอย่าง: แทงหวย 100 บาท = ค่าคอม {(100 * setting.commission / 100).toFixed(2)} บาท
                      </span>
                    </div>
                  </div>

                  {/* Game Commission */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-brown-200 font-medium">ค่าคอมเกมส์</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.gameCommissionEnabled}
                          onChange={(e) => updateReferralSetting(setting.id, 'gameCommissionEnabled', e.target.checked)}
                          className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                        />
                        <span className="text-brown-400 text-sm">เปิดใช้งาน</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={setting.gameCommission}
                        onChange={(e) => updateReferralSetting(setting.id, 'gameCommission', parseFloat(e.target.value))}
                        className="w-24 px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
                      />
                      <span className="text-brown-400">%</span>
                      <span className="text-brown-500 text-sm ml-2">
                        ตัวอย่าง: เล่นเกมส์ 1000 บาท = ค่าคอม {(1000 * setting.gameCommission / 100).toFixed(2)} บาท
                      </span>
                    </div>
                    <p className="text-brown-500 text-xs mt-2">
                      * แนะนำ 0.1% เนื่องจากยอดเทิร์นเกมส์มีจำนวนมาก
                    </p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleSaveReferralSettings}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
                disabled={isSaving}
              >
                <FiSave className="w-4 h-4" />
                บันทึกค่าคอมมิชชั่น
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brown-100 mb-4">คำอธิบายระบบ</h3>
          <textarea
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            placeholder="คำอธิบายระบบเทิร์นโอเวอร์สำหรับแสดงให้สมาชิกเห็น..."
            rows={4}
            className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:border-gold-500 resize-none"
          />
        </div>

        {/* Example Preview */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-brown-100 font-semibold mb-2">ตัวอย่างการแลก</h4>
              <div className="space-y-1 text-brown-300">
                <p>• เทิร์น 10,000 บาท × {config.exchangeRate}% = {calculateExample(10000).toFixed(2)} บาท</p>
                <p>• เทิร์น 50,000 บาท × {config.exchangeRate}% = {calculateExample(50000).toFixed(2)} บาท</p>
                <p>• เทิร์น 100,000 บาท × {config.exchangeRate}% = {calculateExample(100000).toFixed(2)} บาท</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={fetchConfig}
            className="px-6 py-2 bg-admin-hover hover:bg-admin-border text-brown-300 rounded-lg transition-all"
            disabled={isSaving}
          >
            รีเซ็ต
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            <FiSave className="w-4 h-4" />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
        </div>
      </form>
    </div>
  )
}
