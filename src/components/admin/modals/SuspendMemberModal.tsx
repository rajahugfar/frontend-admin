import { useState } from 'react'
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
  status: 'active' | 'inactive' | 'banned'
}

interface SuspendMemberModalProps {
  isOpen: boolean
  member: Member | null
  onClose: () => void
  onSuccess: () => void
}

export default function SuspendMemberModal({ isOpen, member, onClose, onSuccess }: SuspendMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'banned'>('active')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!member) return

    if (selectedStatus === 'banned' && !reason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการระงับบัญชี')
      return
    }

    try {
      setLoading(true)

      await adminMemberAPI.updateMemberStatus(member.id, selectedStatus)

      const statusText = {
        active: 'เปิดใช้งาน',
        inactive: 'ปิดใช้งาน',
        banned: 'ระงับบัญชี',
      }[selectedStatus]

      toast.success(`${statusText}สำเร็จ`)
      onSuccess()
      onClose()

      // Reset form
      setReason('')
    } catch (error: any) {
      console.error('Failed to update member status:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setSelectedStatus('active')
      onClose()
    }
  }

  if (!isOpen || !member) return null

  const isCurrentlySuspended = member.status === 'banned'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {isCurrentlySuspended ? (
                <>
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  จัดการสถานะบัญชี
                </>
              ) : (
                <>
                  <FiAlertTriangle className="w-5 h-5 text-red-600" />
                  จัดการสถานะบัญชี
                </>
              )}
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
          {/* Current Status */}
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">สถานะปัจจุบัน</div>
            <div className="flex items-center gap-2">
              {member.status === 'active' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-semibold">
                  ใช้งาน
                </span>
              )}
              {member.status === 'inactive' && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-sm font-semibold">
                  ไม่ใช้งาน
                </span>
              )}
              {member.status === 'banned' && (
                <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-sm font-semibold">
                  ระงับ
                </span>
              )}
            </div>
          </div>

          {/* New Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
              เปลี่ยนสถานะเป็น <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="active">ใช้งาน (Active)</option>
              <option value="inactive">ไม่ใช้งาน (Inactive)</option>
              <option value="banned">ระงับบัญชี (Banned)</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {selectedStatus === 'active' && '✓ สมาชิกสามารถเข้าใช้งานระบบได้ปกติ'}
              {selectedStatus === 'inactive' && '⊝ สมาชิกไม่สามารถเข้าใช้งานได้ชั่วคราว'}
              {selectedStatus === 'banned' && '⊗ สมาชิกถูกระงับไม่สามารถเข้าใช้งานได้'}
            </p>
          </div>

          {/* Reason (required for banned) */}
          {selectedStatus === 'banned' && (
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผลในการระงับ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="ระบุเหตุผลในการระงับบัญชี..."
                required={selectedStatus === 'banned'}
              />
            </div>
          )}

          {/* Warning */}
          {selectedStatus === 'banned' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ คำเตือน: การระงับบัญชีจะทำให้สมาชิกไม่สามารถเข้าใช้งานระบบได้ทันที
              </p>
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
              disabled={loading || (selectedStatus === 'banned' && !reason.trim())}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedStatus === 'banned'
                  ? 'bg-red-600 hover:bg-red-700'
                  : selectedStatus === 'inactive'
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
