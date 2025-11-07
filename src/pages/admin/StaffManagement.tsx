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
    } catch (error: any) {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      await adminStaffAPI.updateStaffStatus(staffId, { isActive: !currentStatus })
      toast.success('อัพเดทสถานะสำเร็จ')
      fetchStaff()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
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
      SUPER_ADMIN: 'bg-red-100 text-red-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      SUPPORT: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  // Check if current user is super admin
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </h2>
          <p className="text-gray-600">
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการพนักงาน</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiUserPlus />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ชื่อ-นามสกุล
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last IP
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  กำลังโหลด...
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              staff.map((staffItem) => (
                <tr key={staffItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {staffItem.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <FiToggleRight className="text-green-500 text-2xl" />
                          <span className="text-sm text-green-600">ใช้งาน</span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-gray-400 text-2xl" />
                          <span className="text-sm text-gray-500">ปิด</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staffItem.lastLogin
                      ? new Date(staffItem.lastLogin).toLocaleString('th-TH')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staffItem.lastIp || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(staffItem)}
                        disabled={staffItem.id === admin?.id}
                        className={`text-blue-600 hover:text-blue-900 ${staffItem.id === admin?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="แก้ไข"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleOpenPasswordModal(staffItem.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="รีเซ็ตรหัสผ่าน"
                      >
                        <FiLock className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffItem.id)}
                        disabled={staffItem.id === admin?.id}
                        className={`text-red-600 hover:text-red-900 ${staffItem.id === admin?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingStaff}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>
                {!editingStaff && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">รีเซ็ตรหัสผ่าน</h2>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
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
