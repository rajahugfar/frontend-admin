import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FaUniversity,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaCalendarAlt,
  FaExchangeAlt
} from 'react-icons/fa'
import { adminReportAPI } from '@/api/adminAPI'

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

const BankSCBReport = () => {
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
    colorClass,
    bgClass,
    subValue
  }: {
    title: string
    value: string
    icon: any
    colorClass: string
    bgClass: string
    subValue?: string
  }) => (
    <div className="bg-admin-card border border-admin-border rounded-lg p-6 hover:border-gold-500/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-brown-400 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-brown-500 mt-2">{subValue}</p>
          )}
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
          <FaUniversity className="text-gold-500" />
          รายงานธนาคาร SCB
        </h1>
        <p className="text-brown-400 mt-1">
          รายการเข้า-ออกและสรุปยอดคงเหลือธนาคารไทยพาณิชย์
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarAlt className="text-gold-500" />
          <h2 className="text-lg font-semibold text-brown-100">ระบุช่วงเวลา</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">
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
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="ยอดเงินเข้า (Credit)"
              value={`฿${formatCurrency(report.stats.totalIn)}`}
              icon={FaArrowUp}
              colorClass="text-success"
              bgClass="bg-success/20"
            />
            <StatCard
              title="ยอดเงินออก (Debit)"
              value={`฿${formatCurrency(report.stats.totalOut)}`}
              icon={FaArrowDown}
              colorClass="text-error"
              bgClass="bg-error/20"
            />
            <StatCard
              title="ยอดคงเหลือปัจจุบัน"
              value={report.stats.currentBalance !== null ? `฿${formatCurrency(report.stats.currentBalance)}` : 'N/A'}
              icon={FaWallet}
              colorClass="text-info"
              bgClass="bg-info/20"
              subValue={`สุทธิ: ฿${formatCurrency(report.stats.netBalance)}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <StatCard
              title="รายการจับคู่แล้ว (Matched)"
              value={`${report.stats.totalMatched} รายการ`}
              icon={FaCheckCircle}
              colorClass="text-success"
              bgClass="bg-success/20"
            />
            <StatCard
              title="รายการยังไม่จับคู่ (Unmatched)"
              value={`${report.stats.totalUnmatch} รายการ`}
              icon={FaTimesCircle}
              colorClass="text-warning"
              bgClass="bg-warning/20"
            />
          </div>

          {/* Transactions Table */}
          <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-admin-border">
              <div className="flex items-center gap-2">
                <FaExchangeAlt className="text-gold-500" />
                <h2 className="text-lg font-semibold text-brown-100">รายการธุรกรรม</h2>
              </div>
              <p className="text-sm text-brown-400 mt-1">ทั้งหมด {report.transactions.length} รายการ</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-admin-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      วันที่-เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      ผู้โอน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                      ผู้รับ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-brown-300 uppercase tracking-wider">
                      จำนวนเงิน
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-brown-300 uppercase tracking-wider">
                      ยอดคงเหลือ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {report.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FaExchangeAlt className="text-5xl text-brown-600 mx-auto mb-3" />
                        <p className="text-brown-400">ไม่พบข้อมูลธุรกรรม</p>
                      </td>
                    </tr>
                  ) : (
                    report.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-admin-hover transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                          {formatDateTime(tx.transactionDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-brown-200">
                          <div className="font-medium">{tx.fromName || '-'}</div>
                          <div className="text-xs text-brown-400">
                            {tx.fromBank && tx.fromAccount ? `${tx.fromBank} ${tx.fromAccount}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-brown-200">
                          <div className="font-medium">{tx.toName || '-'}</div>
                          <div className="text-xs text-brown-400">
                            {tx.toAccount || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-error'}`}>
                            {tx.amount > 0 ? '+' : ''}฿{formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-brown-200">
                          {tx.balanceAfter !== null ? `฿${formatCurrency(tx.balanceAfter)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {tx.matched ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                              จับคู่แล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                              <FaTimesCircle className="w-3 h-3 mr-1" />
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
    </div>
  )
}

export default BankSCBReport
