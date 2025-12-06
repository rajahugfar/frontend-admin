import { useEffect, useState } from 'react'
import { FiSave, FiAlertCircle, FiUsers, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiX, FiSettings } from 'react-icons/fi'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

type TabType = 'settings' | 'commission' | 'users' | 'withdrawals'

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

interface ReferralStats {
  totalReferrers: number
  totalReferrals: number
  totalCommissionPaid: number
  pendingCommission: number
  todayCommission: number
  thisMonthCommission: number
}

interface ReferralUser {
  id: string
  username: string
  phone: string
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  totalCommission: number
  pendingCommission: number
  withdrawnCommission: number
  createdAt: string
}

interface CommissionWithdrawal {
  id: number
  userId: string
  username: string
  phone: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  processedAt?: string
  processedBy?: string
  note?: string
}

export default function TurnoverManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('settings')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Turnover config
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

  // Referral settings
  const [referralSettings, setReferralSettings] = useState<ReferralSetting[]>([])
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrers: 0,
    totalReferrals: 0,
    totalCommissionPaid: 0,
    pendingCommission: 0,
    todayCommission: 0,
    thisMonthCommission: 0
  })
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([])
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawal[]>([])

  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CommissionWithdrawal | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalNote, setApprovalNote] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const [configRes, settingsRes, statsRes, usersRes, withdrawalsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/admin/turnover/config`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_selector')}` },
          credentials: 'include',
        }).then(res => res.json()).catch(() => ({ data: null })),

        fetch(`${apiUrl}/api/v1/admin/referral/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_selector')}` },
          credentials: 'include',
        }).then(res => res.json()).catch(() => ({ data: [] })),

        fetch(`${apiUrl}/api/v1/admin/referral/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_selector')}` },
          credentials: 'include',
        }).then(res => res.json()).catch(() => ({ data: null })),

        fetch(`${apiUrl}/api/v1/admin/referral/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_selector')}` },
          credentials: 'include',
        }).then(res => res.json()).catch(() => ({ data: [] })),

        fetch(`${apiUrl}/api/v1/admin/referral/withdrawals/pending`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_selector')}` },
          credentials: 'include',
        }).then(res => res.json()).catch(() => ({ data: [] })),
      ])

      if (configRes.success && configRes.data) setConfig(configRes.data)
      if (settingsRes.success && settingsRes.data) setReferralSettings(settingsRes.data)
      if (statsRes.data) setReferralStats(statsRes.data)
      if (usersRes.data) setReferralUsers(usersRes.data)
      if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data)

    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
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
        toast.success('บันทึกการตั้งค่าเทิร์นสำเร็จ')
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('ไม่สามารถบันทึกได้')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveReferralSettings = async () => {
    try {
      setIsSaving(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/admin/referral/settings`, {
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
        toast.success('บันทึกค่าคอมมิชชั่นสำเร็จ')
        fetchAllData()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('ไม่สามารถบันทึกได้')
    } finally {
      setIsSaving(false)
    }
  }

  const updateReferralSetting = (id: number, field: keyof ReferralSetting, value: any) => {
    setReferralSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleApproveWithdrawal = (withdrawal: CommissionWithdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowApprovalModal(true)
  }

  const handleRejectWithdrawal = async (withdrawal: CommissionWithdrawal) => {
    const reason = prompt(`ปฏิเสธคำขอถอน ฿${withdrawal.amount.toLocaleString()}\nระบุเหตุผล:`)
    if (!reason) return

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/admin/referral/withdrawals/${withdrawal.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        toast.success('ปฏิเสธคำขอถอนเรียบร้อย')
        fetchAllData()
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const confirmApproval = async () => {
    if (!selectedWithdrawal) return

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/admin/referral/withdrawals/${selectedWithdrawal.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ note: approvalNote || undefined })
      })

      if (response.ok) {
        toast.success('อนุมัติคำขอถอนเรียบร้อย')
        setShowApprovalModal(false)
        setSelectedWithdrawal(null)
        setApprovalNote('')
        fetchAllData()
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const calculateExample = (turnover: number) => (turnover * config.exchangeRate) / 100

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'settings' as TabType, label: 'ตั้งค่าเทิร์น', icon: <FiSettings /> },
    { id: 'commission' as TabType, label: 'ค่าคอมมิชชั่น', icon: <FiDollarSign /> },
    { id: 'users' as TabType, label: 'ผู้แนะนำ', icon: <FiUsers /> },
    { id: 'withdrawals' as TabType, label: 'รอถอนเงิน', icon: <FiClock />, badge: withdrawals.filter(w => w.status === 'pending').length },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brown-100 mb-2">ระบบเทิร์นโอเวอร์และแนะนำเพื่อน</h1>
        <p className="text-brown-400">จัดการการตั้งค่าเทิร์นและค่าคอมมิชชั่น</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiUsers className="text-gold-500 text-xl" />
            <div>
              <p className="text-brown-400 text-xs">ผู้แนะนำ</p>
              <p className="text-brown-100 font-bold">{referralStats.totalReferrers}</p>
            </div>
          </div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-blue-400 text-xl" />
            <div>
              <p className="text-brown-400 text-xs">ผู้ถูกแนะนำ</p>
              <p className="text-brown-100 font-bold">{referralStats.totalReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-green-400 text-xl" />
            <div>
              <p className="text-brown-400 text-xs">จ่ายแล้ว</p>
              <p className="text-green-400 font-bold">฿{referralStats.totalCommissionPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiClock className="text-orange-400 text-xl" />
            <div>
              <p className="text-brown-400 text-xs">รอจ่าย</p>
              <p className="text-orange-400 font-bold">฿{referralStats.pendingCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gold-500 text-white'
                : 'bg-admin-card border border-admin-border text-brown-300 hover:bg-admin-hover'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-admin-card border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-brown-100 mb-4">สถานะระบบ</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                className="w-5 h-5 text-gold-500 bg-admin-bg border-admin-border rounded"
              />
              <span className="text-brown-300">เปิดใช้งานระบบเทิร์นโอเวอร์</span>
            </label>
          </div>

          {/* Exchange Settings */}
          <div className="bg-admin-card border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-brown-100 mb-4">การตั้งค่าการแลก</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-brown-300 text-sm mb-2">อัตราแลก (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.exchangeRate}
                  onChange={(e) => setConfig({ ...config, exchangeRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100"
                />
              </div>
              <div>
                <label className="block text-brown-300 text-sm mb-2">ยอดขั้นต่ำ</label>
                <input
                  type="number"
                  value={config.minTurnoverToRedeem}
                  onChange={(e) => setConfig({ ...config, minTurnoverToRedeem: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100"
                />
              </div>
              <div>
                <label className="block text-brown-300 text-sm mb-2">สูงสุด/วัน (0=ไม่จำกัด)</label>
                <input
                  type="number"
                  value={config.maxRedeemPerDay || ''}
                  onChange={(e) => setConfig({ ...config, maxRedeemPerDay: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100"
                />
              </div>
            </div>
          </div>

          {/* Source Settings */}
          <div className="bg-admin-card border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-brown-100 mb-4">แหล่งที่มาเทิร์น</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allowLotteryTurnover}
                    onChange={(e) => setConfig({ ...config, allowLotteryTurnover: e.target.checked })}
                    className="w-5 h-5 text-gold-500"
                  />
                  <span className="text-brown-300">เทิร์นจากหวย</span>
                </label>
                {config.allowLotteryTurnover && (
                  <div className="ml-8">
                    <label className="block text-brown-400 text-sm mb-1">ตัวคูณ</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.lotteryTurnoverMultiplier}
                      onChange={(e) => setConfig({ ...config, lotteryTurnoverMultiplier: parseFloat(e.target.value) })}
                      className="w-32 px-3 py-1 bg-admin-bg border border-admin-border rounded text-brown-100"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allowGameTurnover}
                    onChange={(e) => setConfig({ ...config, allowGameTurnover: e.target.checked })}
                    className="w-5 h-5 text-gold-500"
                  />
                  <span className="text-brown-300">เทิร์นจากเกมส์</span>
                </label>
                {config.allowGameTurnover && (
                  <div className="ml-8">
                    <label className="block text-brown-400 text-sm mb-1">ตัวคูณ</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.gameTurnoverMultiplier}
                      onChange={(e) => setConfig({ ...config, gameTurnoverMultiplier: parseFloat(e.target.value) })}
                      className="w-32 px-3 py-1 bg-admin-bg border border-admin-border rounded text-brown-100"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-brown-100 font-medium mb-2">ตัวอย่างการแลก</p>
                <p className="text-brown-300 text-sm">เทิร์น 10,000 × {config.exchangeRate}% = {calculateExample(10000).toFixed(2)} บาท</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg disabled:opacity-50"
          >
            <FiSave />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกตั้งค่าเทิร์น'}
          </button>
        </div>
      )}

      {activeTab === 'commission' && (
        <div className="space-y-6">
          {referralSettings.filter(s => s.level === 1).map((setting) => (
            <div key={setting.id} className="space-y-4">
              {/* Lottery Commission */}
              <div className="bg-admin-card border border-admin-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-yellow-400">ค่าคอมหวย</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.lotteryCommissionEnabled}
                      onChange={(e) => updateReferralSetting(setting.id, 'lotteryCommissionEnabled', e.target.checked)}
                      className="w-5 h-5 text-gold-500"
                    />
                    <span className="text-brown-300">เปิดใช้งาน</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.1"
                    value={setting.commission}
                    onChange={(e) => updateReferralSetting(setting.id, 'commission', parseFloat(e.target.value))}
                    className="w-32 px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100"
                  />
                  <span className="text-brown-400">%</span>
                  <span className="text-brown-500 text-sm">
                    แทงหวย 100 บาท = ค่าคอม {(100 * setting.commission / 100).toFixed(2)} บาท
                  </span>
                </div>
              </div>

              {/* Game Commission */}
              <div className="bg-admin-card border border-admin-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-400">ค่าคอมเกมส์</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.gameCommissionEnabled}
                      onChange={(e) => updateReferralSetting(setting.id, 'gameCommissionEnabled', e.target.checked)}
                      className="w-5 h-5 text-gold-500"
                    />
                    <span className="text-brown-300">เปิดใช้งาน</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    value={setting.gameCommission}
                    onChange={(e) => updateReferralSetting(setting.id, 'gameCommission', parseFloat(e.target.value))}
                    className="w-32 px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100"
                  />
                  <span className="text-brown-400">%</span>
                  <span className="text-brown-500 text-sm">
                    เล่นเกมส์ 1000 บาท = ค่าคอม {(1000 * setting.gameCommission / 100).toFixed(2)} บาท
                  </span>
                </div>
                <p className="text-brown-500 text-xs mt-2">* แนะนำ 0.1% เนื่องจากยอดเทิร์นเกมส์มีจำนวนมาก</p>
              </div>
            </div>
          ))}

          <button
            onClick={handleSaveReferralSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
          >
            <FiSave />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกค่าคอมมิชชั่น'}
          </button>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase">ผู้ใช้</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase">รหัสแนะนำ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase">จำนวนแนะนำ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase">คอมมิชชั่น</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {referralUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brown-400">ยังไม่มีข้อมูลผู้แนะนำ</td>
                  </tr>
                ) : (
                  referralUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-admin-bg">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-brown-100">{user.username || user.phone}</div>
                        <div className="text-sm text-brown-400">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-mono bg-gold-500/20 text-gold-500 rounded">
                          {user.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-brown-100">{user.totalReferrals} คน</div>
                        <div className="text-xs text-brown-400">ใช้งาน {user.activeReferrals}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-green-400">฿{user.totalCommission?.toLocaleString() || 0}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-brown-400">
                        {dayjs(user.createdAt).format('DD/MM/YY')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase">ผู้ใช้</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase">จำนวน</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase">วันที่ขอ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brown-400">ไม่มีคำขอถอนเงิน</td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-admin-bg">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-brown-100">{w.username}</div>
                        <div className="text-sm text-brown-400">{w.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gold-500">฿{w.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          w.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          w.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {w.status === 'pending' ? 'รอดำเนินการ' : w.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-brown-400">
                        {dayjs(w.requestedAt).format('DD/MM/YY HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {w.status === 'pending' && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleApproveWithdrawal(w)}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                              <FiCheckCircle className="inline mr-1" />อนุมัติ
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(w)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                              <FiX className="inline mr-1" />ปฏิเสธ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-admin-card border border-admin-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-brown-100 mb-4">ยืนยันอนุมัติ</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-brown-400">ผู้ใช้:</span>
                <span className="text-brown-100">{selectedWithdrawal.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-400">จำนวน:</span>
                <span className="text-gold-500 font-bold">฿{selectedWithdrawal.amount.toLocaleString()}</span>
              </div>
            </div>
            <textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="หมายเหตุ (ถ้ามี)"
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 mb-4"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowApprovalModal(false); setSelectedWithdrawal(null); setApprovalNote('') }}
                className="flex-1 px-4 py-2 border border-admin-border rounded-lg text-brown-100 hover:bg-admin-bg"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
