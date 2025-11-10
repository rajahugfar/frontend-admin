import { useState, useEffect } from 'react'
import { FiGift, FiDollarSign, FiTrendingUp, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

interface PromotionSummary {
  bonus_total: {
    totalAmount: number
    totalCount: number
  }
  bonus_auto: {
    totalAmount: number
    totalCount: number
  }
  bonus_manual: {
    totalAmount: number
    totalCount: number
  }
}

interface PromotionTransaction {
  id: number
  created_at: string
  username: string
  promotion_name: string
  wl_winloss: number
  amount: number
  beforeAmount: number
  creditBalance: number
  bywhat: 'auto' | 'manual'
  status: number
}

const PromotionSummary = () => {
  const [summary, setSummary] = useState<PromotionSummary | null>(null)
  const [transactions, setTransactions] = useState<PromotionTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  
  // Filters
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0])
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0])
  const [listType, setListType] = useState<'all' | 'auto' | 'manual'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadSummary = async () => {
    try {
      const adminSelector = localStorage.getItem('admin_selector')
      if (!adminSelector) {
        toast.error('กรุณาเข้าสู่ระบบใหม่')
        return
      }

      const params = new URLSearchParams({
        start_date: dateStart,
        end_date: dateEnd,
        type: listType
      })

      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/summary?${params}`, {
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSummary(data.data)
      } else {
        toast.error(data.message || 'ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (error) {
      console.error('Error loading summary:', error)
      toast.error('ไม่สามารถโหลดสรุปข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    setTableLoading(true)
    try {
      const adminSelector = localStorage.getItem('admin_selector')
      if (!adminSelector) {
        toast.error('กรุณาเข้าสู่ระบบใหม่')
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
        start_date: dateStart,
        end_date: dateEnd,
        type: listType
      })

      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/promotions/transactions?${params}`, {
        headers: { 
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.total_page)
        }
      } else {
        toast.error(data.message || 'ไม่สามารถโหลดรายการได้')
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('ไม่สามารถโหลดรายการได้')
    } finally {
      setTableLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStart, dateEnd, listType])

  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateStart, dateEnd, listType])

  const handleRefresh = () => {
    loadSummary()
    loadTransactions()
    toast.success('รีเฟรชข้อมูลเรียบร้อย')
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('กำลังดาวน์โหลดข้อมูล...')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gold-500 flex items-center gap-2">
          <FiGift />
          สรุปโปรโมชั่น
        </h1>
        <p className="text-brown-400 mt-1">ภาพรวมและรายการโปรโมชั่นที่สมาชิกรับ</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-admin-card border border-admin-border rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-admin-hover rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-admin-hover rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total */}
          <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">ยอดฝากทั้งหมด</span>
              <FiDollarSign className="text-3xl text-gold-500 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-gold-500 mb-1">
              ฿{summary.bonus_total.totalAmount.toLocaleString()}
            </div>
            <div className="text-brown-400 text-sm">
              {summary.bonus_total.totalCount} ครั้ง
            </div>
          </div>

          {/* Auto */}
          <div className="bg-gradient-to-br from-success/20 to-success/30 border border-success/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">ปรับออโต้</span>
              <FiTrendingUp className="text-3xl text-success opacity-50" />
            </div>
            <div className="text-3xl font-bold text-success mb-1">
              ฿{summary.bonus_auto.totalAmount.toLocaleString()}
            </div>
            <div className="text-brown-400 text-sm">
              {summary.bonus_auto.totalCount} ครั้ง
            </div>
          </div>

          {/* Manual */}
          <div className="bg-gradient-to-br from-warning/20 to-warning/30 border border-warning/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brown-400">ปรับมือ</span>
              <FiGift className="text-3xl text-warning opacity-50" />
            </div>
            <div className="text-3xl font-bold text-warning mb-1">
              ฿{summary.bonus_manual.totalAmount.toLocaleString()}
            </div>
            <div className="text-brown-400 text-sm">
              {summary.bonus_manual.totalCount} ครั้ง
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-brown-400">วันที่:</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="input text-sm"
            />
            <span className="text-brown-500">-</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="input text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-brown-400" />
            <select
              value={listType}
              onChange={(e) => setListType(e.target.value as 'all' | 'auto' | 'manual')}
              className="input text-sm"
            >
              <option value="all">ทั้งหมด</option>
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Actions */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium"
            >
              <FiRefreshCw />
              รีเฟรช
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-success/20 text-success border border-success/30 rounded-lg hover:bg-success/30 transition-colors font-medium"
            >
              <FiDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg">
        <div className="p-4 border-b border-admin-border">
          <h3 className="font-semibold text-gold-500">รายการโปรโมชั่น</h3>
        </div>

        <div className="overflow-x-auto">
          {tableLoading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-brown-400">
              ไม่พบข้อมูล
            </div>
          ) : (
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-hover">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-400 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-400 uppercase">ทำรายการเมื่อ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-400 uppercase">ยูส</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-400 uppercase">รายการ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">ยอดรวม</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">โบนัส</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">ก่อนรับ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-400 uppercase">เครดิตปัจจุบัน</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-brown-400 uppercase">ประเภท</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-brown-400 uppercase">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {transactions.map((tx, index) => (
                  <tr key={tx.id} className="hover:bg-admin-hover">
                    <td className="px-4 py-3 text-sm text-brown-200">
                      {(page - 1) * 20 + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-brown-300">
                      {new Date(tx.created_at).toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gold-500/20 text-gold-500">
                        {tx.username.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brown-300">
                      {tx.promotion_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-brown-200">
                      ฿{tx.wl_winloss.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-success">
                      ฿{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-brown-400">
                      {tx.beforeAmount.toLocaleString()} เครดิต
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gold-500">
                      {tx.creditBalance.toLocaleString()} เครดิต
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        tx.bywhat === 'auto' 
                          ? 'bg-success/20 text-success border border-success/30' 
                          : 'bg-warning/20 text-warning border border-warning/30'
                      }`}>
                        {tx.bywhat.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        tx.status === 1 
                          ? 'bg-success/20 text-success border border-success/30' 
                          : 'bg-error/20 text-error border border-error/30'
                      }`}>
                        {tx.status === 1 ? 'SUCCESS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-admin-border flex items-center justify-between">
            <div className="text-sm text-brown-400">
              หน้า {page} จาก {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gold-500/30 text-gold-500 rounded-lg hover:bg-gold-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gold-500/30 text-gold-500 rounded-lg hover:bg-gold-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromotionSummary
