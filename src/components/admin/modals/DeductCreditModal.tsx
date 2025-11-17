import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { adminCreditAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
  credit: number
  creditGame: number
}

interface DeductCreditModalProps {
  isOpen: boolean
  member: Member | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeductCreditModal({ isOpen, member, onClose, onSuccess }: DeductCreditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: 10,
    type: 'manual',
    remark: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!member) return

    if (formData.amount <= 0) {
      toast.error('กรุณากรอกจำนวนเครดิตที่ถูกต้อง')
      return
    }

    if (formData.amount > member.credit) {
      toast.error('จำนวนเครดิตที่ต้องการลดมากกว่าเครดิตที่มีอยู่')
      return
    }

    try {
      setLoading(true)

      await adminCreditAPI.deductCredit({
        memberId: member.id,
        amount: formData.amount,
        adjustmentType: formData.type,
        remark: formData.remark,
      })

      toast.success(`ลดเครดิต ${formData.amount.toLocaleString()} บาท สำเร็จ`)
      onSuccess()
      onClose()

      // Reset form
      setFormData({
        amount: 10,
        type: 'manual',
        remark: '',
      })
    } catch (error: any) {
      console.error('Failed to deduct credit:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลดเครดิต')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-error">ลดเครดิต</h2>
            <p className="text-brown-400 text-sm mt-1">{member.phone} - {member.fullname}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-admin-hover rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-brown-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Balance */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-brown-300 mb-2">
              เครดิตล่าสุด
            </label>
            <input
              type="text"
              value={member.credit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              readOnly
              className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 font-semibold"
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-semibold text-brown-300 mb-2">
              จำนวนเครดิตที่ต้องการลด <span className="text-error">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              max={member.credit}
              step="0.01"
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-error focus:border-transparent"
              required
            />
            <p className="text-xs text-brown-500 mt-1">
              สูงสุด: {member.credit.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </p>
          </div>

          {/* Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-semibold text-brown-300 mb-2">
              ประเภท
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-error focus:border-transparent"
            >
              <option value="manual">ถอนมือ</option>
              <option value="penalty">ปรับเครดิต</option>
              <option value="refund">คืนเครดิตหาย</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          {/* Remark */}
          <div className="mb-4">
            <label htmlFor="remark" className="block text-sm font-semibold text-brown-300 mb-2">
              หมายเหตุ
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-error focus:border-transparent"
              placeholder="ระบุเหตุผลในการลดเครดิต..."
            />
          </div>

          {/* Warning */}
          <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-sm text-error">
              ⚠️ <strong>คำเตือน:</strong> การลดเครดิตจะทำให้เครดิตของสมาชิกลดลงทันที กรุณาตรวจสอบให้แน่ใจก่อนยืนยัน
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-admin-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-admin-card border border-admin-border text-brown-200 rounded-lg hover:border-gold-500/50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-error to-error/90 text-white rounded-lg hover:from-error/90 hover:to-error/80 transition-all shadow-lg hover:shadow-error/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'ลดเครดิต'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
