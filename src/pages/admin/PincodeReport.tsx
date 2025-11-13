import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FaKey,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaClock
} from 'react-icons/fa'
import { adminReportAPI } from '@/api/adminAPI'

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

const PincodeReport = () => {
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
        return 'bg-info/20 text-info'
      case 'verify':
      case 'verified':
        return 'bg-success/20 text-success'
      case 'expired':
        return 'bg-error/20 text-error'
      case 'failed':
        return 'bg-warning/20 text-warning'
      default:
        return 'bg-brown-500/20 text-brown-400'
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
  }: {
    title: string
    value: string
    icon: any
    colorClass: string
    bgClass: string
  }) => (
    <div className="bg-admin-card border border-admin-border rounded-lg p-6 hover:border-gold-500/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-brown-400 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgClass}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
    </div>
  )

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-admin-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-admin-bg p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brown-100 flex items-center gap-3">
          <FaKey className="text-gold-500" />
          รายงาน Pincode
        </h1>
        <p className="text-brown-400 mt-1">
          ประวัติการใช้งาน Pincode และการยืนยันตัวตนของ Admin
        </p>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gold-500" />
          <h2 className="text-lg font-semibold text-brown-100">ตัวกรอง</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">
              <FaCalendarAlt className="inline w-4 h-4 mr-1" />
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">
              <FaCalendarAlt className="inline w-4 h-4 mr-1" />
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="request">Request</option>
              <option value="verify">Verify</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <FaSearch className="w-4 h-4" />
              <span>ค้นหา</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="รายการทั้งหมด"
              value={`${report.stats.totalLogs}`}
              icon={FaFileAlt}
              colorClass="text-info"
              bgClass="bg-info/20"
            />
            <StatCard
              title="สำเร็จ (Success)"
              value={`${report.stats.successCount}`}
              icon={FaCheckCircle}
              colorClass="text-success"
              bgClass="bg-success/20"
            />
            <StatCard
              title="ล้มเหลว (Failed)"
              value={`${report.stats.failCount}`}
              icon={FaTimesCircle}
              colorClass="text-error"
              bgClass="bg-error/20"
            />
            <StatCard
              title="Admin ที่ใช้งาน"
              value={`${report.stats.uniqueAdmins}`}
              icon={FaUserShield}
              colorClass="text-warning"
              bgClass="bg-warning/20"
            />
          </div>

          {/* Logs Table */}
          <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-admin-border">
              <div className="flex items-center gap-2">
                <FaClock className="text-gold-500" />
                <h2 className="text-lg font-semibold text-brown-100">รายการ Pincode Log</h2>
              </div>
              <p className="text-sm text-brown-400 mt-1">ทั้งหมด {report.total} รายการ</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-admin-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      วันที่-เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      ข้อความ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {report.logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <FaKey className="text-5xl text-brown-600 mx-auto mb-3" />
                        <p className="text-brown-400">ไม่พบข้อมูล Pincode Log</p>
                      </td>
                    </tr>
                  ) : (
                    report.logs.map((log) => (
                      <tr key={log.id} className="hover:bg-admin-hover transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-brown-200">
                          <div className="font-medium">{log.username || '-'}</div>
                          {log.createdBy && (
                            <div className="text-xs text-brown-400">โดย: {log.createdBy}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-brown-200">
                          {log.msg || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {log.status === null ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brown-500/20 text-brown-400">
                              -
                            </span>
                          ) : log.status ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                              สำเร็จ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-error/20 text-error">
                              <FaTimesCircle className="w-3 h-3 mr-1" />
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
    </div>
  )
}

export default PincodeReport
