import { useState, useEffect } from 'react'
import { FiGift, FiUsers, FiTrendingUp, FiCheckCircle, FiX, FiClock, FiFilter, FiDownload } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface MemberPromotion {
  id: number
  member_id: string
  member_phone: string
  member_fullname: string | null
  promotion_id: number
  promotion_name: string
  promotion_type: string
  deposit_amount: number
  bonus_amount: number
  required_turnover: number
  current_turnover: number
  turnover_progress: number
  status: string
  claimed_at: string
  completed_at: string | null
}

interface PromotionLog {
  id: number
  member_promotion_id: number
  member_id: string
  member_phone: string
  member_fullname: string | null
  promotion_name: string
  action: string
  description: string
  old_value: number
  new_value: number
  created_at: string
}

interface DashboardStats {
  active_promotions: number
  completed_today: number
  total_active_bonus: number
  bonus_given_today: number
}

const PromotionLogsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'logs'>('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [memberPromotions, setMemberPromotions] = useState<MemberPromotion[]>([])
  const [logs, setLogs] = useState<PromotionLog[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMemberPromotions()
    } else if (activeTab === 'logs') {
      fetchLogs()
    }
  }, [activeTab, statusFilter, actionFilter, page])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/v1/admin/promotions/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMemberPromotions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`/api/v1/admin/promotions/members?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setMemberPromotions(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.total_page)
        }
      }
    } catch (error) {
      console.error('Error fetching member promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '50',
        ...(actionFilter && { action: actionFilter })
      })
      
      const response = await fetch(`/api/v1/admin/promotions/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.total_page)
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelPromotion = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกโปรโมชั่นนี้?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/v1/admin/promotions/member-promotions/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'ยกเลิกโดย Admin' })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('ยกเลิกโปรโมชั่นเรียบร้อยแล้ว')
        fetchMemberPromotions()
        fetchDashboardStats()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการยกเลิกโปรโมชั่น')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      active: { color: 'bg-green-100 text-green-800', text: 'กำลังใช้งาน' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'เสร็จสิ้น' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'ยกเลิก' },
      expired: { color: 'bg-gray-100 text-gray-800', text: 'หมดอายุ' }
    }
    
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getActionBadge = (action: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      claimed: { color: 'bg-green-100 text-green-800', text: 'รับโปรโมชั่น' },
      turnover_updated: { color: 'bg-blue-100 text-blue-800', text: 'อัพเดทเทิร์น' },
      completed: { color: 'bg-purple-100 text-purple-800', text: 'ทำเทิร์นครบ' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'ยกเลิก' },
      expired: { color: 'bg-gray-100 text-gray-800', text: 'หมดอายุ' }
    }
    
    const badge = badges[action] || { color: 'bg-gray-100 text-gray-800', text: action }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">จัดการโปรโมชั่น</h1>
        <p className="text-gray-600">ดูและจัดการโปรโมชั่นที่สมาชิกรับ</p>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">โปรโมชั่นที่ใช้งาน</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_promotions}</p>
              </div>
              <FiGift className="text-3xl text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้นวันนี้</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed_today}</p>
              </div>
              <FiCheckCircle className="text-3xl text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">โบนัสที่ใช้งาน</p>
                <p className="text-2xl font-bold text-purple-600">
                  ฿{stats.total_active_bonus.toLocaleString()}
                </p>
              </div>
              <FiTrendingUp className="text-3xl text-purple-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">โบนัสวันนี้</p>
                <p className="text-2xl font-bold text-orange-600">
                  ฿{stats.bonus_given_today.toLocaleString()}
                </p>
              </div>
              <FiGift className="text-3xl text-orange-600 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => { setActiveTab('overview'); setPage(1); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => { setActiveTab('members'); setPage(1); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'members'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              โปรโมชั่นสมาชิก
            </button>
            <button
              onClick={() => { setActiveTab('logs'); setPage(1); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'logs'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FiClock className="inline mr-2" />
              ประวัติ Logs
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <FiGift className="mx-auto text-6xl text-purple-600 opacity-50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">ระบบจัดการโปรโมชั่น</h3>
              <p className="text-gray-600 mb-4">เลือกแท็บด้านบนเพื่อดูข้อมูล</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('members')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  ดูโปรโมชั่นสมาชิก
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  ดูประวัติ Logs
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              {/* Filters */}
              <div className="mb-4 flex gap-4">
                <div className="flex items-center gap-2">
                  <FiFilter />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">ทุกสถานะ</option>
                    <option value="active">กำลังใช้งาน</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                    <option value="expired">หมดอายุ</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : memberPromotions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูล
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สมาชิก</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">โปรโมชั่น</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดฝาก</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">โบนัส</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">เทิร์นโอเวอร์</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {memberPromotions.map((promo) => (
                        <tr key={promo.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{promo.member_phone}</div>
                            {promo.member_fullname && (
                              <div className="text-xs text-gray-500">{promo.member_fullname}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{promo.promotion_name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(promo.claimed_at).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            ฿{promo.deposit_amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                            ฿{promo.bonus_amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-right mb-1">
                              {promo.turnover_progress.toFixed(1)}%
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${Math.min(promo.turnover_progress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-right text-gray-500 mt-1">
                              {promo.current_turnover.toLocaleString()} / {promo.required_turnover.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(promo.status)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {promo.status === 'active' && (
                              <button
                                onClick={() => cancelPromotion(promo.id)}
                                className="text-red-600 hover:text-red-800"
                                title="ยกเลิก"
                              >
                                <FiX size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="px-3 py-1">
                    หน้า {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              {/* Filters */}
              <div className="mb-4 flex gap-4">
                <div className="flex items-center gap-2">
                  <FiFilter />
                  <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">ทุก Action</option>
                    <option value="claimed">รับโปรโมชั่น</option>
                    <option value="turnover_updated">อัพเดทเทิร์น</option>
                    <option value="completed">ทำเทิร์นครบ</option>
                    <option value="cancelled">ยกเลิก</option>
                    <option value="expired">หมดอายุ</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูล
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getActionBadge(log.action)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.member_phone}
                              {log.member_fullname && ` (${log.member_fullname})`}
                            </div>
                            <div className="text-xs text-gray-500">{log.promotion_name}</div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                      
                      {log.old_value !== log.new_value && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>฿{log.old_value.toLocaleString()}</span>
                          <span>→</span>
                          <span className="font-semibold text-purple-600">
                            ฿{log.new_value.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="px-3 py-1">
                    หน้า {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromotionLogsPage
