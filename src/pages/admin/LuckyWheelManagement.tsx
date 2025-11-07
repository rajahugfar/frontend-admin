import { useState, useEffect } from 'react'
import { FiSettings, FiGift, FiUsers, FiRefreshCw, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Prize {
  id: number
  name: string
  amount: number
  color: string
  probability: number
  enabled: boolean
}

interface WheelSettings {
  maxSpinsPerDay: number
  enabled: boolean
  resetTime: string
}

interface SpinLog {
  id: number
  memberId: number
  memberUsername: string
  prizeName: string
  prizeAmount: number
  spunAt: string
}

interface Stats {
  totalSpins: number
  todaySpins: number
  totalPrizeAmount: number
  todayPrizeAmount: number
  activeMembers: number
}

const LuckyWheelManagement = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'prizes' | 'logs' | 'stats'>('stats')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [stats, setStats] = useState<Stats>({
    totalSpins: 0,
    todaySpins: 0,
    totalPrizeAmount: 0,
    todayPrizeAmount: 0,
    activeMembers: 0
  })

  const [settings, setSettings] = useState<WheelSettings>({
    maxSpinsPerDay: 3,
    enabled: true,
    resetTime: '00:00'
  })

  const [prizes, setPrizes] = useState<Prize[]>([
    { id: 1, name: '10 บาท', amount: 10, color: '#ef4444', probability: 30, enabled: true },
    { id: 2, name: '20 บาท', amount: 20, color: '#f59e0b', probability: 25, enabled: true },
    { id: 3, name: '50 บาท', amount: 50, color: '#10b981', probability: 20, enabled: true },
    { id: 4, name: '100 บาท', amount: 100, color: '#3b82f6', probability: 15, enabled: true },
    { id: 5, name: '200 บาท', amount: 200, color: '#8b5cf6', probability: 7, enabled: true },
    { id: 6, name: '500 บาท', amount: 500, color: '#ec4899', probability: 2, enabled: true },
    { id: 7, name: '1000 บาท', amount: 1000, color: '#f97316', probability: 1, enabled: true },
    { id: 8, name: 'โชคดีครั้งหน้า', amount: 0, color: '#6b7280', probability: 0, enabled: true }
  ])

  const [logs, setLogs] = useState<SpinLog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [activeTab, page])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'stats') {
        await fetchStats()
      } else if (activeTab === 'settings') {
        await fetchSettings()
      } else if (activeTab === 'prizes') {
        await fetchPrizes()
      } else if (activeTab === 'logs') {
        await fetchLogs()
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    const response = await fetch('/api/v1/admin/lucky-wheel/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      setStats(data.data || stats)
    }
  }

  const fetchSettings = async () => {
    const response = await fetch('/api/v1/admin/lucky-wheel/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      setSettings(data.data || settings)
    }
  }

  const fetchPrizes = async () => {
    const response = await fetch('/api/v1/admin/lucky-wheel/prizes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      setPrizes(data.data || prizes)
    }
  }

  const fetchLogs = async () => {
    const response = await fetch(`/api/v1/admin/lucky-wheel/logs?page=${page}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      setLogs(data.data.logs || [])
      setTotalPages(data.data.totalPages || 1)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/admin/lucky-wheel/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('บันทึกการตั้งค่าเรียบร้อย')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrizes = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/admin/lucky-wheel/prizes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`
        },
        credentials: 'include',
        body: JSON.stringify({ prizes })
      })

      if (response.ok) {
        toast.success('บันทึกรางวัลเรียบร้อย')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrizeChange = (id: number, field: keyof Prize, value: any) => {
    setPrizes(prizes.map(prize => 
      prize.id === id ? { ...prize, [field]: value } : prize
    ))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการกงล้อเสี่ยงโชค</h1>
        <p className="text-gray-600">ตั้งค่าและจัดการระบบกงล้อเสี่ยงโชค</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiUsers />
                สถิติ
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiSettings />
                ตั้งค่าระบบ
              </div>
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'prizes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiGift />
                จัดการรางวัล
              </div>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiRefreshCw />
                ประวัติการหมุน
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">การหมุนทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalSpins.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">วันนี้: {stats.todaySpins}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">รางวัลที่แจกทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600">฿{stats.totalPrizeAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">วันนี้: ฿{stats.todayPrizeAmount.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">สมาชิกที่เข้าร่วม</p>
                <p className="text-3xl font-bold text-purple-600">{stats.activeMembers.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">คน</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนครั้งที่หมุนได้ต่อวัน
                </label>
                <input
                  type="number"
                  value={settings.maxSpinsPerDay}
                  onChange={(e) => setSettings({ ...settings, maxSpinsPerDay: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เวลารีเซ็ตสิทธิ์
                </label>
                <input
                  type="time"
                  value={settings.resetTime}
                  onChange={(e) => setSettings({ ...settings, resetTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  เปิดใช้งานระบบกงล้อ
                </label>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <FiSave />
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          )}

          {/* Prizes Tab */}
          {activeTab === 'prizes' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สี</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อรางวัล</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวนเงิน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">โอกาสได้ (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prizes.map(prize => (
                      <tr key={prize.id}>
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: prize.color }}></div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prize.name}
                            onChange={(e) => handlePrizeChange(prize.id, 'name', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={prize.amount}
                            onChange={(e) => handlePrizeChange(prize.id, 'amount', parseFloat(e.target.value))}
                            className="w-24 px-3 py-1 border border-gray-300 rounded"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={prize.probability}
                            onChange={(e) => handlePrizeChange(prize.id, 'probability', parseFloat(e.target.value))}
                            className="w-20 px-3 py-1 border border-gray-300 rounded"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={prize.enabled}
                            onChange={(e) => handlePrizeChange(prize.id, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  รวมโอกาส: {prizes.reduce((sum, p) => sum + p.probability, 0).toFixed(1)}%
                </p>
                <button
                  onClick={handleSavePrizes}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <FiSave />
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกรางวัล'}
                </button>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลา</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สมาชิก</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รางวัล</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(log.spunAt).toLocaleString('th-TH')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.memberUsername}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.prizeName}</td>
                        <td className="px-6 py-4 text-sm">
                          {log.prizeAmount > 0 ? (
                            <span className="text-green-600 font-medium">฿{log.prizeAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <span className="text-sm text-gray-600">
                  หน้า {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LuckyWheelManagement
