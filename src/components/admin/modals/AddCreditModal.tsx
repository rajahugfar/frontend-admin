import { useState } from 'react'
import { FiX, FiUpload } from 'react-icons/fi'
import { adminCreditAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
  credit: number
  creditGame: number
}

interface AddCreditModalProps {
  isOpen: boolean
  member: Member | null
  onClose: () => void
  onSuccess: () => void
}

export default function AddCreditModal({ isOpen, member, onClose, onSuccess }: AddCreditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: 10,
    type: 'manual',
    remark: '',
    file: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        file: e.target.files![0],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!member) return

    if (formData.amount <= 0) {
      toast.error('กรุณากรอกจำนวนเครดิตที่ถูกต้อง')
      return
    }

    try {
      setLoading(true)

      // TODO: Upload file if provided
      let slipUrl = undefined
      if (formData.file) {
        // Upload file logic here
        // slipUrl = await uploadFile(formData.file)
      }

      await adminCreditAPI.addCredit({
        memberId: member.id,
        amount: formData.amount,
        adjustmentType: formData.type,
        remark: formData.remark,
        slipUrl,
      })

      toast.success(`เพิ่มเครดิต ${formData.amount.toLocaleString()} บาท สำเร็จ`)
      onSuccess()
      onClose()

      // Reset form
      setFormData({
        amount: 10,
        type: 'manual',
        remark: '',
        file: null,
      })
    } catch (error: any) {
      console.error('Failed to add credit:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มเครดิต')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-20">
          <div>
            <h2 className="text-2xl font-display font-bold text-gold-500">เพิ่มเครดิต</h2>
            <p className="text-brown-400 text-sm mt-1">{member.phone} - {member.fullname}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-admin-hover rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-brown-400 hover:text-gold-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Balance */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-brown-300 mb-2">
              เครดิตล่าสุด
            </label>
            <input
              type="text"
              value={member.credit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              readOnly
              className="w-full px-4 py-2 border border-admin-border rounded-lg bg-admin-bg text-gold-500 font-bold text-lg"
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-brown-300 mb-2">
              จำนวนเครดิต <span className="text-error">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              required
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-brown-300 mb-2">
              ประเภท
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="manual">ธนาคารมีปัญหา</option>
              <option value="refund">คืนเครดิตหาย</option>
              <option value="bonus">โบนัส</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          {/* Remark */}
          <div className="mb-4">
            <label htmlFor="remark" className="block text-sm font-medium text-brown-300 mb-2">
              หมายเหตุ
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
              placeholder="ระบุเหตุผลในการเพิ่มเครดิต..."
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-brown-300 mb-2">
              อัพโหลดหลักฐาน (ถ้ามี)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-admin-border rounded-lg cursor-pointer hover:border-gold-500 transition-colors bg-admin-bg">
                <FiUpload className="w-5 h-5 text-brown-400 mr-2" />
                <span className="text-sm text-brown-300">
                  {formData.file ? formData.file.name : 'เลือกไฟล์'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-admin-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-brown-300 bg-admin-card border border-admin-border rounded-lg hover:border-gold-500/50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-success to-success/90 text-white rounded-lg hover:from-success/90 hover:to-success/80 transition-all shadow-lg hover:shadow-success/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'เพิ่มเครดิต'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
