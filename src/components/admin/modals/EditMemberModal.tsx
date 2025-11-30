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
  affiliateRate?: number | null
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
    affiliateRate: '' as string,
  })

  useEffect(() => {
    if (member) {
      console.log('Member data:', member)
      console.log('affiliateRate value:', member.affiliateRate)
      console.log('affiliateRate type:', typeof member.affiliateRate)

      const affiliateRateValue = member.affiliateRate != null ? String(member.affiliateRate) : ''
      console.log('Setting affiliateRate to:', affiliateRateValue)

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
        affiliateRate: affiliateRateValue,
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
        affiliateRate: formData.affiliateRate ? parseFloat(formData.affiliateRate) : null,
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-20">
          <div>
            <h2 className="text-2xl font-display font-bold text-gold-500">แก้ไขข้อมูลยูส</h2>
            <p className="text-brown-400 text-sm mt-1">{member.phone}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brown-300 mb-2">
                เบอร์มือถือ <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                readOnly
                disabled
                className="w-full px-4 py-2 border border-admin-border rounded-lg bg-admin-bg text-brown-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown-300 mb-2">
                รหัสผ่าน (เว้นว่างถ้าไม่เปลี่ยน)
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="รหัสผ่านใหม่"
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                minLength={6}
              />
              <p className="text-xs text-error mt-1">
                ** รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร **
              </p>
            </div>

            {/* Fullname */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-brown-300 mb-2">
                ชื่อจริง นามสกุล <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="ไม่ต้องใส่ นาย/นาง/นางสาว"
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                required
              />
            </div>

            {/* Bank */}
            <div>
              <label htmlFor="bankCode" className="block text-sm font-medium text-brown-300 mb-2">
                เลือกธนาคาร <span className="text-error">*</span>
              </label>
              <select
                id="bankCode"
                name="bankCode"
                value={formData.bankCode}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
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
              <label htmlFor="bankNumber" className="block text-sm font-medium text-brown-300 mb-2">
                เลขบัญชีธนาคาร <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="bankNumber"
                name="bankNumber"
                value={formData.bankNumber}
                onChange={handleChange}
                placeholder="เลขบัญชี"
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                required
              />
            </div>

            {/* Line ID */}
            <div>
              <label htmlFor="line" className="block text-sm font-medium text-brown-300 mb-2">
                ไลน์ไอดี
              </label>
              <input
                type="text"
                id="line"
                name="line"
                value={formData.line}
                onChange={handleChange}
                placeholder="ไลน์ไอดี (ถ้ามี)"
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>

            {/* Affiliate Rate */}
            <div>
              <label htmlFor="affiliateRate" className="block text-sm font-medium text-brown-300 mb-2">
                % แยกการได้รับ Ref
              </label>
              <input
                type="number"
                id="affiliateRate"
                name="affiliateRate"
                value={formData.affiliateRate}
                onChange={handleChange}
                placeholder="เว้นว่างเพื่อใช้ค่าเริ่มต้นของระบบ"
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
              <p className="text-xs text-brown-400 mt-1">
                ถ้าเว้นว่าง จะใช้ค่าเริ่มต้นจากการตั้งค่าระบบ
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-brown-300 mb-2">
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
                  <div className="w-11 h-6 bg-admin-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-admin-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  <span className="ms-3 text-sm font-medium text-brown-200">
                    {formData.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-admin-border my-6"></div>

          {/* Game Info */}
          <h3 className="text-lg font-bold text-gold-500 mb-4">ข้อมูลย่อยอื่นๆ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gameUsername" className="block text-sm font-medium text-brown-300 mb-2">
                ชื่อผู้ใช้ในเกม
              </label>
              <input
                type="text"
                id="gameUsername"
                name="gameUsername"
                value={formData.gameUsername}
                readOnly
                className="w-full px-4 py-2 border border-admin-border rounded-lg bg-admin-bg text-brown-500"
              />
            </div>

            <div>
              <label htmlFor="gamePassword" className="block text-sm font-medium text-brown-300 mb-2">
                รหัสผ่านเข้าเกม
              </label>
              <input
                type="text"
                id="gamePassword"
                name="gamePassword"
                value={formData.gamePassword}
                readOnly
                className="w-full px-4 py-2 border border-admin-border rounded-lg bg-admin-bg text-brown-500"
              />
            </div>
          </div>

          {/* Remark */}
          <div className="mt-4">
            <label htmlFor="remark" className="block text-sm font-medium text-brown-300 mb-2">
              หมายเหตุ
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 placeholder-brown-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
              placeholder="หมายเหตุเพิ่มเติม..."
            />
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
              className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
