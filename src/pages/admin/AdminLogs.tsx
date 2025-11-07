import React, { useState, useEffect } from 'react'
import { adminSystemAPI, adminAPIClient } from '../../api/adminAPI'

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
      LOGIN: 'bg-blue-100 text-blue-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      APPROVE_DEPOSIT: 'bg-green-100 text-green-800',
      REJECT_DEPOSIT: 'bg-red-100 text-red-800',
      APPROVE_WITHDRAWAL: 'bg-green-100 text-green-800',
      REJECT_WITHDRAWAL: 'bg-red-100 text-red-800',
      APPROVE_CASHBACK: 'bg-green-100 text-green-800',
      REJECT_CASHBACK: 'bg-red-100 text-red-800',
      CREATE_MEMBER: 'bg-purple-100 text-purple-800',
      UPDATE_MEMBER: 'bg-yellow-100 text-yellow-800',
      DELETE_MEMBER: 'bg-red-100 text-red-800',
      CREDIT_ADJUSTMENT: 'bg-orange-100 text-orange-800',
      CREATE_STAFF: 'bg-purple-100 text-purple-800',
      UPDATE_STAFF: 'bg-yellow-100 text-yellow-800',
      DELETE_STAFF: 'bg-red-100 text-red-800',
      APPROVE_REVIEW: 'bg-green-100 text-green-800',
      REJECT_REVIEW: 'bg-red-100 text-red-800',
    }
    return badges[action] || 'bg-gray-100 text-gray-800'
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ประวัติการทำรายการ</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setOffset(0)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setOffset(0)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              การกระทำ
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setOffset(0)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประเภททรัพยากร
            </label>
            <select
              value={resourceTypeFilter}
              onChange={(e) => {
                setResourceTypeFilter(e.target.value)
                setOffset(0)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              รีเซ็ตตัวกรอง
            </button>
            <button
              onClick={handleExport}
              disabled={loading || logs.length === 0}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              📥 Export CSV
            </button>
          </div>
          <div className="text-sm text-gray-600">
            ทั้งหมด {total} รายการ
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-8">กำลังโหลด...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          ไม่พบข้อมูลประวัติการทำรายการ
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    เวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ผู้ดำเนินการ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    การกระทำ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ทรัพยากร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.adminUsername}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.adminFullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.resourceType && (
                        <div>
                          <div className="text-sm text-gray-900">
                            {log.resourceType}
                          </div>
                          {log.resourceId && (
                            <div className="text-xs text-gray-500">
                              {log.resourceId.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2">
            หน้า {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminLogs
