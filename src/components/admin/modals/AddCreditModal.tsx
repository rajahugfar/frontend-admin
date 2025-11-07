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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">เพิ่มเครดิต</h2>
            <p className="text-sm text-gray-600 mt-1">{member.phone} - {member.fullname}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Balance */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เครดิตล่าสุด
            </label>
            <input
              type="text"
              value={member.credit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              จำนวนเครดิต <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
              ประเภท
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="manual">ธนาคารมีปัญหา</option>
              <option value="refund">คืนเครดิตหาย</option>
              <option value="bonus">โบนัส</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          {/* Remark */}
          <div className="mb-4">
            <label htmlFor="remark" className="block text-sm font-semibold text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="ระบุเหตุผลในการเพิ่มเครดิต..."
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              อัพโหลดหลักฐาน (ถ้ามี)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                <FiUpload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
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
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'เพิ่มเครดิต'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
