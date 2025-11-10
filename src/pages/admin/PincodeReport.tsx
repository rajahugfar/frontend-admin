import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiFileText, FiCheckCircle, FiXCircle, FiUsers, FiRefreshCw, FiFilter } from 'react-icons/fi'
import { adminReportAPI } from '../../api/adminAPI'

interface PincodeLog {
  id: string
  action: string
  msg: string | null
  request: any
  isExpired: string
  status: boolean | null
  adminId: string | null
  username: string | null
  createdBy: string | null
  createdAt: string
  updateAt: string | null
}

interface PincodeStats {
  totalLogs: number
  successCount: number
  failCount: number
  uniqueAdmins: number
}

interface PincodeReportResponse {
  logs: PincodeLog[]
  stats: PincodeStats
  total: number
}

const PincodeReport: React.FC = () => {
  const [report, setReport] = useState<PincodeReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [actionFilter, setActionFilter] = useState<string>('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: any = { startDate, endDate }
      if (actionFilter) {
        params.action = actionFilter
      }
      const data = await adminReportAPI.getPincodeReport(params)
      setReport(data)
    } catch (error: any) {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error fetching pincode report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = () => {
    if (!startDate || !endDate) {
      toast.error('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด')
      return
    }
    fetchData()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'request':
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'verify':
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'failed':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string
    value: string
    icon: any
    color: string
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.includes('green') ? 'bg-green-100' : color.includes('red') ? 'bg-red-100' : color.includes('blue') ? 'bg-blue-100' : 'bg-purple-100'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">รายงาน Pincode</h1>
        <p className="text-gray-600">ประวัติการใช้ Pincode ของ Admin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline w-4 h-4 mr-1" />
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              <option value="request">Request</option>
              <option value="verify">Verify</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                <span>กำลังโหลด...</span>
              </>
            ) : (
              <>
                <FiRefreshCw className="w-5 h-5" />
                <span>ค้นหา</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="รายการทั้งหมด"
              value={`${report.stats.totalLogs}`}
              icon={FiFileText}
              color="text-blue-600"
            />
            <StatCard
              title="สำเร็จ"
              value={`${report.stats.successCount}`}
              icon={FiCheckCircle}
              color="text-green-600"
            />
            <StatCard
              title="ไม่สำเร็จ"
              value={`${report.stats.failCount}`}
              icon={FiXCircle}
              color="text-red-600"
            />
            <StatCard
              title="Admin ที่ใช้งาน"
              value={`${report.stats.uniqueAdmins}`}
              icon={FiUsers}
              color="text-purple-600"
            />
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">รายการ Pincode Log</h2>
              <p className="text-sm text-gray-600 mt-1">ทั้งหมด {report.total} รายการ</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ข้อความ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        ไม่พบข้อมูล Pincode Log
                      </td>
                    </tr>
                  ) : (
                    report.logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{log.username || '-'}</div>
                          {log.createdBy && (
                            <div className="text-xs text-gray-500">โดย: {log.createdBy}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.msg || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {log.status === null ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              -
                            </span>
                          ) : log.status ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              สำเร็จ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FiXCircle className="w-3 h-3 mr-1" />
                              ล้มเหลว
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && !report && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PincodeReport
