import { useState, useEffect } from 'react'
import { FiGift, FiUsers, FiTrendingUp, FiCheckCircle, FiX, FiClock, FiFilter, FiDownload } from 'react-icons/fi'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

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
      const adminSelector = localStorage.getItem('admin_selector')
      if (!adminSelector) return
      
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/dashboard`, {
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to fetch')
      
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
      const adminSelector = localStorage.getItem('admin_selector')
      if (!adminSelector) {
        toast.error('กรุณาเข้าสู่ระบบใหม่')
        return
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/members?${params}`, {
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      
      if (data.success) {
        setMemberPromotions(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.total_page)
        }
      }
    } catch (error) {
      console.error('Error fetching member promotions:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const adminSelector = localStorage.getItem('admin_selector')
      if (!adminSelector) {
        toast.error('กรุณาเข้าสู่ระบบใหม่')
        return
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '50',
        ...(actionFilter && { action: actionFilter })
      })
      
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/logs?${params}`, {
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.total_page)
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const cancelPromotion = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกโปรโมชั่นนี้?')) return

    try {
      const adminSelector = localStorage.getItem('admin_selector')
      if (!adminSelector) {
        toast.error('กรุณาเข้าสู่ระบบใหม่')
        return
      }
      
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/member-promotions/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason: 'ยกเลิกโดย Admin' })
      })
      
      if (!response.ok) throw new Error('Failed to cancel')
      
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gold-500 flex items-center gap-2">
          <FiGift />
          จัดการโปรโมชั่น
        </h1>
        <p className="text-brown-400 mt-1">ดูและจัดการโปรโมชั่นที่สมาชิกรับ</p>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-success/20 to-success/30 border border-success/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">โปรโมชั่นที่ใช้งาน</span>
              <FiGift className="text-3xl text-success opacity-50" />
            </div>
            <div className="text-3xl font-bold text-success">{stats.active_promotions}</div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">เสร็จสิ้นวันนี้</span>
              <FiCheckCircle className="text-3xl text-primary opacity-50" />
            </div>
            <div className="text-3xl font-bold text-primary">{stats.completed_today}</div>
          </div>

          <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">โบนัสที่ใช้งาน</span>
              <FiTrendingUp className="text-3xl text-gold-500 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-gold-500">
              ฿{stats.total_active_bonus.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-warning/20 to-warning/30 border border-warning/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">โบนัสวันนี้</span>
              <FiGift className="text-3xl text-warning opacity-50" />
            </div>
            <div className="text-3xl font-bold text-warning">
              ฿{stats.bonus_given_today.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg">
        <div className="border-b border-admin-border">
          <nav className="flex -mb-px">
            <button
              onClick={() => { setActiveTab('overview'); setPage(1); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-brown-400 hover:text-gold-500 hover:border-gold-500/50'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => { setActiveTab('members'); setPage(1); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-brown-400 hover:text-gold-500 hover:border-gold-500/50'
              }`}
            >
              <FiUsers className="inline mr-2" />
              โปรโมชั่นสมาชิก
            </button>
            <button
              onClick={() => { setActiveTab('logs'); setPage(1); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-brown-400 hover:text-gold-500 hover:border-gold-500/50'
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
              <FiGift className="mx-auto text-6xl text-gold-500 opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-brown-200 mb-2">ระบบจัดการโปรโมชั่น</h3>
              <p className="text-brown-400 mb-4">เลือกแท็บด้านบนเพื่อดูข้อมูล</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('members')}
                  className="btn-primary"
                >
                  ดูโปรโมชั่นสมาชิก
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="btn-secondary"
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
                  <FiFilter className="text-brown-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="input text-sm"
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
                <div className="text-center py-12">
                  <div className="spinner mx-auto"></div>
                </div>
              ) : memberPromotions.length === 0 ? (
                <div className="text-center py-12 text-brown-400">
                  ไม่พบข้อมูล
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-admin-border">
                    <thead className="bg-admin-hover">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-brown-400 uppercase">สมาชิก</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-brown-400 uppercase">โปรโมชั่น</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">ยอดฝาก</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">โบนัส</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">เทิร์นโอเวอร์</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-brown-400 uppercase">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-brown-400 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border">
                      {memberPromotions.map((promo) => (
                        <tr key={promo.id} className="hover:bg-admin-hover">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-brown-200">{promo.member_phone}</div>
                            {promo.member_fullname && (
                              <div className="text-xs text-brown-400">{promo.member_fullname}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-brown-200">{promo.promotion_name}</div>
                            <div className="text-xs text-brown-400">
                              {new Date(promo.claimed_at).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-brown-200">
                            ฿{promo.deposit_amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-success">
                            ฿{promo.bonus_amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-right mb-1 text-brown-300">
                              {promo.turnover_progress.toFixed(1)}%
                            </div>
                            <div className="w-24 bg-admin-hover rounded-full h-2">
                              <div
                                className="bg-gold-500 h-2 rounded-full"
                                style={{ width: `${Math.min(promo.turnover_progress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-right text-brown-400 mt-1">
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
                                className="text-error hover:text-error/80 transition-colors"
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
                  <FiFilter className="text-brown-400" />
                  <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="input text-sm"
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
                <div className="text-center py-12">
                  <div className="spinner mx-auto"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-brown-400">
                  ไม่พบข้อมูล
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-admin-border rounded-lg p-4 bg-admin-card/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getActionBadge(log.action)}
                          <div>
                            <div className="text-sm font-medium text-brown-200">
                              {log.member_phone}
                              {log.member_fullname && ` (${log.member_fullname})`}
                            </div>
                            <div className="text-xs text-brown-400">{log.promotion_name}</div>
                          </div>
                        </div>
                        <span className="text-xs text-brown-400">
                          {new Date(log.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-brown-300 mb-2">{log.description}</p>
                      
                      {log.old_value !== log.new_value && (
                        <div className="flex items-center gap-2 text-xs text-brown-400">
                          <span>฿{log.old_value.toLocaleString()}</span>
                          <span>→</span>
                          <span className="font-semibold text-gold-500">
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
