import { useState } from 'react'
import { FiX, FiLock } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
}

interface ResetPasswordModalProps {
  isOpen: boolean
  member: Member | null
  onClose: () => void
  onSuccess: () => void
}

export default function ResetPasswordModal({ isOpen, member, onClose, onSuccess }: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!member) return

    if (newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }

    try {
      setLoading(true)

      await adminMemberAPI.resetMemberPassword(member.id, newPassword)

      toast.success('รีเซ็ตรหัสผ่านสำเร็จ')
      onSuccess()
      onClose()

      // Reset form
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Failed to reset password:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiLock className="w-5 h-5 text-yellow-600" />
              รีเซ็ตรหัสผ่าน
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {member.phone} - {member.fullname}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ การรีเซ็ตรหัสผ่านจะเปลี่ยนรหัสผ่านของสมาชิกทันที กรุณาแจ้งรหัสผ่านใหม่ให้สมาชิกทราบ
            </p>
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              รหัสผ่านใหม่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              minLength={6}
              autoComplete="off"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              required
              minLength={6}
              autoComplete="off"
            />
          </div>

          {/* Password Match Indicator */}
          {newPassword && confirmPassword && (
            <div className="mb-4">
              {newPassword === confirmPassword ? (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  ✓ รหัสผ่านตรงกัน
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  ✗ รหัสผ่านไม่ตรงกัน
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
