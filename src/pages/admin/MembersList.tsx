import { useEffect, useState } from 'react'
import { adminMemberAPI } from '@/api/adminAPI'
import { Member } from '@/types/admin'
import { FiSearch, FiUsers, FiEdit, FiSlash, FiCheck } from 'react-icons/fi'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function MembersList() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    fetchMembers()
  }, [page, search, statusFilter])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with real API call when backend is ready
      setMembers([])
      setTotal(0)
      // const data = await adminMemberAPI.listMembers({
      //   page,
      //   pageSize,
      //   search: search || undefined,
      //   status: statusFilter || undefined,
      // })
      // setMembers(data.members || [])
      // setTotal(data.total || 0)
    } catch (error: any) {
      console.error('Failed to fetch members:', error)
      toast.error('ไม่สามารถโหลดรายการสมาชิกได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchMembers()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">ใช้งาน</span>
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">ปิดใช้งาน</span>
      case 'banned':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-error/10 text-error">แบน</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-brown-400/10 text-brown-400">{status}</span>
    }
  }

  if (isLoading && members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold-500">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gold-500 mb-2">
          จัดการสมาชิก
        </h1>
        <p className="text-brown-300">รายการสมาชิกทั้งหมด</p>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="ค้นหา เบอร์โทร, ชื่อ, บัญชีธนาคาร..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ปิดใช้งาน</option>
            <option value="banned">แบน</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-all"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="text-brown-400 text-sm mb-1">สมาชิกทั้งหมด</div>
          <div className="text-2xl font-bold text-gold-500">{total}</div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="text-brown-400 text-sm mb-1">ใช้งาน</div>
          <div className="text-2xl font-bold text-success">
            {members.filter((m) => m.status === 'active').length}
          </div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="text-brown-400 text-sm mb-1">ปิดใช้งาน</div>
          <div className="text-2xl font-bold text-warning">
            {members.filter((m) => m.status === 'inactive').length}
          </div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <div className="text-brown-400 text-sm mb-1">แบน</div>
          <div className="text-2xl font-bold text-error">
            {members.filter((m) => m.status === 'banned').length}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-admin-card border border-admin-border rounded-lg shadow-lg overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center text-brown-400">
            <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>ไม่พบสมาชิก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase">เบอร์โทร</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-300 uppercase">เครดิต</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-300 uppercase">ฝากรวม</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-300 uppercase">ถอนรวม</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase">วันที่สมัคร</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brown-200">{member.phone}</div>
                      {member.lineId && (
                        <div className="text-xs text-brown-400">Line: {member.lineId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-brown-200">{member.fullname || '-'}</div>
                      {member.bankAccount && (
                        <div className="text-xs text-brown-400">
                          {member.bankName} - {member.bankAccount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-gold-500">
                        {formatCurrency(member.credit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-success">
                        {formatCurrency(member.totalDeposit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-error">
                        {formatCurrency(member.totalWithdrawal)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-brown-300">
                        {dayjs(member.createdAt).format('DD/MM/YYYY')}
                      </div>
                      <div className="text-xs text-brown-400">
                        {dayjs(member.createdAt).format('HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/members/${member.id}`)}
                          className="p-2 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-all"
                          title="ดูรายละเอียด"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        {member.status === 'banned' ? (
                          <button
                            className="p-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all"
                            title="ปลดแบน"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            className="p-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all"
                            title="แบนสมาชิก"
                          >
                            <FiSlash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="px-6 py-4 border-t border-admin-border flex items-center justify-between">
            <div className="text-sm text-brown-400">
              แสดง {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} จากทั้งหมด {total} รายการ
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <div className="px-4 py-2 bg-gold-500 text-white rounded-lg">
                {page}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
