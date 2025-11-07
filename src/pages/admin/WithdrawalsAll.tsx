import { useEffect, useState } from 'react'
import { adminWithdrawalAPI } from '@/api/adminAPI'
import { WithdrawalWithMember } from '@/types/admin'
import { FiCheckCircle, FiXCircle, FiEye, FiDollarSign, FiClock, FiTrendingDown, FiCalendar, FiFilter, FiSearch } from 'react-icons/fi'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

// Bank code mapping helper
const getBankImageCode = (bankCode: string): string => {
  const code = bankCode.toLowerCase()
  const mapping: Record<string, string> = {
    kbank: 'ksb',
    bbl: 'bkb',
    bay: 'bkb',
    scb: 'scb',
    ktb: 'ktb',
    tmb: 'tmb',
    gsb: 'gsb',
    baac: 'baac',
    ghb: 'ghb',
    ghbank: 'ghb',
    lhb: 'lhb',
    lh: 'lhb',
    cimb: 'cimb',
    tisco: 'ksi',
    kkp: 'knk',
    tnc: 'tnc',
    tbank: 'tnc',
    uob: 'uob',
  }
  return mapping[code] || code
}

type WithdrawalStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'

export default function WithdrawalsAll() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalWithMember | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<WithdrawalStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))

  useEffect(() => {
    fetchWithdrawals()
  }, [selectedStatus, startDate, endDate])

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true)
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus
      const data = await adminWithdrawalAPI.getWithdrawals({
        status,
        startDate,
        endDate,
        limit: 100,
        offset: 0,
      })
      setWithdrawals(data.withdrawals || [])
    } catch (error: any) {
      console.error('Failed to fetch withdrawals:', error)
      toast.error('ไม่สามารถโหลดรายการถอนได้')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
      PENDING: { label: 'รอดำเนินการ', color: 'text-warning', bgColor: 'bg-warning/10' },
      COMPLETED: { label: 'สำเร็จ', color: 'text-success', bgColor: 'bg-success/10' },
      REJECTED: { label: 'ยกเลิก', color: 'text-error', bgColor: 'bg-error/10' },
    }
    const config = statusConfig[status] || statusConfig.PENDING
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      withdrawal.memberPhone?.toLowerCase().includes(query) ||
      withdrawal.memberFullname?.toLowerCase().includes(query) ||
      withdrawal.bankAccount?.toLowerCase().includes(query) ||
      withdrawal.amount.toString().includes(query)
    )
  })

  const stats = {
    total: filteredWithdrawals.length,
    pending: filteredWithdrawals.filter((w) => w.status === 'PENDING').length,
    completed: filteredWithdrawals.filter((w) => w.status === 'COMPLETED').length,
    rejected: filteredWithdrawals.filter((w) => w.status === 'REJECTED').length,
    totalAmount: filteredWithdrawals.reduce((sum, w) => sum + (w.status === 'COMPLETED' ? w.amount : 0), 0),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold-500">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-error/20 to-error/10 rounded-lg flex items-center justify-center">
            <FiTrendingDown className="w-5 h-5 text-error" />
          </div>
          รายการถอนทั้งหมด
        </h1>
        <p className="text-brown-300 ml-13">ตรวจสอบและจัดการรายการถอนเงินของสมาชิก</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1">ทั้งหมด</div>
              <div className="text-3xl font-bold text-gold-500">{stats.total}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <FiDollarSign className="w-10 h-10 text-gold-500 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1">รอดำเนินการ</div>
              <div className="text-3xl font-bold text-warning">{stats.pending}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <FiClock className="w-10 h-10 text-warning opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1">สำเร็จ</div>
              <div className="text-3xl font-bold text-success">{stats.completed}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <FiCheckCircle className="w-10 h-10 text-success opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1">ยกเลิก</div>
              <div className="text-3xl font-bold text-error">{stats.rejected}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <FiXCircle className="w-10 h-10 text-error opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1">ยอดรวม</div>
              <div className="text-2xl font-bold text-error">
                {formatCurrency(stats.totalAmount).replace('฿', '')}
              </div>
              <div className="text-xs text-brown-500 mt-1">บาท</div>
            </div>
            <FiTrendingDown className="w-10 h-10 text-error opacity-30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2 flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              สถานะ
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as WithdrawalStatus)}
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="COMPLETED">สำเร็จ</option>
              <option value="REJECTED">ยกเลิก</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2 flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
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
            <label className="block text-sm font-medium text-brown-200 mb-2 flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2 flex items-center gap-2">
              <FiSearch className="w-4 h-4" />
              ค้นหา
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="เบอร์โทร, ชื่อ, เลขบัญชี..."
              className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-brown-500"
            />
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {filteredWithdrawals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-10 h-10 text-brown-500 opacity-50" />
            </div>
            <p className="text-brown-400 text-lg">ไม่มีรายการถอน</p>
            <p className="text-brown-500 text-sm mt-2">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-admin-bg to-admin-bg/50 border-b border-admin-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    เวลา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    ข้อมูลสมาชิก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    บัญชีธนาคาร
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredWithdrawals.map((withdrawal, index) => (
                  <tr
                    key={withdrawal.id}
                    className="hover:bg-admin-hover/50 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-brown-500" />
                        <div>
                          <div className="text-sm font-medium text-brown-200">
                            {dayjs(withdrawal.createdAt).format('HH:mm')}
                          </div>
                          <div className="text-xs text-brown-500">
                            {dayjs(withdrawal.createdAt).format('DD/MM/YY')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-full flex items-center justify-center text-gold-500 font-bold text-sm">
                          {(withdrawal.memberFullname || withdrawal.memberPhone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brown-100">
                            {withdrawal.memberFullname || withdrawal.memberPhone}
                          </div>
                          <div className="text-xs text-brown-400">{withdrawal.memberPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 bg-error/10 px-3 py-1.5 rounded-lg">
                        <FiTrendingDown className="w-4 h-4 text-error" />
                        <span className="text-lg font-bold text-error">
                          {formatCurrency(withdrawal.amount).replace('฿', '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.bankCode ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-lg flex-shrink-0 border-2 border-white/10">
                            <img
                              src={`/images/banks/bank-${getBankImageCode(withdrawal.bankCode)}.png`}
                              alt={withdrawal.bankName || withdrawal.bankCode}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = 'none'
                                if (target.parentElement) {
                                  const fallback = document.createElement('div')
                                  fallback.className = 'w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold text-xs'
                                  fallback.textContent = withdrawal.bankCode.substring(0, 2)
                                  target.parentElement.appendChild(fallback)
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-brown-100 truncate">
                              {withdrawal.bankName || withdrawal.bankCode}
                            </div>
                            <div className="text-xs text-brown-400 font-mono mt-0.5">
                              {withdrawal.bankAccount}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-brown-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal)
                            setShowDetailModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <FiEye className="w-4 h-4" />
                          ดูรายละเอียด
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiTrendingDown className="w-6 h-6" />
              รายละเอียดการถอน
            </h3>

            <div className="space-y-6">
              {/* Member Info */}
              <div className="p-4 bg-admin-bg rounded-xl border border-admin-border">
                <div className="text-sm font-semibold text-brown-200 mb-3">ข้อมูลสมาชิก</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-brown-500 mb-1">ชื่อ</div>
                    <div className="text-sm text-brown-100">{selectedWithdrawal.memberFullname || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-brown-500 mb-1">เบอร์โทร</div>
                    <div className="text-sm text-brown-100">{selectedWithdrawal.memberPhone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-brown-500 mb-1">ยอดเครดิต</div>
                    <div className="text-sm text-success font-semibold">
                      {formatCurrency(selectedWithdrawal.memberCredit || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="p-4 bg-admin-bg rounded-xl border border-admin-border">
                <div className="text-sm font-semibold text-brown-200 mb-3">ข้อมูลการทำรายการ</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-brown-500 mb-1">จำนวนเงิน</div>
                    <div className="text-2xl text-error font-bold">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-brown-500 mb-1">สถานะ</div>
                    {getStatusBadge(selectedWithdrawal.status)}
                  </div>
                  <div>
                    <div className="text-xs text-brown-500 mb-1">วันที่ทำรายการ</div>
                    <div className="text-sm text-brown-100">
                      {dayjs(selectedWithdrawal.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                  </div>
                  {selectedWithdrawal.completedAt && (
                    <div>
                      <div className="text-xs text-brown-500 mb-1">วันที่อนุมัติ</div>
                      <div className="text-sm text-brown-100">
                        {dayjs(selectedWithdrawal.completedAt).format('DD/MM/YYYY HH:mm:ss')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Info */}
              {selectedWithdrawal.bankCode && (
                <div className="p-4 bg-admin-bg rounded-xl border border-admin-border">
                  <div className="text-sm font-semibold text-brown-200 mb-3">ข้อมูลธนาคาร</div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-lg">
                      <img
                        src={`/images/banks/bank-${getBankImageCode(selectedWithdrawal.bankCode)}.png`}
                        alt={selectedWithdrawal.bankName || selectedWithdrawal.bankCode}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-brown-100">
                        {selectedWithdrawal.bankName || selectedWithdrawal.bankCode}
                      </div>
                      <div className="text-xs text-brown-400 font-mono">
                        {selectedWithdrawal.bankAccount}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remark */}
              {selectedWithdrawal.remark && (
                <div className="p-4 bg-admin-bg rounded-xl border border-admin-border">
                  <div className="text-sm font-semibold text-brown-200 mb-2">หมายเหตุ</div>
                  <div className="text-sm text-brown-100">{selectedWithdrawal.remark}</div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedWithdrawal(null)
                }}
                className="flex-1 px-4 py-2.5 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
