import { useState, useEffect } from 'react'
import { FiSearch, FiUserPlus, FiEdit, FiEye, FiRefreshCw, FiPlusCircle, FiMinusCircle, FiClock, FiActivity, FiLock, FiUserX } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'
import AddMemberModal from '@/components/admin/modals/AddMemberModal'
import EditMemberModal from '@/components/admin/modals/EditMemberModal'
import AddCreditModal from '@/components/admin/modals/AddCreditModal'
import DeductCreditModal from '@/components/admin/modals/DeductCreditModal'
import MemberHistoryModal from '@/components/admin/modals/MemberHistoryModal'
import MemberGameHistoryModal from '@/components/admin/modals/MemberGameHistoryModal'
import ResetPasswordModal from '@/components/admin/modals/ResetPasswordModal'
import SuspendMemberModal from '@/components/admin/modals/SuspendMemberModal'

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
  totalDeposits: number
  totalWithdraws: number
  lastLogin: string | null
  createdAt: string
  gameUsername?: string
  gamePassword?: string
}

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  pageSize: number
}

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddCreditModal, setShowAddCreditModal] = useState(false)
  const [showDeductCreditModal, setShowDeductCreditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGameHistoryModal, setShowGameHistoryModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [currentPage, search, statusFilter])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await adminMemberAPI.listMembers({
        page: currentPage,
        pageSize,
        search,
        status: statusFilter,
      })
      setMembers(response.members || [])
      setTotal(response.total || 0)
    } catch (error: any) {
      console.error('Failed to fetch members:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setShowEditModal(true)
  }

  const handleAddCredit = (member: Member) => {
    setSelectedMember(member)
    setShowAddCreditModal(true)
  }

  const handleDeductCredit = (member: Member) => {
    setSelectedMember(member)
    setShowDeductCreditModal(true)
  }

  const handleViewHistory = (member: Member) => {
    setSelectedMember(member)
    setShowHistoryModal(true)
  }

  const handleViewGameHistory = (member: Member) => {
    setSelectedMember(member)
    setShowGameHistoryModal(true)
  }

  const handleResetPassword = (member: Member) => {
    setSelectedMember(member)
    setShowResetPasswordModal(true)
  }

  const handleSuspendToggle = (member: Member) => {
    setSelectedMember(member)
    setShowSuspendModal(true)
  }

  const handleModalSuccess = () => {
    fetchMembers()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      banned: 'bg-red-100 text-red-800 border-red-200',
    }
    const labels = {
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
      banned: 'ระงับ',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสมาชิก</h1>
          <p className="text-sm text-gray-600 mt-1">รายการสมาชิกทั้งหมด {total.toLocaleString()} คน</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C4A962] text-white rounded-lg hover:bg-[#B39952] transition-colors"
        >
          <FiUserPlus className="w-5 h-5" />
          เพิ่มสมาชิก
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเบอร์โทร หรือชื่อ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A962] focus:border-transparent"
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
            <option value="banned">ระงับ</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">วันที่สมัคร</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">เบอร์โทร</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">เครดิต</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">เครดิตในเกม</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">ยอดฝากรวม</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">ยอดถอนรวม</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">สถานะ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ล็อคอินล่าสุด</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลสมาชิก
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{member.fullname || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(member.credit)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(member.creditGame)}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(member.totalDeposits)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(member.totalWithdraws)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(member.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(member.lastLogin)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="แก้ไข"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddCredit(member)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="เพิ่มเครดิต"
                        >
                          <FiPlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeductCredit(member)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="ลดเครดิต"
                        >
                          <FiMinusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewHistory(member)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="ประวัติเงิน"
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewGameHistory(member)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="ประวัติเกม"
                        >
                          <FiActivity className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(member)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          title="รีเซ็ตรหัสผ่าน"
                        >
                          <FiLock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspendToggle(member)}
                          className={`p-1.5 rounded transition-colors ${
                            member.status === 'banned'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={member.status === 'banned' ? 'ปลดระงับ' : 'ระงับบัญชี'}
                        >
                          <FiUserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/admin/members/${member.id}`, '_blank')}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                แสดง {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} จาก {total.toLocaleString()} รายการ
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === pageNum
                            ? 'bg-[#C4A962] text-white border-[#C4A962]'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditMemberModal
        isOpen={showEditModal}
        member={selectedMember}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMember(null)
        }}
        onSuccess={handleModalSuccess}
      />

      <AddCreditModal
        isOpen={showAddCreditModal}
        member={selectedMember}
        onClose={() => {
          setShowAddCreditModal(false)
          setSelectedMember(null)
        }}
        onSuccess={handleModalSuccess}
      />

      <DeductCreditModal
        isOpen={showDeductCreditModal}
        member={selectedMember}
        onClose={() => {
          setShowDeductCreditModal(false)
          setSelectedMember(null)
        }}
        onSuccess={handleModalSuccess}
      />

      <MemberHistoryModal
        isOpen={showHistoryModal}
        member={selectedMember}
        onClose={() => {
          setShowHistoryModal(false)
          setSelectedMember(null)
        }}
      />

      <MemberGameHistoryModal
        isOpen={showGameHistoryModal}
        member={selectedMember}
        onClose={() => {
          setShowGameHistoryModal(false)
          setSelectedMember(null)
        }}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        member={selectedMember}
        onClose={() => {
          setShowResetPasswordModal(false)
          setSelectedMember(null)
        }}
        onSuccess={handleModalSuccess}
      />

      <SuspendMemberModal
        isOpen={showSuspendModal}
        member={selectedMember}
        onClose={() => {
          setShowSuspendModal(false)
          setSelectedMember(null)
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
