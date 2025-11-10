import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiDownload, FiUpload, FiSearch, FiRefreshCw } from 'react-icons/fi'
import { adminTransferAPI } from '../../api/adminAPI'

interface TransferLogItem {
  id: string
  memberId: string
  memberPhone: string
  memberName: string
  type: 'IN' | 'OUT'
  amount: number
  beforeBalance: number
  afterBalance: number
  status: string
  remark: string
  createdAt: string
}

const TransferLog: React.FC = () => {
  const [logs, setLogs] = useState<TransferLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Stats
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    countIn: 0,
    countOut: 0,
  })

  useEffect(() => {
    fetchLogs()
  }, [page, type])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }

      if (search) params.search = search
      if (type !== 'ALL') params.type = type
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await adminTransferAPI.getTransferLogs(params)
      setLogs(response.logs || [])
      setTotal(response.total || 0)

      // Calculate stats
      calculateStats(response.logs || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: TransferLogItem[]) => {
    const inLogs = data.filter((log) => log.type === 'IN')
    const outLogs = data.filter((log) => log.type === 'OUT')

    setStats({
      totalIn: inLogs.reduce((sum, log) => sum + log.amount, 0),
      totalOut: outLogs.reduce((sum, log) => sum + log.amount, 0),
      countIn: inLogs.length,
      countOut: outLogs.length,
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const handleReset = () => {
    setSearch('')
    setType('ALL')
    setStartDate('')
    setEndDate('')
    setPage(1)
    setTimeout(fetchLogs, 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-lg flex items-center justify-center">
              <FiRefreshCw className="w-5 h-5 text-info" />
            </div>
            บันทึกโยกเครดิต
          </h1>
          <p className="text-brown-300 text-sm ml-13">ประวัติการโยกเครดิตเข้า-ออกเกมส์</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm">โยกเข้าเกมส์</p>
              <p className="text-2xl font-bold text-success">{stats.countIn}</p>
              <p className="text-sm text-gold-500 mt-1 font-semibold">฿{formatCurrency(stats.totalIn)}</p>
            </div>
            <div className="p-3 bg-success/20 rounded-full">
              <FiDownload className="text-success text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm">โยกออกเกมส์</p>
              <p className="text-2xl font-bold text-warning">{stats.countOut}</p>
              <p className="text-sm text-gold-500 mt-1 font-semibold">฿{formatCurrency(stats.totalOut)}</p>
            </div>
            <div className="p-3 bg-warning/20 rounded-full">
              <FiUpload className="text-warning text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
          <div>
            <p className="text-brown-400 text-sm">ยอดรวมทั้งหมด</p>
            <p className="text-2xl font-bold text-info">{total}</p>
            <p className="text-sm text-brown-400 mt-1">รายการ</p>
          </div>
        </div>

        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
          <div>
            <p className="text-brown-400 text-sm">ผลต่าง (IN - OUT)</p>
            <p className={`text-2xl font-bold ${stats.totalIn - stats.totalOut >= 0 ? 'text-success' : 'text-error'}`}>
              ฿{formatCurrency(stats.totalIn - stats.totalOut)}
            </p>
            <p className="text-sm text-brown-400 mt-1">ยอดสุทธิ</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-200 mb-1">ค้นหา</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="เบอร์โทร, ชื่อ"
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-200 mb-1">ประเภท</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'ALL' | 'IN' | 'OUT')}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="IN">โยกเข้า</option>
                <option value="OUT">โยกออก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-200 mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-200 mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <FiSearch />
                ค้นหา
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-admin-hover text-brown-200 rounded-lg hover:bg-admin-border transition-all font-semibold"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-admin-border">
            <thead className="bg-gradient-to-r from-admin-bg to-admin-bg/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  วันที่/เวลา
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  สมาชิก
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  จำนวนเงิน
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  ยอดก่อน
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  ยอดหลัง
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="spinner"></div>
                      <span className="text-brown-400">กำลังโหลด...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-brown-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-admin-hover/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brown-100">{log.memberName}</div>
                      <div className="text-sm text-brown-400">{log.memberPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {log.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/20 text-success border border-success/30">
                          <FiDownload />
                          โยกเข้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-warning/20 text-warning border border-warning/30">
                          <FiUpload />
                          โยกออก
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gold-500">
                      ฿{formatCurrency(log.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-brown-300">
                      ฿{formatCurrency(log.beforeBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-brown-300">
                      ฿{formatCurrency(log.afterBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg border ${
                          log.status === 'COMPLETED'
                            ? 'bg-success/20 text-success border-success/30'
                            : log.status === 'FAILED'
                            ? 'bg-error/20 text-error border-error/30'
                            : 'bg-warning/20 text-warning border-warning/30'
                        }`}
                      >
                        {log.status === 'COMPLETED' ? 'สำเร็จ' : log.status === 'FAILED' ? 'ล้มเหลว' : log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brown-400">
                      {log.remark || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="bg-admin-bg/50 px-6 py-4 flex items-center justify-between border-t border-admin-border">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-200 hover:bg-admin-hover disabled:opacity-50 transition-all"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-200 hover:bg-admin-hover disabled:opacity-50 transition-all"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-brown-300">
                  แสดง <span className="font-semibold text-brown-100">{(page - 1) * pageSize + 1}</span> ถึง{' '}
                  <span className="font-semibold text-brown-100">{Math.min(page * pageSize, total)}</span> จาก{' '}
                  <span className="font-semibold text-brown-100">{total}</span> รายการ
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-admin-border text-sm font-medium text-brown-200 hover:bg-admin-hover disabled:opacity-50 transition-all"
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= total}
                    className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-admin-border text-sm font-medium text-brown-200 hover:bg-admin-hover disabled:opacity-50 transition-all"
                  >
                    ถัดไป
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransferLog
