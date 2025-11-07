import { useEffect, useState } from 'react'
import { adminWithdrawalAPI } from '@/api/adminWithdrawalAPI'
import { uploadAPI } from '@/api/adminAPI'
import { WithdrawalWithMember } from '@/api/adminWithdrawalAPI'
import {
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiUpload,
  FiClock,
  FiTrendingDown,
  FiCalendar,
  FiCreditCard,
} from 'react-icons/fi'
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

export default function WithdrawalsPending() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalWithMember | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actualAmount, setActualAmount] = useState(0)
  const [remark, setRemark] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'auto' | 'manual'>('manual')
  const [selectedGateway, setSelectedGateway] = useState('bitpayz')
  const [slipUrl, setSlipUrl] = useState('')
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [uploadingSlip, setUploadingSlip] = useState(false)

  useEffect(() => {
    fetchPendingWithdrawals()
  }, [])

  const fetchPendingWithdrawals = async () => {
    try {
      setIsLoading(true)
      const data = await adminWithdrawalAPI.getPendingWithdrawals(100, 0)
      setWithdrawals(data.withdrawals || [])
    } catch (error: any) {
      console.error('Failed to fetch withdrawals:', error)
      toast.error('ไม่สามารถโหลดรายการถอนได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกิน 10MB')
      return
    }

    setSlipFile(file)

    try {
      setUploadingSlip(true)
      const result = await uploadAPI.uploadSlip(file)
      setSlipUrl(result.url)
      toast.success('อัพโหลดสลิปสำเร็จ')
    } catch (error: any) {
      console.error('Failed to upload slip:', error)
      toast.error('อัพโหลดสลิปล้มเหลว')
      setSlipFile(null)
    } finally {
      setUploadingSlip(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedWithdrawal) return

    if (paymentMethod === 'manual' && !slipUrl.trim()) {
      toast.error('กรุณาอัพโหลดสลิปการโอนเงิน')
      return
    }

    try {
      setProcessing(true)
      await adminWithdrawalAPI.approveWithdrawal(selectedWithdrawal.id, {
        paymentMethod,
        gateway: paymentMethod === 'auto' ? selectedGateway : undefined,
        slipUrl: paymentMethod === 'manual' ? slipUrl : undefined,
        remark: remark || undefined,
      })
      toast.success('อนุมัติรายการถอนเรียบร้อย')
      setShowApproveModal(false)
      setSelectedWithdrawal(null)
      setActualAmount(0)
      setRemark('')
      setPaymentMethod('manual')
      setSelectedGateway('bitpayz')
      setSlipUrl('')
      setSlipFile(null)
      fetchPendingWithdrawals()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'อนุมัติล้มเหลว')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason) {
      toast.error('กรุณาระบุเหตุผล')
      return
    }

    try {
      setProcessing(true)
      await adminWithdrawalAPI.rejectWithdrawal(selectedWithdrawal.id, {
        reason: rejectReason,
      })
      toast.success('ปฏิเสธรายการถอนเรียบร้อย (เงินคืนให้สมาชิกแล้ว)')
      setShowRejectModal(false)
      setSelectedWithdrawal(null)
      setRejectReason('')
      setRemark('')
      fetchPendingWithdrawals()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ปฏิเสธล้มเหลว')
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
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-error/20 to-error/10 rounded-lg flex items-center justify-center">
            <FiTrendingDown className="w-5 h-5 text-error" />
          </div>
          รายการถอนรอดำเนินการ
        </h1>
        <p className="text-brown-300 ml-13">ตรวจสอบและอนุมัติรายการถอนเงินของสมาชิก</p>
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
              <div className="text-3xl font-bold text-warning">{withdrawals.length}</div>
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
              <div className="text-3xl font-bold text-error">
                {formatCurrency(withdrawals.reduce((sum, w) => sum + w.amount, 0)).replace('฿', '')}
              </div>
              <div className="text-xs text-brown-500 mt-1">บาท</div>
            </div>
            <div className="w-14 h-14 bg-error/10 rounded-xl flex items-center justify-center">
              <FiTrendingDown className="w-7 h-7 text-error" />
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
                {withdrawals.filter((w) => dayjs(w.createdAt).isSame(dayjs(), 'day')).length}
              </div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <div className="w-14 h-14 bg-info/10 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-7 h-7 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {withdrawals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-10 h-10 text-brown-500 opacity-50" />
            </div>
            <p className="text-brown-400 text-lg">ไม่มีรายการถอนรอดำเนินการ</p>
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
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    บัญชีธนาคาร
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {withdrawals.map((withdrawal, index) => (
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
                          <div className="text-xs text-brown-500 mt-0.5 flex items-center gap-1">
                            <span className="text-success">฿</span>
                            {formatCurrency(withdrawal.memberCredit).replace('฿', '')}
                          </div>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal)
                            setShowApproveModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal)
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
      {showApproveModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiCheckCircle className="w-6 h-6" />
              อนุมัติรายการถอน
            </h3>

            <div className="mb-6 p-4 bg-admin-bg rounded-xl border border-admin-border">
              <div className="text-sm text-brown-400 mb-2">สมาชิก: {selectedWithdrawal.memberPhone}</div>
              <div className="text-3xl font-bold text-error mb-2">{formatCurrency(selectedWithdrawal.amount)}</div>
              {selectedWithdrawal.bankCode && (
                <BankInfo
                  bankCode={selectedWithdrawal.bankCode}
                  bankName={selectedWithdrawal.bankName || ''}
                  bankNumber={selectedWithdrawal.bankNumber || ''}
                  size="sm"
                />
              )}
            </div>

            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-brown-200 mb-3">
                  วิธีการจ่ายเงิน <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === 'auto'
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-admin-border bg-admin-bg hover:border-brown-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="auto"
                      checked={paymentMethod === 'auto'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'auto' | 'manual')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <FiCreditCard className="w-5 h-5 text-gold-500" />
                      <span className="font-semibold text-brown-100">อัตโนมัติ</span>
                    </div>
                    <p className="text-xs text-brown-400">ผ่าน Gateway</p>
                  </label>

                  <label
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === 'manual'
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-admin-border bg-admin-bg hover:border-brown-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="manual"
                      checked={paymentMethod === 'manual'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'auto' | 'manual')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <FiUpload className="w-5 h-5 text-gold-500" />
                      <span className="font-semibold text-brown-100">Manual</span>
                    </div>
                    <p className="text-xs text-brown-400">โอนเอง + สลิป</p>
                  </label>
                </div>
              </div>

              {/* Gateway Selection - Show only for Auto */}
              {paymentMethod === 'auto' && (
                <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    เลือก Payment Gateway <span className="text-error">*</span>
                  </label>
                  <select
                    value={selectedGateway}
                    onChange={(e) => setSelectedGateway(e.target.value)}
                    className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="bitpayz">Bitpayz</option>
                    <option value="scb_auto">SCB Auto</option>
                    <option value="autopeer">Autopeer</option>
                  </select>
                </div>
              )}

              {/* Slip Upload - Show only for Manual */}
              {paymentMethod === 'manual' && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    อัพโหลดสลิปการโอนเงิน <span className="text-error">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="block cursor-pointer">
                      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-admin-bg hover:bg-admin-hover border-2 border-dashed border-admin-border hover:border-gold-500 rounded-lg transition-all">
                        <FiUpload className="w-5 h-5 text-gold-500" />
                        <span className="text-brown-200 font-medium">
                          {slipFile ? slipFile.name : 'เลือกไฟล์สลิป'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploadingSlip}
                      />
                    </label>
                    {uploadingSlip && (
                      <div className="flex items-center gap-2 text-warning text-sm">
                        <div className="animate-spin w-4 h-4 border-2 border-warning border-t-transparent rounded-full"></div>
                        <span>กำลังอัพโหลด...</span>
                      </div>
                    )}
                    {slipUrl && !uploadingSlip && (
                      <div className="flex items-center gap-2 text-success text-sm">
                        <FiCheckCircle className="w-4 h-4" />
                        <span>อัพโหลดสำเร็จ</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-brown-500 mt-2">รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 10MB</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  จำนวนเงินจริงที่โอน
                </label>
                <input
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder={selectedWithdrawal.amount.toString()}
                />
                <p className="text-xs text-brown-500 mt-1">
                  หากไม่ระบุ จะใช้จำนวนเดิม {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">หมายเหตุ (ถ้ามี)</label>
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
                  setSelectedWithdrawal(null)
                  setActualAmount(0)
                  setRemark('')
                  setPaymentMethod('manual')
                  setSelectedGateway('bitpayz')
                  setSlipUrl('')
                  setSlipFile(null)
                }}
                className="flex-1 px-4 py-2.5 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all font-medium"
                disabled={processing}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2.5 bg-success hover:bg-success/90 text-white rounded-lg transition-all disabled:opacity-50 font-semibold shadow-lg"
                disabled={processing || (paymentMethod === 'manual' && !slipUrl)}
              >
                {processing ? 'กำลังดำเนินการ...' : 'ยืนยันอนุมัติ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-error mb-4 flex items-center gap-2">
              <FiXCircle className="w-6 h-6" />
              ปฏิเสธรายการถอน
            </h3>

            <div className="mb-6 p-4 bg-error/10 rounded-xl border border-error/30">
              <div className="text-sm text-warning mb-2 flex items-center gap-2">
                ⚠️ เงินจะถูกคืนให้สมาชิกอัตโนมัติ
              </div>
              <div className="text-sm text-brown-400 mb-2">สมาชิก: {selectedWithdrawal.memberPhone}</div>
              <div className="text-2xl font-bold text-error">{formatCurrency(selectedWithdrawal.amount)}</div>
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
                <label className="block text-sm font-medium text-brown-200 mb-2">หมายเหตุ (ถ้ามี)</label>
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
                  setSelectedWithdrawal(null)
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
    </div>
  )
}
