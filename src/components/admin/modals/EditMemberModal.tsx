import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
  bankCode: string | null
  bankNumber: string | null
  line: string | null
  credit: number
  creditGame: number
  status: 'active' | 'inactive' | 'banned'
  gameUsername?: string
  gamePassword?: string
}

interface EditMemberModalProps {
  isOpen: boolean
  member: Member | null
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

export default function EditMemberModal({ isOpen, member, onClose, onSuccess }: EditMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    fullname: '',
    bankCode: '',
    bankNumber: '',
    line: '',
    status: 'active' as 'active' | 'inactive' | 'banned',
    gameUsername: '',
    gamePassword: '',
    remark: '',
  })

  useEffect(() => {
    if (member) {
      setFormData({
        phone: member.phone || '',
        password: '',
        fullname: member.fullname || '',
        bankCode: member.bankCode || '',
        bankNumber: member.bankNumber || '',
        line: member.line || '',
        status: member.status || 'active',
        gameUsername: member.gameUsername || '',
        gamePassword: member.gamePassword || '',
        remark: '',
      })
    }
  }, [member])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 'active' : 'inactive',
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!member) return

    try {
      setLoading(true)

      // Update member info
      await adminMemberAPI.updateMember(member.id, {
        fullname: formData.fullname,
        bankName: formData.bankCode,
        bankAccount: formData.bankNumber,
        lineId: formData.line || undefined,
      })

      // Update status if changed
      if (formData.status !== member.status) {
        await adminMemberAPI.updateMemberStatus(member.id, formData.status)
      }

      // Reset password if provided
      if (formData.password && formData.password.length >= 6) {
        await adminMemberAPI.resetMemberPassword(member.id, formData.password)
      }

      toast.success('แก้ไขข้อมูลสมาชิกสำเร็จ')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update member:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">แก้ไขข้อมูลยูส - {member.phone}</h2>
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
                readOnly
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน (เว้นว่างถ้าไม่เปลี่ยน)
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="รหัสผ่านใหม่"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
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

            {/* Line ID */}
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

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เปิด/ปิด การใช้งาน
              </label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status === 'active'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C4A962]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900">
                    {formData.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* Game Info */}
          <h3 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลย่อยอื่นๆ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gameUsername" className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อผู้ใช้ในเกม
              </label>
              <input
                type="text"
                id="gameUsername"
                name="gameUsername"
                value={formData.gameUsername}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="gamePassword" className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่านเข้าเกม
              </label>
              <input
                type="text"
                id="gamePassword"
                name="gamePassword"
                value={formData.gamePassword}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          </div>

          {/* Remark */}
          <div className="mt-4">
            <label htmlFor="remark" className="block text-sm font-semibold text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
              placeholder="หมายเหตุเพิ่มเติม..."
            />
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
