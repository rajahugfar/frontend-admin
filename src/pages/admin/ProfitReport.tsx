import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiRefreshCw, FiDownload } from 'react-icons/fi'
import { adminReportAPI, adminAPIClient } from '../../api/adminAPI'

interface ProfitSummary {
  totalDeposits: number
  totalWithdrawals: number
  totalBonuses: number
  totalCashback: number
  netProfit: number
  depositCount: number
  withdrawalCount: number
  newMemberCount: number
}

const ProfitReport: React.FC = () => {
  const [summary, setSummary] = useState<ProfitSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await adminReportAPI.getProfitSummary({ startDate, endDate })
      setSummary(data)
    } catch (error: any) {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error fetching profit summary:', error)
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

  const handleExport = async () => {
    try {
      toast.loading('กำลังสร้างไฟล์ CSV...')
      const response = await adminAPIClient.get('/reports/profit/export', {
        params: { startDate, endDate },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `profit_report_${startDate}_${endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('ดาวน์โหลดรายงานสำเร็จ')
    } catch (error) {
      toast.dismiss()
      toast.error('ไม่สามารถดาวน์โหลดรายงานได้')
      console.error('Export error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subValue
  }: {
    title: string
    value: string
    icon: any
    color: string
    subValue?: string
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-gray-500 mt-1">{subValue}</p>
          )}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">สรุปรายได้</h1>
        <p className="text-gray-600">รายงานสรุปยอดรายได้และกำไร</p>
      </div>

      {/* Date Range Filter */}
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

          <button
            onClick={handleExport}
            disabled={loading || !summary}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : summary ? (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="ยอดฝากทั้งหมด"
              value={`฿${formatCurrency(summary.totalDeposits)}`}
              icon={FiTrendingUp}
              color="text-green-600"
              subValue={`${summary.depositCount} รายการ`}
            />
            <StatCard
              title="ยอดถอนทั้งหมด"
              value={`฿${formatCurrency(summary.totalWithdrawals)}`}
              icon={FiTrendingDown}
              color="text-red-600"
              subValue={`${summary.withdrawalCount} รายการ`}
            />
            <StatCard
              title="โบนัสที่จ่าย"
              value={`฿${formatCurrency(summary.totalBonuses)}`}
              icon={FiDollarSign}
              color="text-purple-600"
            />
            <StatCard
              title="แคชแบ็คที่จ่าย"
              value={`฿${formatCurrency(summary.totalCashback)}`}
              icon={FiDollarSign}
              color="text-blue-600"
            />
          </div>

          {/* Net Profit Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">กำไรสุทธิ</p>
                <p className="text-4xl font-bold">฿{formatCurrency(summary.netProfit)}</p>
                <p className="text-blue-100 text-sm mt-2">
                  = ฝาก (฿{formatCurrency(summary.totalDeposits)}) - ถอน (฿{formatCurrency(summary.totalWithdrawals)}) - โบนัส (฿{formatCurrency(summary.totalBonuses)}) - แคชแบ็ค (฿{formatCurrency(summary.totalCashback)})
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <FiDollarSign className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="สมาชิกใหม่"
              value={summary.newMemberCount.toString()}
              icon={FiUsers}
              color="text-blue-600"
              subValue="คน"
            />
            <StatCard
              title="ค่าเฉลี่ยต่อรายการฝาก"
              value={`฿${formatCurrency(summary.depositCount > 0 ? summary.totalDeposits / summary.depositCount : 0)}`}
              icon={FiTrendingUp}
              color="text-green-600"
            />
            <StatCard
              title="ค่าเฉลี่ยต่อรายการถอน"
              value={`฿${formatCurrency(summary.withdrawalCount > 0 ? summary.totalWithdrawals / summary.withdrawalCount : 0)}`}
              icon={FiTrendingDown}
              color="text-red-600"
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">ไม่มีข้อมูล</p>
        </div>
      )}
    </div>
  )
}

export default ProfitReport
