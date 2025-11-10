import { useState, useEffect } from 'react'
import { FiUserPlus, FiEdit, FiTrash2, FiLock, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { adminStaffAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'
import { useAdminStore } from '@/store/adminStore'

interface Staff {
  id: string
  username: string
  fullname: string
  permission: number
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT'
  isActive: boolean
  lastLogin: string | null
  lastIp: string | null
  createdAt: string
  updatedAt: string
}

interface StaffFormData {
  username: string
  password?: string
  fullname: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT'
}

export default function StaffManagement() {
  const { admin } = useAdminStore()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [formData, setFormData] = useState<StaffFormData>({
    username: '',
    password: '',
    fullname: '',
    role: 'SUPPORT',
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await adminStaffAPI.getAllStaff({ limit: 100, offset: 0 })
      setStaff(response.staff || [])
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (staffItem?: Staff) => {
    if (staffItem) {
      setEditingStaff(staffItem)
      setFormData({
        username: staffItem.username,
        fullname: staffItem.fullname,
        role: staffItem.role,
      })
    } else {
      setEditingStaff(null)
      setFormData({
        username: '',
        password: '',
        fullname: '',
        role: 'SUPPORT',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingStaff(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingStaff) {
        await adminStaffAPI.updateStaff(editingStaff.id, formData)
        toast.success('แก้ไขข้อมูลพนักงานสำเร็จ')
      } else {
        if (!formData.password) {
          toast.error('กรุณาระบุรหัสผ่าน')
          return
        }
        await adminStaffAPI.createStaff(formData as Required<StaffFormData>)
        toast.success('เพิ่มพนักงานสำเร็จ')
      }
      handleCloseModal()
      fetchStaff()
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      await adminStaffAPI.updateStaffStatus(staffId, { isActive: !currentStatus })
      toast.success('อัพเดทสถานะสำเร็จ')
      fetchStaff()
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleOpenPasswordModal = (staffId: string) => {
    setSelectedStaffId(staffId)
    setNewPassword('')
    setShowPasswordModal(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaffId || !newPassword) {
      toast.error('กรุณาระบุรหัสผ่านใหม่')
      return
    }

    try {
      await adminStaffAPI.resetPassword(selectedStaffId, { newPassword })
      toast.success('รีเซ็ตรหัสผ่านสำเร็จ')
      setShowPasswordModal(false)
      setSelectedStaffId(null)
      setNewPassword('')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (staffId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) {
      return
    }

    try {
      await adminStaffAPI.deleteStaff(staffId)
      toast.success('ลบพนักงานสำเร็จ')
      fetchStaff()
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      SUPPORT: 'Support',
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-500/20 text-red-400 border border-red-500/30',
      ADMIN: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
      SUPPORT: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    }
    return colors[role] || 'bg-brown-700 text-brown-300 border border-brown-600'
  }

  // Check if current user is super admin
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="bg-admin-card border border-brown-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </h2>
          <p className="text-brown-300">
            เฉพาะ Super Admin เท่านั้นที่สามารถจัดการพนักงานได้
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold-500">จัดการพนักงาน</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gold-500 hover:bg-gold-600 text-admin-dark px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiUserPlus />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-brown-700 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-brown-700">
          <thead className="bg-admin-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold-400 uppercase">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold-400 uppercase">
                ชื่อ-นามสกุล
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold-400 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold-400 uppercase">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold-400 uppercase">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold-400 uppercase">
                Last IP
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gold-400 uppercase">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-admin-card divide-y divide-brown-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-brown-300">
                  <div className="flex justify-center">
                    <div className="spinner"></div>
                  </div>
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-brown-300">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              staff.map((staffItem) => (
                <tr key={staffItem.id} className="hover:bg-admin-dark/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gold-400">
                    {staffItem.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-100">
                    {staffItem.fullname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(staffItem.role)}`}
                    >
                      {getRoleLabel(staffItem.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(staffItem.id, staffItem.isActive)}
                      disabled={staffItem.id === admin?.id}
                      className={`flex items-center gap-2 ${staffItem.id === admin?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {staffItem.isActive ? (
                        <>
                          <FiToggleRight className="text-green-400 text-2xl" />
                          <span className="text-sm text-green-400">ใช้งาน</span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-brown-500 text-2xl" />
                          <span className="text-sm text-brown-400">ปิด</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                    {staffItem.lastLogin
                      ? new Date(staffItem.lastLogin).toLocaleString('th-TH')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                    {staffItem.lastIp || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(staffItem)}
                        disabled={staffItem.id === admin?.id}
                        className={`text-gold-400 hover:text-gold-300 transition-colors ${staffItem.id === admin?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="แก้ไข"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleOpenPasswordModal(staffItem.id)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="รีเซ็ตรหัสผ่าน"
                      >
                        <FiLock className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffItem.id)}
                        disabled={staffItem.id === admin?.id}
                        className={`text-red-400 hover:text-red-300 transition-colors ${staffItem.id === admin?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="ลบ"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-admin-card border border-brown-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gold-500 mb-4">
              {editingStaff ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingStaff}
                    className="input disabled:opacity-50"
                    required
                  />
                </div>
                {!editingStaff && (
                  <div>
                    <label className="block text-sm font-medium text-brown-200 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT',
                      })
                    }
                    className="input"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-brown-100 bg-admin-dark border border-brown-700 rounded-lg hover:bg-brown-800 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-admin-dark bg-gold-500 rounded-lg hover:bg-gold-600 transition-colors"
                >
                  {editingStaff ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-admin-card border border-brown-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gold-500 mb-4">รีเซ็ตรหัสผ่าน</h2>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-brown-200 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-brown-100 bg-admin-dark border border-brown-700 rounded-lg hover:bg-brown-800 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-admin-dark bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  รีเซ็ตรหัสผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
