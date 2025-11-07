import { useEffect, useState } from 'react'
import { adminDepositAPI } from '@/api/adminAPI'
import { DepositWithMember } from '@/types/admin'
import { FiCheckCircle, FiXCircle, FiEye, FiDollarSign, FiClock, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { BankInfo } from '@/components/BankIcon'
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

export default function DepositsPending() {
  const [deposits, setDeposits] = useState<DepositWithMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDeposit, setSelectedDeposit] = useState<DepositWithMember | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [bonusAmount, setBonusAmount] = useState(0)
  const [remark, setRemark] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Bulk approve states
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false)

  useEffect(() => {
    fetchPendingDeposits()
  }, [])

  const fetchPendingDeposits = async () => {
    try {
      setIsLoading(true)
      const data = await adminDepositAPI.getPendingDeposits(1, 100)
      setDeposits(data.deposits || [])
    } catch (error: any) {
      console.error('Failed to fetch deposits:', error)
      toast.error('ไม่สามารถโหลดรายการฝากได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedDeposit) return

    try {
      setProcessing(true)
      await adminDepositAPI.approveDeposit(selectedDeposit.id, {
        bonusAmount: bonusAmount || undefined,
        remark: remark || undefined,
      })
      toast.success('อนุมัติรายการฝากเรียบร้อย')
      setShowApproveModal(false)
      setSelectedDeposit(null)
      setBonusAmount(0)
      setRemark('')
      fetchPendingDeposits()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'อนุมัติล้มเหลว')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDeposit || !rejectReason) {
      toast.error('กรุณาระบุเหตุผล')
      return
    }

    try {
      setProcessing(true)
      await adminDepositAPI.rejectDeposit(selectedDeposit.id, {
        reason: rejectReason,
        remark: remark || undefined,
      })
      toast.success('ปฏิเสธรายการฝากเรียบร้อย')
      setShowRejectModal(false)
      setSelectedDeposit(null)
      setRejectReason('')
      setRemark('')
      fetchPendingDeposits()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ปฏิเสธล้มเหลว')
    } finally {
      setProcessing(false)
    }
  }

  // Bulk approve handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === deposits.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(deposits.map((d) => d.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('กรุณาเลือกรายการที่ต้องการอนุมัติ')
      return
    }

    try {
      setProcessing(true)
      const result = await adminDepositAPI.bulkApproveDeposits(selectedIds)

      if (result.successCount > 0) {
        toast.success(`อนุมัติสำเร็จ ${result.successCount} รายการ${result.failedCount > 0 ? `, ล้มเหลว ${result.failedCount} รายการ` : ''}`)
      }

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((err: any) => {
          toast.error(`${err.depositId}: ${err.error}`)
        })
      }

      setShowBulkApproveModal(false)
      setSelectedIds([])
      fetchPendingDeposits()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'อนุมัติล้มเหลว')
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/10 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-success" />
            </div>
            รายการฝากรอดำเนินการ
          </h1>
          <p className="text-brown-300 ml-13">ตรวจสอบและอนุมัติรายการฝากเงินของสมาชิก</p>
        </div>

        {/* Bulk Approve Button */}
        {selectedIds.length > 0 && (
          <button
            onClick={() => setShowBulkApproveModal(true)}
            disabled={processing}
            className="px-6 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FiCheckCircle className="w-5 h-5" />
            อนุมัติทั้งหมด ({selectedIds.length})
          </button>
        )}
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
              <div className="text-3xl font-bold text-warning">{deposits.length}</div>
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
                <FiDollarSign className="w-4 h-4" />
                ยอดรวมทั้งหมด
              </div>
              <div className="text-3xl font-bold text-success">
                {formatCurrency(deposits.reduce((sum, d) => sum + d.amount, 0)).replace('฿', '')}
              </div>
              <div className="text-xs text-brown-500 mt-1">บาท</div>
            </div>
            <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-7 h-7 text-success" />
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
              <div className="text-3xl font-bold text-info">
                {deposits.filter((d) => dayjs(d.createdAt).isSame(dayjs(), 'day')).length}
              </div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <div className="w-14 h-14 bg-info/10 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-7 h-7 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {deposits.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-10 h-10 text-brown-500 opacity-50" />
            </div>
            <p className="text-brown-400 text-lg">ไม่มีรายการฝากรอดำเนินการ</p>
            <p className="text-brown-500 text-sm mt-2">รายการใหม่จะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-admin-bg to-admin-bg/50 border-b border-admin-border">
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === deposits.length && deposits.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-success bg-admin-card border-admin-border rounded focus:ring-success focus:ring-2"
                    />
                  </th>
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
                    สลิป
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {deposits.map((deposit, index) => (
                  <tr
                    key={deposit.id}
                    className="hover:bg-admin-hover/50 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(deposit.id)}
                        onChange={() => toggleSelectOne(deposit.id)}
                        className="w-4 h-4 text-success bg-admin-card border-admin-border rounded focus:ring-success focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-brown-500" />
                        <div>
                          <div className="text-sm font-medium text-brown-200">
                            {dayjs(deposit.createdAt).format('HH:mm')}
                          </div>
                          <div className="text-xs text-brown-500">
                            {dayjs(deposit.createdAt).format('DD/MM/YY')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-full flex items-center justify-center text-gold-500 font-bold text-sm">
                          {(deposit.memberFullname || deposit.memberPhone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brown-100">
                            {deposit.memberFullname || deposit.memberPhone}
                          </div>
                          <div className="text-xs text-brown-400">{deposit.memberPhone}</div>
                          <div className="text-xs text-brown-500 mt-0.5 flex items-center gap-1">
                            <span className="text-success">฿</span>
                            {formatCurrency(deposit.memberCredit).replace('฿', '')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-lg">
                        <FiTrendingUp className="w-4 h-4 text-success" />
                        <span className="text-lg font-bold text-success">
                          {formatCurrency(deposit.amount).replace('฿', '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {deposit.bankCode ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-lg flex-shrink-0 border-2 border-white/10">
                            <img
                              src={`/images/banks/bank-${getBankImageCode(deposit.bankCode)}.png`}
                              alt={deposit.bankName || deposit.bankCode}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = 'none'
                                if (target.parentElement) {
                                  const fallback = document.createElement('div')
                                  fallback.className = 'w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold text-xs'
                                  fallback.textContent = deposit.bankCode.substring(0, 2)
                                  target.parentElement.appendChild(fallback)
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-brown-100 truncate">
                              {deposit.bankName || deposit.bankCode}
                            </div>
                            <div className="text-xs text-brown-400 font-mono mt-0.5">
                              {deposit.bankAccount}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-brown-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {deposit.slipUrl ? (
                        <a
                          href={deposit.slipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-all text-sm font-medium"
                        >
                          <FiEye className="w-4 h-4" />
                          ดูสลิป
                        </a>
                      ) : (
                        <span className="text-brown-500 text-sm">ไม่มีสลิป</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDeposit(deposit)
                            setShowApproveModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDeposit(deposit)
                            setShowRejectModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <FiXCircle className="w-4 h-4" />
                          ปฏิเสธ
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

      {/* Approve Modal */}
      {showApproveModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiCheckCircle className="w-6 h-6" />
              อนุมัติรายการฝาก
            </h3>

            <div className="mb-6 p-4 bg-admin-bg rounded-xl border border-admin-border">
              <div className="text-sm text-brown-400 mb-2">สมาชิก: {selectedDeposit.memberPhone}</div>
              <div className="text-3xl font-bold text-success mb-2">{formatCurrency(selectedDeposit.amount)}</div>
              {selectedDeposit.bankCode && (
                <BankInfo
                  bankCode={selectedDeposit.bankCode}
                  bankName={selectedDeposit.bankName || ''}
                  bankNumber={selectedDeposit.bankAccount || ''}
                  size="sm"
                />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  โบนัส (ถ้ามี)
                </label>
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  rows={3}
                  placeholder="หมายเหตุ..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedDeposit(null)
                  setBonusAmount(0)
                  setRemark('')
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

      {/* Reject Modal */}
      {showRejectModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-error mb-4 flex items-center gap-2">
              <FiXCircle className="w-6 h-6" />
              ปฏิเสธรายการฝาก
            </h3>

            <div className="mb-6 p-4 bg-error/10 rounded-xl border border-error/30">
              <div className="text-sm text-warning mb-2 flex items-center gap-2">
                ⚠️ รายการจะถูกยกเลิก
              </div>
              <div className="text-sm text-brown-400 mb-2">สมาชิก: {selectedDeposit.memberPhone}</div>
              <div className="text-2xl font-bold text-error">{formatCurrency(selectedDeposit.amount)}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  เหตุผล <span className="text-error">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-error"
                  rows={3}
                  placeholder="ระบุเหตุผลที่ปฏิเสธ..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  rows={2}
                  placeholder="หมายเหตุเพิ่มเติม..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedDeposit(null)
                  setRejectReason('')
                  setRemark('')
                }}
                className="flex-1 px-4 py-2.5 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all font-medium"
                disabled={processing}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-lg transition-all disabled:opacity-50 font-semibold shadow-lg"
                disabled={processing}
              >
                {processing ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Modal */}
      {showBulkApproveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-admin-card to-admin-bg border-2 border-success/30 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-success">อนุมัติรายการฝากทั้งหมด</h3>
                  <p className="text-sm text-brown-400">
                    คุณต้องการอนุมัติ {selectedIds.length} รายการใช่หรือไม่?
                  </p>
                </div>
              </div>

              <div className="bg-admin-bg/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-brown-300 mb-2">
                  <span className="text-gold-500 font-semibold">หมายเหตุ:</span> ระบบจะทำการอนุมัติรายการทั้งหมดที่เลือกพร้อมกัน หากรายการใดล้มเหลว ระบบจะแจ้งเตือนให้ทราบ
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkApproveModal(false)}
                  className="flex-1 px-4 py-2.5 bg-admin-bg hover:bg-admin-hover border border-admin-border text-brown-200 rounded-lg transition-all font-semibold"
                  disabled={processing}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleBulkApprove}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-success to-success/80 hover:shadow-lg text-white rounded-lg transition-all disabled:opacity-50 font-semibold"
                  disabled={processing}
                >
                  {processing ? 'กำลังดำเนินการ...' : `อนุมัติ ${selectedIds.length} รายการ`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
