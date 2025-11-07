import { useEffect, useState } from 'react'
import { adminCashbackAPI } from '@/api/adminAPI'
import {
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiFilter,
  FiTrendingDown,
  FiPercent,
  FiClock,
  FiCalendar,
  FiGift,
} from 'react-icons/fi'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

interface CashbackWithMember {
  id: string
  memberId: string
  memberPhone: string
  memberFullname: string
  amount: number
  lossAmount: number
  percentage: number
  status: string
  period: string
  createdAt: string
}

export default function CashbackList() {
  const [cashbacks, setCashbacks] = useState<CashbackWithMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCashback, setSelectedCashback] = useState<CashbackWithMember | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchCashbacks()
  }, [statusFilter])

  const fetchCashbacks = async () => {
    try {
      setIsLoading(true)
      const filters: any = {
        page: 1,
        pageSize: 100,
      }
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter
      }
      const data = await adminCashbackAPI.getCashbackList(filters)
      setCashbacks(data.cashbacks || [])
    } catch (error: any) {
      console.error('Failed to fetch cashbacks:', error)
      toast.error('ไม่สามารถโหลดรายการคืนยอดเสียได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedCashback) return

    try {
      setProcessing(true)
      await adminCashbackAPI.approveCashback(selectedCashback.id)
      toast.success('อนุมัติคืนยอดเสียเรียบร้อย')
      setShowApproveModal(false)
      setSelectedCashback(null)
      fetchCashbacks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'อนุมัติล้มเหลว')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedCashback) return

    try {
      setProcessing(true)
      await adminCashbackAPI.cancelCashback(selectedCashback.id)
      toast.success('ยกเลิกคืนยอดเสียเรียบร้อย')
      setShowCancelModal(false)
      setSelectedCashback(null)
      fetchCashbacks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ยกเลิกล้มเหลว')
    } finally {
      setProcessing(false)
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
    const badges: Record<string, { label: string; class: string }> = {
      PENDING: { label: 'รอดำเนินการ', class: 'bg-warning/20 text-warning border-warning/30' },
      APPROVED: { label: 'อนุมัติแล้ว', class: 'bg-success/20 text-success border-success/30' },
      CANCELLED: { label: 'ยกเลิก', class: 'bg-error/20 text-error border-error/30' },
    }
    const badge = badges[status] || { label: status, class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.class}`}>{badge.label}</span>
    )
  }

  const pendingCount = cashbacks.filter((c) => c.status === 'PENDING').length
  const totalAmount = cashbacks.reduce((sum, c) => sum + c.amount, 0)
  const todayCount = cashbacks.filter((c) => dayjs(c.createdAt).isSame(dayjs(), 'day')).length

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
          <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-lg flex items-center justify-center">
            <FiGift className="w-5 h-5 text-info" />
          </div>
          รายการคืนยอดเสีย (Cashback)
        </h1>
        <p className="text-brown-300 ml-13">จัดการและอนุมัติรายการคืนยอดเสียให้กับสมาชิก</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                รอดำเนินการ
              </div>
              <div className="text-3xl font-bold text-warning">{pendingCount}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <div className="w-14 h-14 bg-warning/10 rounded-xl flex items-center justify-center">
              <FiClock className="w-7 h-7 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiGift className="w-4 h-4" />
                ยอดรวมทั้งหมด
              </div>
              <div className="text-3xl font-bold text-info">
                {formatCurrency(totalAmount).replace('฿', '')}
              </div>
              <div className="text-xs text-brown-500 mt-1">บาท</div>
            </div>
            <div className="w-14 h-14 bg-info/10 rounded-xl flex items-center justify-center">
              <FiGift className="w-7 h-7 text-info" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                รายการวันนี้
              </div>
              <div className="text-3xl font-bold text-success">{todayCount}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-7 h-7 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <FiFilter className="w-5 h-5 text-brown-400" />
        <span className="text-brown-300 text-sm font-medium">ตัวกรอง:</span>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-gold-500 text-white shadow-lg'
                  : 'bg-admin-card border border-admin-border text-brown-300 hover:bg-admin-hover'
              }`}
            >
              {status === 'ALL' ? 'ทั้งหมด' : status === 'PENDING' ? 'รอดำเนินการ' : status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ยกเลิก'}
            </button>
          ))}
        </div>
      </div>

      {/* Cashback Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {cashbacks.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGift className="w-10 h-10 text-brown-500 opacity-50" />
            </div>
            <p className="text-brown-400 text-lg">ไม่มีรายการคืนยอดเสีย</p>
            <p className="text-brown-500 text-sm mt-2">รายการใหม่จะแสดงที่นี่</p>
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
                    ยอดเสีย
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    เปอร์เซ็นต์
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    ยอดคืน
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
                {cashbacks.map((cashback, index) => (
                  <tr
                    key={cashback.id}
                    className="hover:bg-admin-hover/50 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-brown-500" />
                        <div>
                          <div className="text-sm font-medium text-brown-200">
                            {dayjs(cashback.createdAt).format('HH:mm')}
                          </div>
                          <div className="text-xs text-brown-500">
                            {dayjs(cashback.createdAt).format('DD/MM/YY')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-full flex items-center justify-center text-info font-bold text-sm">
                          {(cashback.memberFullname || cashback.memberPhone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brown-100">
                            {cashback.memberFullname || cashback.memberPhone}
                          </div>
                          <div className="text-xs text-brown-400">{cashback.memberPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <FiTrendingDown className="w-4 h-4 text-error" />
                        <span className="text-sm font-bold text-error">
                          {formatCurrency(cashback.lossAmount).replace('฿', '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-gold-500/10 px-3 py-1 rounded-lg">
                        <FiPercent className="w-3 h-3 text-gold-500" />
                        <span className="text-sm font-bold text-gold-500">{cashback.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 bg-info/10 px-3 py-1.5 rounded-lg">
                        <FiGift className="w-4 h-4 text-info" />
                        <span className="text-lg font-bold text-info">
                          {formatCurrency(cashback.amount).replace('฿', '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(cashback.status)}</td>
                    <td className="px-6 py-4">
                      {cashback.status === 'PENDING' && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCashback(cashback)
                              setShowApproveModal(true)
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCashback(cashback)
                              setShowCancelModal(true)
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                          >
                            <FiXCircle className="w-4 h-4" />
                            ยกเลิก
                          </button>
                        </div>
                      )}
                      {cashback.status !== 'PENDING' && (
                        <span className="text-brown-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedCashback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiCheckCircle className="w-6 h-6" />
              อนุมัติคืนยอดเสีย
            </h3>

            <div className="mb-6 p-4 bg-admin-bg rounded-xl border border-admin-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brown-400">สมาชิก:</span>
                <span className="text-sm font-semibold text-brown-100">{selectedCashback.memberPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-brown-400">ยอดเสีย:</span>
                <span className="text-sm font-bold text-error">{formatCurrency(selectedCashback.lossAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-brown-400">เปอร์เซ็นต์:</span>
                <span className="text-sm font-bold text-gold-500">{selectedCashback.percentage}%</span>
              </div>
              <div className="pt-3 border-t border-admin-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brown-400">ยอดคืน:</span>
                  <span className="text-2xl font-bold text-info">{formatCurrency(selectedCashback.amount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-info">
                ✓ ยอดคืนจะถูกเพิ่มเข้าเครดิตของสมาชิกทันทีเมื่ออนุมัติ
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedCashback(null)
                }}
                className="flex-1 px-4 py-2.5 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all font-medium"
                disabled={processing}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2.5 bg-success hover:bg-success/90 text-white rounded-lg transition-all disabled:opacity-50 font-semibold shadow-lg"
                disabled={processing}
              >
                {processing ? 'กำลังดำเนินการ...' : 'ยืนยันอนุมัติ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedCashback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-error mb-4 flex items-center gap-2">
              <FiXCircle className="w-6 h-6" />
              ยกเลิกคืนยอดเสีย
            </h3>

            <div className="mb-6 p-4 bg-error/10 rounded-xl border border-error/30">
              <div className="text-sm text-warning mb-2 flex items-center gap-2">
                ⚠️ รายการจะถูกยกเลิก
              </div>
              <div className="text-sm text-brown-400 mb-2">สมาชิก: {selectedCashback.memberPhone}</div>
              <div className="text-2xl font-bold text-error">{formatCurrency(selectedCashback.amount)}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedCashback(null)
                }}
                className="flex-1 px-4 py-2.5 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all font-medium"
                disabled={processing}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-lg transition-all disabled:opacity-50 font-semibold shadow-lg"
                disabled={processing}
              >
                {processing ? 'กำลังดำเนินการ...' : 'ยืนยันยกเลิก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
