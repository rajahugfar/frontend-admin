import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FiAlertTriangle,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiClock,
  FiFilter,
} from 'react-icons/fi'
import { adminTransferAPI } from '../../api/adminAPI'

interface PendingTransferItem {
  id: string
  memberId: string
  memberPhone: string
  memberName: string
  type: 'TRANSFER_IN' | 'TRANSFER_OUT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  currentBalance: number
  gameBalance: number
  missingAmount: number
  status: string
  remark: string
  createdAt: string
  isProblem: boolean
}

const PendingTransfer: React.FC = () => {
  const [transfers, setTransfers] = useState<PendingTransferItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'PROBLEM' | 'OK'>('PROBLEM')

  // Modals
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransferItem | null>(null)
  const [showReconcileModal, setShowReconcileModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [reconcileRemark, setReconcileRemark] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  // Stats
  const [stats, setStats] = useState({
    totalProblem: 0,
    totalMissingAmount: 0,
    totalTransfers: 0,
  })

  useEffect(() => {
    fetchTransfers()
  }, [page])

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }

      if (search) params.search = search
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await adminTransferAPI.getPendingTransfers(params)
      let data = response.transfers || []

      // Apply client-side filtering
      if (filterType === 'PROBLEM') {
        data = data.filter((t: PendingTransferItem) => t.isProblem)
      } else if (filterType === 'OK') {
        data = data.filter((t: PendingTransferItem) => !t.isProblem)
      }

      setTransfers(data)
      setTotal(response.total || 0)

      // Calculate stats
      const problemTransfers = (response.transfers || []).filter((t: PendingTransferItem) => t.isProblem)
      const totalMissing = problemTransfers.reduce((sum: number, t: PendingTransferItem) => sum + Math.abs(t.missingAmount), 0)

      setStats({
        totalProblem: problemTransfers.length,
        totalMissingAmount: totalMissing,
        totalTransfers: response.transfers?.length || 0,
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTransfers()
  }

  const handleReset = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
    setFilterType('PROBLEM')
    setPage(1)
    setTimeout(fetchTransfers, 100)
  }

  const handleReconcile = async () => {
    if (!selectedTransfer) return

    try {
      await adminTransferAPI.reconcileTransfer(selectedTransfer.id, reconcileRemark)
      toast.success('บันทึกการตรวจสอบเรียบร้อย')
      setShowReconcileModal(false)
      setReconcileRemark('')
      fetchTransfers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleRefund = async () => {
    if (!selectedTransfer || !refundAmount || !refundReason) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('จำนวนเงินไม่ถูกต้อง')
      return
    }

    try {
      await adminTransferAPI.refundTransfer(selectedTransfer.id, amount, refundReason)
      toast.success(`คืนเครดิต ${formatCurrency(amount)} บาท เรียบร้อย`)
      setShowRefundModal(false)
      setRefundAmount('')
      setRefundReason('')
      fetchTransfers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 flex items-center gap-3">
            <FiAlertTriangle />
            เครดิตหาย - โยกเกมส์
          </h1>
          <p className="text-brown-400 mt-1">ตรวจสอบและแก้ไขปัญหาเครดิตหายจากการโยกเข้า-ออกเกม</p>
        </div>
        <button
          onClick={fetchTransfers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 disabled:opacity-50 transition-colors font-medium"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-error/20 to-error/30 border border-error/40 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm font-medium mb-1">รายการมีปัญหา</p>
              <p className="text-4xl font-bold text-error">{stats.totalProblem}</p>
              <p className="text-brown-400 text-sm mt-2">จากทั้งหมด {stats.totalTransfers} รายการ</p>
            </div>
            <FiAlertTriangle className="text-5xl text-error/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-warning/20 to-warning/30 border border-warning/40 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm font-medium mb-1">เครดิตหายรวม</p>
              <p className="text-4xl font-bold text-warning">฿{formatCurrency(stats.totalMissingAmount)}</p>
              <p className="text-brown-400 text-sm mt-2">ต้องตรวจสอบและแก้ไข</p>
            </div>
            <FiDollarSign className="text-5xl text-warning/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm font-medium mb-1">รายการทั้งหมด</p>
              <p className="text-4xl font-bold text-gold-500">{total}</p>
              <p className="text-brown-400 text-sm mt-2">Transaction ที่ตรวจสอบได้</p>
            </div>
            <FiClock className="text-5xl text-gold-500/30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-300 mb-2">ค้นหา</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="เบอร์โทร, ชื่อ"
                  className="w-full pl-10 pr-3 py-2.5 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-brown-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-300 mb-2">ประเภท</label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full pl-10 pr-3 py-2.5 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 appearance-none"
                >
                  <option value="PROBLEM">มีปัญหา</option>
                  <option value="OK">ปกติ</option>
                  <option value="ALL">ทั้งหมด</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-300 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-300 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium"
              >
                <FiSearch />
                ค้นหา
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-admin-hover text-brown-300 rounded-lg hover:bg-admin-card transition-colors font-medium"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            <span className="ml-4 text-brown-300 font-medium">กำลังโหลด...</span>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-20">
            <FiCheckCircle className="mx-auto text-6xl text-success mb-4" />
            <p className="text-brown-400 text-lg">ไม่พบรายการที่มีปัญหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-hover">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-500 uppercase tracking-wider">
                    วันที่/เวลา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-500 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gold-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold-500 uppercase tracking-wider">
                    จำนวนโยก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold-500 uppercase tracking-wider">
                    ยอดก่อนโยก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold-500 uppercase tracking-wider">
                    ยอดที่ควรเป็น
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold-500 uppercase tracking-wider">
                    ยอดปัจจุบัน
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold-500 uppercase tracking-wider">
                    เครดิตหาย
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gold-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {transfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className={`hover:bg-admin-hover transition-colors ${
                      transfer.isProblem ? 'bg-error/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                      {formatDate(transfer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brown-200">{transfer.memberName}</div>
                      <div className="text-sm text-brown-400">{transfer.memberPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {transfer.type === 'TRANSFER_IN' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <FiTrendingDown />
                          โยกเข้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30">
                          <FiTrendingUp />
                          โยกออก
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-brown-200">
                      ฿{formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-brown-300">
                      ฿{formatCurrency(transfer.balanceBefore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-400">
                      ฿{formatCurrency(transfer.balanceAfter)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-brown-200">
                      ฿{formatCurrency(transfer.currentBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {transfer.isProblem ? (
                        <span className="font-bold text-error text-base">
                          -฿{formatCurrency(Math.abs(transfer.missingAmount))}
                        </span>
                      ) : (
                        <span className="text-success font-medium">ปกติ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer)
                            setShowReconcileModal(true)
                          }}
                          className="px-3 py-1.5 bg-gold-500 text-brown-900 text-xs font-medium rounded-lg hover:bg-gold-600 transition-colors"
                        >
                          ตรวจสอบแล้ว
                        </button>
                        {transfer.isProblem && (
                          <button
                            onClick={() => {
                              setSelectedTransfer(transfer)
                              setRefundAmount(Math.abs(transfer.missingAmount).toString())
                              setShowRefundModal(true)
                            }}
                            className="px-3 py-1.5 bg-success text-white text-xs font-medium rounded-lg hover:bg-success/80 transition-colors"
                          >
                            คืนเครดิต
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="bg-admin-hover px-6 py-4 flex items-center justify-between border-t border-admin-border">
            <div>
              <p className="text-sm text-brown-300">
                แสดง <span className="font-medium text-gold-500">{(page - 1) * pageSize + 1}</span> ถึง{' '}
                <span className="font-medium text-gold-500">{Math.min(page * pageSize, total)}</span> จาก{' '}
                <span className="font-medium text-gold-500">{total}</span> รายการ
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-300 bg-admin-card hover:bg-admin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-300 bg-admin-card hover:bg-admin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reconcile Modal */}
      {showReconcileModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-display font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiCheckCircle />
              บันทึกการตรวจสอบ
            </h3>

            <div className="mb-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
              <p className="text-sm text-brown-400">สมาชิก</p>
              <p className="font-medium text-brown-200">{selectedTransfer.memberName}</p>
              <p className="text-sm text-brown-400">{selectedTransfer.memberPhone}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brown-300 mb-2">หมายเหตุ</label>
              <textarea
                value={reconcileRemark}
                onChange={(e) => setReconcileRemark(e.target.value)}
                rows={3}
                placeholder="บันทึกผลการตรวจสอบ..."
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-brown-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReconcileModal(false)
                  setReconcileRemark('')
                }}
                className="flex-1 px-4 py-2 border border-admin-border text-brown-300 rounded-lg hover:bg-admin-hover font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReconcile}
                className="flex-1 px-4 py-2 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 font-medium transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-display font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiDollarSign />
              คืนเครดิตให้ลูกค้า
            </h3>

            <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="text-error" />
                <p className="font-semibold text-error">เครดิตหาย</p>
              </div>
              <p className="text-sm text-brown-300">สมาชิก: {selectedTransfer.memberName}</p>
              <p className="text-sm text-brown-300">เบอร์: {selectedTransfer.memberPhone}</p>
              <p className="text-2xl font-bold text-error mt-2">
                ฿{formatCurrency(Math.abs(selectedTransfer.missingAmount))}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brown-300 mb-2">จำนวนเงินที่คืน</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-success placeholder-brown-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brown-300 mb-2">เหตุผล *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผลในการคืนเครดิต..."
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border text-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-success placeholder-brown-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false)
                  setRefundAmount('')
                  setRefundReason('')
                }}
                className="flex-1 px-4 py-2 border border-admin-border text-brown-300 rounded-lg hover:bg-admin-hover font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80 font-medium transition-colors"
              >
                คืนเครดิต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingTransfer
