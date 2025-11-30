import { useState } from 'react'
import { FiX, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Member {
  memberId: string
  phone: string
  fullname: string | null
  turnoverBalance: number
}

interface Props {
  member: Member
  onClose: () => void
  onSuccess: () => void
}

export default function AdjustTurnoverModal({ member, onClose, onSuccess }: Props) {
  const [type, setType] = useState<'ADD' | 'DEDUCT'>('ADD')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('กรุณาระบุจำนวนที่ถูกต้อง')
      return
    }

    if (!remark.trim()) {
      toast.error('กรุณาระบุหมายเหตุ')
      return
    }

    try {
      setIsSubmitting(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/v1/admin/turnover/members/${member.memberId}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          remark: remark.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('ปรับยอดเทิร์นสำเร็จ')
        onSuccess()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Failed to adjust turnover:', error)
      toast.error('ไม่สามารถปรับยอดเทิร์นได้')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNewBalance = () => {
    const amountNum = parseFloat(amount) || 0
    if (type === 'ADD') {
      return member.turnoverBalance + amountNum
    } else {
      return Math.max(0, member.turnoverBalance - amountNum)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-20">
          <div>
            <h2 className="text-2xl font-display font-bold text-gold-500">ปรับยอดเทิร์น</h2>
            <p className="text-brown-400 text-sm mt-1">{member.phone} - {member.fullname || 'ไม่ระบุชื่อ'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-admin-hover rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-brown-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Info */}
          <div className="bg-admin-bg border border-admin-border rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-brown-400">สมาชิก:</span>
                <span className="text-brown-200 font-medium">{member.fullname || member.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-400">เบอร์โทร:</span>
                <span className="text-brown-200">{member.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-admin-border">
                <span className="text-brown-400">เทิร์นปัจจุบัน:</span>
                <span className="text-gold-500 font-bold text-lg">{formatNumber(member.turnoverBalance)}</span>
              </div>
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-brown-300 text-sm font-medium mb-2">ประเภทการปรับ</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('ADD')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === 'ADD'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-admin-border bg-admin-card text-brown-400 hover:border-gold-500/50'
                }`}
              >
                <div className="font-semibold">เพิ่มเทิร์น</div>
              </button>
              <button
                type="button"
                onClick={() => setType('DEDUCT')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === 'DEDUCT'
                    ? 'border-error bg-error/10 text-error'
                    : 'border-admin-border bg-admin-card text-brown-400 hover:border-gold-500/50'
                }`}
              >
                <div className="font-semibold">ลดเทิร์น</div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-brown-300 text-sm font-medium mb-2">
              จำนวน <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-brown-300 text-sm font-medium mb-2">
              หมายเหตุ <span className="text-error">*</span>
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="ระบุเหตุผลในการปรับยอด..."
              rows={3}
              required
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-brown-200 font-medium mb-1">ยอดหลังปรับ</p>
                  <p className="text-2xl font-bold text-gold-500">{formatNumber(calculateNewBalance())} THB</p>
                  <p className="text-brown-400 text-sm mt-1">
                    {type === 'ADD' ? '+' : '-'} {formatNumber(parseFloat(amount))} THB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-admin-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 text-brown-300 bg-admin-card border border-admin-border rounded-lg hover:border-gold-500/50 transition-colors"
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการปรับยอด'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
