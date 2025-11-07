import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const BANKS = [
  { value: 'TRUE', label: 'TRUEMONEY WALLET - ทรูมันนี่วอเล็ต' },
  { value: 'KBANK', label: 'KBANK - ธนาคารกสิกรไทย' },
  { value: 'SCB', label: 'SCB - ธนาคารไทยพาณิชย์' },
  { value: 'KTB', label: 'KTB - ธนาคารกรุงไทย' },
  { value: 'BBL', label: 'BBL - ธนาคารกรุงเทพ' },
  { value: 'BAY', label: 'BAY - ธนาคารกรุงศรีอยุธยา' },
  { value: 'TTB', label: 'TTB - ธนาคารทหารไทยธนชาต' },
  { value: 'GSB', label: 'GSB - ธนาคารออมสิน' },
  { value: 'BAAC', label: 'BAAC - ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร' },
  { value: 'LH', label: 'LH - ธนาคารแลนด์ แอนด์ เฮ้าส์' },
  { value: 'UOBT', label: 'UOBT - ธนาคารยูโอบี' },
  { value: 'GHB', label: 'GHB - ธนาคารอาคารสงเคราะห์' },
  { value: 'CIMBT', label: 'CIMBT - ธนาคารซีไอเอ็มบีไทย' },
  { value: 'TISCO', label: 'TISCO - ธนาคารทิสโก้' },
]

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    fullname: '',
    bankCode: '',
    bankNumber: '',
    line: '',
    ref: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.phone) {
      toast.error('กรุณากรอกเบอร์มือถือ')
      return
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (!formData.fullname) {
      toast.error('กรุณากรอกชื่อ-นามสกุล')
      return
    }

    if (!formData.bankCode) {
      toast.error('กรุณาเลือกธนาคาร')
      return
    }

    if (!formData.bankNumber) {
      toast.error('กรุณากรอกเลขบัญชี')
      return
    }

    try {
      setLoading(true)
      await adminMemberAPI.createMember({
        phone: formData.phone,
        password: formData.password,
        fullname: formData.fullname,
        bankName: formData.bankCode,
        bankAccount: formData.bankNumber,
        lineId: formData.line || undefined,
      })
      toast.success('เพิ่มสมาชิกสำเร็จ')
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        phone: '',
        password: '',
        fullname: '',
        bankCode: '',
        bankNumber: '',
        line: '',
        ref: '',
      })
    } catch (error: any) {
      console.error('Failed to create member:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">เพิ่มสมาชิกใหม่</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                เบอร์มือถือ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="เบอร์มือถือ 10 หลัก"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="รหัสผ่าน"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
                required
                minLength={6}
              />
              <p className="text-xs text-red-600 mt-1">
                ** รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร **
              </p>
            </div>

            {/* Fullname */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อจริง นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="ไม่ต้องใส่ นาย/นาง/นางสาว"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
                required
              />
            </div>

            {/* Bank */}
            <div>
              <label htmlFor="bankCode" className="block text-sm font-semibold text-gray-700 mb-2">
                เลือกธนาคาร <span className="text-red-500">*</span>
              </label>
              <select
                id="bankCode"
                name="bankCode"
                value={formData.bankCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
                required
              >
                <option value="">เลือกธนาคาร</option>
                {BANKS.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Number */}
            <div>
              <label htmlFor="bankNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                เลขบัญชีธนาคาร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bankNumber"
                name="bankNumber"
                value={formData.bankNumber}
                onChange={handleChange}
                placeholder="เลขบัญชี"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
                required
              />
            </div>

            {/* Line ID (Optional) */}
            <div>
              <label htmlFor="line" className="block text-sm font-semibold text-gray-700 mb-2">
                ไลน์ไอดี
              </label>
              <input
                type="text"
                id="line"
                name="line"
                value={formData.line}
                onChange={handleChange}
                placeholder="ไลน์ไอดี (ถ้ามี)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
              />
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
              className="px-6 py-2 bg-[#C4A962] text-white rounded-lg hover:bg-[#B39952] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
