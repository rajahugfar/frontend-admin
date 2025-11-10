import { useState, useEffect } from 'react'
import { FiSettings, FiGift, FiUsers, FiRefreshCw, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { 
  adminLuckyWheelAPI, 
  Prize, 
  Settings, 
  Stats, 
  SpinLog,
  UpdatePrizeRequest,
  UpdateSettingsRequest 
} from '@/api/adminLuckyWheelAPI'

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

  const [settings, setSettings] = useState<Settings>({
    id: 0,
    maxSpinsPerDay: 3,
    enabled: true,
    resetTime: '00:00',
    createdAt: '',
    updatedAt: ''
  })

  const [prizes, setPrizes] = useState<Prize[]>([])
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
    } catch (error: any) {
      console.error('Failed to fetch data:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    const data = await adminLuckyWheelAPI.getStats()
    setStats(data)
  }

  const fetchSettings = async () => {
    const data = await adminLuckyWheelAPI.getSettings()
    setSettings(data)
  }

  const fetchPrizes = async () => {
    const data = await adminLuckyWheelAPI.getAllPrizes()
    setPrizes(data)
  }

  const fetchLogs = async () => {
    const data = await adminLuckyWheelAPI.getSpinLogs(page, 20)
    setLogs(data.logs)
    setTotalPages(data.totalPages)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const req: UpdateSettingsRequest = {
        maxSpinsPerDay: settings.maxSpinsPerDay,
        enabled: settings.enabled,
        resetTime: settings.resetTime
      }
      await adminLuckyWheelAPI.updateSettings(req)
      toast.success('บันทึกการตั้งค่าเรียบร้อย')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrizes = async () => {
    // Validate total probability
    const totalProb = prizes.filter(p => p.enabled).reduce((sum, p) => sum + p.probability, 0)
    if (totalProb < 99.9 || totalProb > 100.1) {
      toast.error('รวมโอกาสของรางวัลที่เปิดใช้งานต้องเท่ากับ 100%')
      return
    }

    setIsSaving(true)
    try {
      const updateRequests: UpdatePrizeRequest[] = prizes.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        amount: p.amount,
        itemName: p.itemName,
        itemImage: p.itemImage,
        color: p.color,
        probability: p.probability,
        enabled: p.enabled
      }))
      
      await adminLuckyWheelAPI.updatePrizes(updateRequests)
      toast.success('บันทึกรางวัลเรียบร้อย')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก')
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
        <h1 className="text-2xl font-bold text-[#f5a73c]">จัดการกงล้อเสี่ยงโชค</h1>
        <p className="text-gray-400">ตั้งค่าและจัดการระบบกงล้อเสี่ยงโชค</p>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1410] border border-[#f5a73c]/20 rounded-lg shadow-lg mb-6">
        <div className="border-b border-[#f5a73c]/20">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-[#f5a73c] text-[#f5a73c]'
                  : 'border-transparent text-gray-400 hover:text-[#f5a73c] hover:border-[#f5a73c]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiUsers />
                สถิติ
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-[#f5a73c] text-[#f5a73c]'
                  : 'border-transparent text-gray-400 hover:text-[#f5a73c] hover:border-[#f5a73c]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiSettings />
                ตั้งค่าระบบ
              </div>
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'prizes'
                  ? 'border-[#f5a73c] text-[#f5a73c]'
                  : 'border-transparent text-gray-400 hover:text-[#f5a73c] hover:border-[#f5a73c]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiGift />
                จัดการรางวัล
              </div>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-[#f5a73c] text-[#f5a73c]'
                  : 'border-transparent text-gray-400 hover:text-[#f5a73c] hover:border-[#f5a73c]/50'
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
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">กำลังโหลด...</div>
            </div>
          ) : (
            <>
              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-[#f5a73c]/10 to-[#f5a73c]/5 border border-[#f5a73c]/20 rounded-lg p-6">
                    <p className="text-sm text-gray-400 mb-1">การหมุนทั้งหมด</p>
                    <p className="text-3xl font-bold text-[#f5a73c]">{stats.totalSpins.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">วันนี้: {stats.todaySpins}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-6">
                    <p className="text-sm text-gray-400 mb-1">รางวัลที่แจกทั้งหมด</p>
                    <p className="text-3xl font-bold text-green-400">฿{stats.totalPrizeAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">วันนี้: ฿{stats.todayPrizeAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg p-6">
                    <p className="text-sm text-gray-400 mb-1">สมาชิกที่เข้าร่วม</p>
                    <p className="text-3xl font-bold text-purple-400">{stats.activeMembers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">คน</p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      จำนวนครั้งที่หมุนได้ต่อวัน
                    </label>
                    <input
                      type="number"
                      value={settings.maxSpinsPerDay}
                      onChange={(e) => setSettings({ ...settings, maxSpinsPerDay: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-[#2a2420] border border-[#f5a73c]/30 rounded-lg text-white focus:ring-2 focus:ring-[#f5a73c] focus:border-[#f5a73c]"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      เวลารีเซ็ตสิทธิ์
                    </label>
                    <input
                      type="time"
                      value={settings.resetTime}
                      onChange={(e) => setSettings({ ...settings, resetTime: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2a2420] border border-[#f5a73c]/30 rounded-lg text-white focus:ring-2 focus:ring-[#f5a73c] focus:border-[#f5a73c]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                      className="w-4 h-4 text-[#f5a73c] bg-[#2a2420] border-[#f5a73c]/30 rounded focus:ring-[#f5a73c]"
                    />
                    <label htmlFor="enabled" className="text-sm font-medium text-gray-300">
                      เปิดใช้งานระบบกงล้อ
                    </label>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-6 py-2 bg-[#f5a73c] text-[#1a1410] font-medium rounded-lg hover:bg-[#f5a73c]/90 disabled:bg-gray-600 disabled:text-gray-400 flex items-center gap-2 transition-colors"
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
                    <table className="min-w-full divide-y divide-[#f5a73c]/20">
                      <thead className="bg-[#2a2420]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สี</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ชื่อรางวัล</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ประเภท</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">จำนวนเงิน</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">โอกาสได้ (%)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5a73c]/10">
                        {prizes.map(prize => (
                          <tr key={prize.id} className="hover:bg-[#2a2420]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="w-8 h-8 rounded border border-[#f5a73c]/30" style={{ backgroundColor: prize.color }}></div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={prize.name}
                                onChange={(e) => handlePrizeChange(prize.id, 'name', e.target.value)}
                                className="px-3 py-1 bg-[#2a2420] border border-[#f5a73c]/30 rounded text-white focus:ring-2 focus:ring-[#f5a73c]"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-400">{prize.type === 'cash' ? 'เงินสด' : 'ของรางวัล'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={prize.amount}
                                onChange={(e) => handlePrizeChange(prize.id, 'amount', parseFloat(e.target.value))}
                                className="w-24 px-3 py-1 bg-[#2a2420] border border-[#f5a73c]/30 rounded text-white focus:ring-2 focus:ring-[#f5a73c]"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={prize.probability}
                                onChange={(e) => handlePrizeChange(prize.id, 'probability', parseFloat(e.target.value))}
                                className="w-20 px-3 py-1 bg-[#2a2420] border border-[#f5a73c]/30 rounded text-white focus:ring-2 focus:ring-[#f5a73c]"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={prize.enabled}
                                onChange={(e) => handlePrizeChange(prize.id, 'enabled', e.target.checked)}
                                className="w-4 h-4 text-[#f5a73c] bg-[#2a2420] border-[#f5a73c]/30 rounded focus:ring-[#f5a73c]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#f5a73c]/20">
                    <p className="text-sm text-gray-400">
                      รวมโอกาส: <span className="text-[#f5a73c] font-medium">{prizes.filter(p => p.enabled).reduce((sum, p) => sum + p.probability, 0).toFixed(2)}%</span>
                    </p>
                    <button
                      onClick={handleSavePrizes}
                      disabled={isSaving}
                      className="px-6 py-2 bg-[#f5a73c] text-[#1a1410] font-medium rounded-lg hover:bg-[#f5a73c]/90 disabled:bg-gray-600 disabled:text-gray-400 flex items-center gap-2 transition-colors"
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
                    <table className="min-w-full divide-y divide-[#f5a73c]/20">
                      <thead className="bg-[#2a2420]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">เวลา</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สมาชิก ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">รางวัล</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">จำนวนเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5a73c]/10">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-[#2a2420]/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {new Date(log.spunAt).toLocaleString('th-TH')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400 font-mono text-xs">{log.memberId.substring(0, 8)}...</td>
                            <td className="px-6 py-4 text-sm text-gray-300">{log.prizeName}</td>
                            <td className="px-6 py-4 text-sm">
                              {log.amount > 0 ? (
                                <span className="text-green-400 font-medium">฿{log.amount.toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f5a73c]/20">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#2a2420] border border-[#f5a73c]/30 text-gray-300 rounded-lg hover:bg-[#f5a73c] hover:text-[#1a1410] disabled:opacity-50 disabled:hover:bg-[#2a2420] disabled:hover:text-gray-300 transition-colors"
                    >
                      ก่อนหน้า
                    </button>
                    <span className="text-sm text-gray-400">
                      หน้า <span className="text-[#f5a73c] font-medium">{page}</span> / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-[#2a2420] border border-[#f5a73c]/30 text-gray-300 rounded-lg hover:bg-[#f5a73c] hover:text-[#1a1410] disabled:opacity-50 disabled:hover:bg-[#2a2420] disabled:hover:text-gray-300 transition-colors"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LuckyWheelManagement
