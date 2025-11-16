import React, { useState, useEffect } from 'react'
import { adminSystemAPI, adminAPIClient } from '@/api/adminAPI'

interface AdminLog {
  id: string
  adminId: string
  adminUsername: string
  adminFullName: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

interface AdminLogsResponse {
  logs: AdminLog[]
  total: number
  limit: number
  offset: number
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Filters
  const [actionFilter, setActionFilter] = useState('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState('')
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    fetchLogs()
  }, [actionFilter, resourceTypeFilter, startDate, endDate, offset])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await adminSystemAPI.getAdminLogs({
        action: actionFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        startDate,
        endDate,
        limit,
        offset,
      })
      setLogs(data.logs)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch admin logs:', error)
      alert('ไม่สามารถโหลดข้อมูลประวัติได้')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      LOGIN: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
      LOGOUT: 'bg-admin-card text-gray-400 border border-admin-border',
      APPROVE_DEPOSIT: 'bg-green-500/20 text-green-400 border border-green-500/30',
      REJECT_DEPOSIT: 'bg-error/20 text-red-400 border border-error/30',
      APPROVE_WITHDRAWAL: 'bg-green-500/20 text-green-400 border border-green-500/30',
      REJECT_WITHDRAWAL: 'bg-error/20 text-red-400 border border-error/30',
      APPROVE_CASHBACK: 'bg-green-500/20 text-green-400 border border-green-500/30',
      REJECT_CASHBACK: 'bg-error/20 text-red-400 border border-error/30',
      CREATE_MEMBER: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
      UPDATE_MEMBER: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      DELETE_MEMBER: 'bg-error/20 text-red-400 border border-error/30',
      CREDIT_ADJUSTMENT: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
      CREATE_STAFF: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
      UPDATE_STAFF: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      DELETE_STAFF: 'bg-error/20 text-red-400 border border-error/30',
      APPROVE_REVIEW: 'bg-green-500/20 text-green-400 border border-green-500/30',
      REJECT_REVIEW: 'bg-error/20 text-red-400 border border-error/30',
    }
    return badges[action] || 'bg-admin-card text-gray-400 border border-admin-border'
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const handleReset = () => {
    setActionFilter('')
    setResourceTypeFilter('')
    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
    setOffset(0)
  }

  const handleExport = async () => {
    try {
      const response = await adminAPIClient.get('/system/logs/export', {
        params: {
          action: actionFilter || undefined,
          resourceType: resourceTypeFilter || undefined,
          startDate,
          endDate,
        },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `admin_logs_${startDate}_${endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      alert('ดาวน์โหลดรายงานสำเร็จ')
    } catch (error) {
      alert('ไม่สามารถดาวน์โหลดรายงานได้')
      console.error('Export error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary-500 font-display">ประวัติการทำรายการ</h1>

        {/* Filters */}
        <div className="bg-admin-card border border-admin-border rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setOffset(0)
                }}
                title="วันที่เริ่มต้น"
                className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-400 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setOffset(0)
                }}
                title="วันที่สิ้นสุด"
                className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-400 mb-2">
                การกระทำ
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setOffset(0)
                }}
                title="การกระทำ"
                className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">ทั้งหมด</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="APPROVE_DEPOSIT">APPROVE_DEPOSIT</option>
                <option value="REJECT_DEPOSIT">REJECT_DEPOSIT</option>
                <option value="APPROVE_WITHDRAWAL">APPROVE_WITHDRAWAL</option>
                <option value="REJECT_WITHDRAWAL">REJECT_WITHDRAWAL</option>
                <option value="APPROVE_CASHBACK">APPROVE_CASHBACK</option>
                <option value="REJECT_CASHBACK">REJECT_CASHBACK</option>
                <option value="CREDIT_ADJUSTMENT">CREDIT_ADJUSTMENT</option>
                <option value="CREATE_MEMBER">CREATE_MEMBER</option>
                <option value="UPDATE_MEMBER">UPDATE_MEMBER</option>
                <option value="DELETE_MEMBER">DELETE_MEMBER</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-400 mb-2">
                ประเภททรัพยากร
              </label>
              <select
                value={resourceTypeFilter}
                onChange={(e) => {
                  setResourceTypeFilter(e.target.value)
                  setOffset(0)
                }}
                title="ประเภททรัพยากร"
                className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">ทั้งหมด</option>
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="WITHDRAWAL">WITHDRAWAL</option>
                <option value="CASHBACK">CASHBACK</option>
                <option value="MEMBER">MEMBER</option>
                <option value="STAFF">STAFF</option>
                <option value="REVIEW">REVIEW</option>
                <option value="PROMOTION">PROMOTION</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 text-sm text-gray-400 hover:text-primary-400 hover:bg-admin-hover border border-admin-border rounded-lg transition-all"
              >
                รีเซ็ตตัวกรอง
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={loading || logs.length === 0}
                className="px-5 py-2.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-admin-border disabled:text-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-glow"
              >
                📥 Export CSV
              </button>
            </div>
            <div className="text-sm text-primary-400 font-medium">
              ทั้งหมด <span className="text-primary-500 font-bold">{total}</span> รายการ
            </div>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="bg-admin-card border border-admin-border rounded-lg shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-gray-400">กำลังโหลด...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-admin-card border border-admin-border rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-400 text-lg">ไม่พบข้อมูลประวัติการทำรายการ</p>
          </div>
        ) : (
          <div className="bg-admin-card border border-admin-border rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-admin-border">
                <thead className="bg-admin-bg">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                      เวลา
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                      ผู้ดำเนินการ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                      การกระทำ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                      ทรัพยากร
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-admin-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200">
                          {log.adminUsername}
                        </div>
                        <div className="text-sm text-gray-400">
                          {log.adminFullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.resourceType && (
                          <div>
                            <div className="text-sm text-gray-200 font-medium">
                              {log.resourceType}
                            </div>
                            {log.resourceId && (
                              <div className="text-xs text-gray-400 font-mono">
                                {log.resourceId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {log.ipAddress || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-6 flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-5 py-2.5 bg-admin-card border border-admin-border rounded-lg text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-admin-hover hover:text-primary-400 transition-all shadow-lg"
            >
              ← ก่อนหน้า
            </button>
            <span className="px-6 py-2.5 bg-admin-card border border-admin-border rounded-lg text-gray-300">
              หน้า <span className="text-primary-500 font-bold">{Math.floor(offset / limit) + 1}</span> / <span className="text-primary-400">{Math.ceil(total / limit)}</span>
            </span>
            <button
              type="button"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-5 py-2.5 bg-admin-card border border-admin-border rounded-lg text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-admin-hover hover:text-primary-400 transition-all shadow-lg"
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminLogs
