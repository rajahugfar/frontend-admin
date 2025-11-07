import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi'
import { adminReportAPI } from '../../api/adminAPI'

interface BankSCBTransaction {
  id: string
  transactionDate: string
  transactionId: string | null
  channel: string | null
  fromAccount: string | null
  fromBank: string | null
  fromName: string | null
  toAccount: string | null
  toName: string | null
  amount: number
  balanceBefore: number | null
  balanceAfter: number | null
  description: string | null
  referenceCode: string | null
  matched: boolean
  matchedAt: string | null
}

interface BankSCBStats {
  totalIn: number
  totalOut: number
  netBalance: number
  totalMatched: number
  totalUnmatch: number
  currentBalance: number | null
}

interface BankSCBReportResponse {
  transactions: BankSCBTransaction[]
  stats: BankSCBStats
}

const BankSCBReport: React.FC = () => {
  const [report, setReport] = useState<BankSCBReportResponse | null>(null)
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
      const data = await adminReportAPI.getBankSCBReport({ startDate, endDate })
      setReport(data)
    } catch (error: any) {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error fetching SCB bank report:', error)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">รายงานธนาคาร SCB</h1>
        <p className="text-gray-600">รายการเข้า-ออกและสรุปยอดคงเหลือ SCB</p>
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
        </div>
      </div>

      {/* Stats Grid */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="ยอดเงินเข้า"
              value={`฿${formatCurrency(report.stats.totalIn)}`}
              icon={FiTrendingUp}
              color="text-green-600"
            />
            <StatCard
              title="ยอดเงินออก"
              value={`฿${formatCurrency(report.stats.totalOut)}`}
              icon={FiTrendingDown}
              color="text-red-600"
            />
            <StatCard
              title="ยอดคงเหลือ"
              value={report.stats.currentBalance !== null ? `฿${formatCurrency(report.stats.currentBalance)}` : 'N/A'}
              icon={FiDollarSign}
              color="text-blue-600"
              subValue={`สุทธิ: ฿${formatCurrency(report.stats.netBalance)}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <StatCard
              title="รายการจับคู่แล้ว"
              value={`${report.stats.totalMatched} รายการ`}
              icon={FiCheckCircle}
              color="text-green-600"
            />
            <StatCard
              title="รายการยังไม่จับคู่"
              value={`${report.stats.totalUnmatch} รายการ`}
              icon={FiXCircle}
              color="text-red-600"
            />
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">รายการธุรกรรม</h2>
              <p className="text-sm text-gray-600 mt-1">ทั้งหมด {report.transactions.length} รายการ</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จาก
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ถึง
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนเงิน
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ยอดคงเหลือ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        ไม่พบข้อมูลธุรกรรม
                      </td>
                    </tr>
                  ) : (
                    report.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(tx.transactionDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{tx.fromName || '-'}</div>
                          <div className="text-xs text-gray-500">
                            {tx.fromBank && tx.fromAccount ? `${tx.fromBank} ${tx.fromAccount}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{tx.toName || '-'}</div>
                          <div className="text-xs text-gray-500">
                            {tx.toAccount || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={tx.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {tx.amount > 0 ? '+' : ''}฿{formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {tx.balanceAfter !== null ? `฿${formatCurrency(tx.balanceAfter)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {tx.matched ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              จับคู่แล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <FiXCircle className="w-3 h-3 mr-1" />
                              ยังไม่จับคู่
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

export default BankSCBReport
