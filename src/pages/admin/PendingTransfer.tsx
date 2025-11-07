import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FiAlertTriangle className="text-orange-500" />
              เครดิตหาย - โยกเกมส์
            </h1>
            <p className="text-gray-600 mt-2">ตรวจสอบและแก้ไขปัญหาเครดิตหายจากการโยกเข้า-ออกเกม</p>
          </div>
          <button
            onClick={fetchTransfers}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">รายการมีปัญหา</p>
              <p className="text-4xl font-bold">{stats.totalProblem}</p>
              <p className="text-red-100 text-sm mt-2">จากทั้งหมด {stats.totalTransfers} รายการ</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <FiAlertTriangle className="text-5xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">เครดิตหายรวม</p>
              <p className="text-4xl font-bold">฿{formatCurrency(stats.totalMissingAmount)}</p>
              <p className="text-orange-100 text-sm mt-2">ต้องตรวจสอบและแก้ไข</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <FiDollarSign className="text-5xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">รายการทั้งหมด</p>
              <p className="text-4xl font-bold">{total}</p>
              <p className="text-blue-100 text-sm mt-2">Transaction ที่ตรวจสอบได้</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <FiClock className="text-5xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="เบอร์โทร, ชื่อ"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="PROBLEM">มีปัญหา</option>
                  <option value="OK">ปกติ</option>
                  <option value="ALL">ทั้งหมด</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiSearch />
                ค้นหา
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 font-medium">กำลังโหลด...</span>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-20">
            <FiCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
            <p className="text-gray-500 text-lg">ไม่พบรายการที่มีปัญหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    วันที่/เวลา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    จำนวนโยก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ยอดก่อนโยก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ยอดที่ควรเป็น
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ยอดปัจจุบัน
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    เครดิตหาย
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      transfer.isProblem ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transfer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transfer.memberName}</div>
                      <div className="text-sm text-gray-500">{transfer.memberPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {transfer.type === 'TRANSFER_IN' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <FiTrendingDown />
                          โยกเข้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <FiTrendingUp />
                          โยกออก
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      ฿{formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      ฿{formatCurrency(transfer.balanceBefore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                      ฿{formatCurrency(transfer.balanceAfter)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      ฿{formatCurrency(transfer.currentBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {transfer.isProblem ? (
                        <span className="font-bold text-red-600 text-base">
                          -฿{formatCurrency(Math.abs(transfer.missingAmount))}
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">ปกติ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer)
                            setShowReconcileModal(true)
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
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
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-700">
                แสดง <span className="font-medium">{(page - 1) * pageSize + 1}</span> ถึง{' '}
                <span className="font-medium">{Math.min(page * pageSize, total)}</span> จาก{' '}
                <span className="font-medium">{total}</span> รายการ
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reconcile Modal */}
      {showReconcileModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-blue-600" />
              บันทึกการตรวจสอบ
            </h3>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">สมาชิก</p>
              <p className="font-medium text-gray-900">{selectedTransfer.memberName}</p>
              <p className="text-sm text-gray-500">{selectedTransfer.memberPhone}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
              <textarea
                value={reconcileRemark}
                onChange={(e) => setReconcileRemark(e.target.value)}
                rows={3}
                placeholder="บันทึกผลการตรวจสอบ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReconcileModal(false)
                  setReconcileRemark('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReconcile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              คืนเครดิตให้ลูกค้า
            </h3>

            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="text-red-600" />
                <p className="font-semibold text-red-900">เครดิตหาย</p>
              </div>
              <p className="text-sm text-gray-600">สมาชิก: {selectedTransfer.memberName}</p>
              <p className="text-sm text-gray-600">เบอร์: {selectedTransfer.memberPhone}</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                ฿{formatCurrency(Math.abs(selectedTransfer.missingAmount))}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเงินที่คืน</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผล *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผลในการคืนเครดิต..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false)
                  setRefundAmount('')
                  setRefundReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
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
