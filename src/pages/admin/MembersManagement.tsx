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
    const configs = {
      active: {
        bg: 'bg-success/10',
        text: 'text-success',
        border: 'border-success/30',
        icon: '✓',
        label: 'ปกติ'
      },
      inactive: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning/30',
        icon: '●',
        label: 'ไม่ใช้งาน'
      },
      banned: {
        bg: 'bg-error/10',
        text: 'text-error',
        border: 'border-error/30',
        icon: '✕',
        label: 'ระงับ'
      },
    }
    const config = configs[status as keyof typeof configs] || configs.active
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${config.bg} ${config.text} ${config.border}`}>
        <span className="text-sm leading-none font-bold">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-lg flex items-center justify-center">
              <FiUserPlus className="w-5 h-5 text-info" />
            </div>
            จัดการสมาชิก
          </h1>
          <p className="text-sm text-brown-300 ml-13">รายการสมาชิกทั้งหมด {total.toLocaleString()} คน</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <FiUserPlus className="w-5 h-5" />
          เพิ่มสมาชิก
        </button>
      </div>

      {/* Filters */}
      <div className="bg-admin-card rounded-xl shadow-lg border border-admin-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500" />
            <input
              type="text"
              placeholder="ค้นหาเบอร์โทร หรือชื่อ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500 appearance-none"
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
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card rounded-xl shadow-lg border border-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-admin-bg to-admin-bg/50 border-b border-admin-border">
                <th className="px-4 py-4 text-left text-xs font-semibold text-brown-200 uppercase">วันที่สมัคร</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brown-200 uppercase">เบอร์โทร</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brown-200 uppercase">ชื่อ-นามสกุล</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-brown-200 uppercase">เครดิต</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-brown-200 uppercase">เครดิตในเกม</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-brown-200 uppercase">ยอดฝากรวม</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-brown-200 uppercase">ยอดถอนรวม</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brown-200 uppercase">สถานะ</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brown-200 uppercase">ล็อคอินล่าสุด</th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-brown-200 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-brown-400">
                    <div className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-brown-400">
                    ไม่พบข้อมูลสมาชิก
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr key={member.id} className="hover:bg-admin-hover/50 transition-all group" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-brown-500" />
                        <div className="text-sm text-brown-200">{formatDate(member.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-full flex items-center justify-center text-gold-500 font-bold text-sm">
                          {member.phone.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brown-100">{member.phone}</div>
                          <div className="text-xs text-brown-500">ID: {member.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brown-100">{member.fullname || '-'}</div>
                      {member.line && <div className="text-xs text-brown-400">LINE: {member.line}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-bold text-success">{formatCurrency(member.credit)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 bg-info/10 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-bold text-info">{formatCurrency(member.creditGame)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-success">{formatCurrency(member.totalDeposits)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-error">{formatCurrency(member.totalWithdraws)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-brown-400">{formatDate(member.lastLogin)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-info hover:bg-info/20 rounded-lg transition-all hover:scale-110 shadow-sm"
                          title="แก้ไข"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddCredit(member)}
                          className="p-2 text-success hover:bg-success/20 rounded-lg transition-all hover:scale-110 shadow-sm"
                          title="เพิ่มเครดิต"
                        >
                          <FiPlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeductCredit(member)}
                          className="p-2 text-error hover:bg-error/20 rounded-lg transition-all hover:scale-110 shadow-sm"
                          title="ลดเครดิต"
                        >
                          <FiMinusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewHistory(member)}
                          className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all hover:scale-110 shadow-sm"
                          title="ประวัติเงิน"
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewGameHistory(member)}
                          className="p-2 text-warning hover:bg-warning/20 rounded-lg transition-all hover:scale-110 shadow-sm"
                          title="ประวัติเกม"
                        >
                          <FiActivity className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(member)}
                          className="p-2 text-gold-500 hover:bg-gold-500/20 rounded-lg transition-all hover:scale-110 shadow-sm"
                          title="รีเซ็ตรหัสผ่าน"
                        >
                          <FiLock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspendToggle(member)}
                          className={`p-2 rounded-lg transition-all hover:scale-110 shadow-sm ${
                            member.status === 'banned'
                              ? 'text-success hover:bg-success/20'
                              : 'text-error hover:bg-error/20'
                          }`}
                          title={member.status === 'banned' ? 'ปลดระงับ' : 'ระงับบัญชี'}
                        >
                          <FiUserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/admin/members/${member.id}`, '_blank')}
                          className="p-2 text-brown-300 hover:bg-admin-hover/50 rounded-lg transition-all hover:scale-110 shadow-sm"
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
          <div className="px-6 py-4 border-t border-admin-border bg-admin-bg/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-brown-300">
                แสดง <span className="font-semibold text-brown-100">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-semibold text-brown-100">{Math.min(currentPage * pageSize, total)}</span> จาก <span className="font-semibold text-brown-100">{total.toLocaleString()}</span> รายการ
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-brown-200 font-medium"
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
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white border-gold-500 shadow-lg'
                            : 'border-admin-border hover:bg-admin-hover text-brown-200'
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
                  className="px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-brown-200 font-medium"
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
