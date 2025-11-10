import { useState, useEffect } from 'react'
import { FiRefreshCw, FiCheckCircle, FiClock, FiEye, FiUsers } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
  credit: number
  totalDeposits: number
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
}

interface MembersResponse {
  members: Member[]
  total: number
}

export default function TodayCustomers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'deposited' | 'notDeposited'>('all')

  useEffect(() => {
    fetchTodayMembers()
  }, [])

  const fetchTodayMembers = async () => {
    try {
      setLoading(true)

      // Get today's date in YYYY-MM-DD format
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]

      const response: MembersResponse = await adminMemberAPI.listMembers({
        startDate: dateStr,
        endDate: dateStr,
        page: 1,
        pageSize: 100,
      })

      setMembers(response.members || [])
    } catch (error: any) {
      console.error('Failed to fetch today\'s members:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
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

  const filteredMembers = members.filter((member) => {
    if (filter === 'deposited') return member.totalDeposits > 0
    if (filter === 'notDeposited') return member.totalDeposits === 0
    return true
  })

  const stats = {
    total: members.length,
    deposited: members.filter((m) => m.totalDeposits > 0).length,
    notDeposited: members.filter((m) => m.totalDeposits === 0).length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 flex items-center gap-2">
            <FiUsers />
            ลูกค้าสมัครวันนี้
          </h1>
          <p className="text-brown-400 mt-1">
            {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={fetchTodayMembers}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setFilter('all')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-br from-primary/20 to-primary/30 border-2 border-primary'
              : 'bg-admin-card border border-admin-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${filter === 'all' ? 'text-primary' : 'text-brown-400'}`}>
                สมัครทั้งหมด
              </p>
              <p className={`text-3xl font-bold mt-2 ${filter === 'all' ? 'text-primary' : 'text-brown-200'}`}>{stats.total}</p>
            </div>
            <FiEye className={`w-8 h-8 ${filter === 'all' ? 'text-primary' : 'text-brown-400'}`} />
          </div>
        </div>

        <div
          onClick={() => setFilter('deposited')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all ${
            filter === 'deposited'
              ? 'bg-gradient-to-br from-success/20 to-success/30 border-2 border-success'
              : 'bg-admin-card border border-admin-border hover:border-success/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${filter === 'deposited' ? 'text-success' : 'text-brown-400'}`}>
                เติมเงินแล้ว
              </p>
              <p className={`text-3xl font-bold mt-2 ${filter === 'deposited' ? 'text-success' : 'text-brown-200'}`}>{stats.deposited}</p>
              <p className={`text-xs mt-1 ${filter === 'deposited' ? 'text-success/80' : 'text-brown-400'}`}>
                {stats.total > 0 ? `${((stats.deposited / stats.total) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <FiCheckCircle className={`w-8 h-8 ${filter === 'deposited' ? 'text-success' : 'text-brown-400'}`} />
          </div>
        </div>

        <div
          onClick={() => setFilter('notDeposited')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all ${
            filter === 'notDeposited'
              ? 'bg-gradient-to-br from-warning/20 to-warning/30 border-2 border-warning'
              : 'bg-admin-card border border-admin-border hover:border-warning/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${filter === 'notDeposited' ? 'text-warning' : 'text-brown-400'}`}>
                ยังไม่เติมเงิน
              </p>
              <p className={`text-3xl font-bold mt-2 ${filter === 'notDeposited' ? 'text-warning' : 'text-brown-200'}`}>{stats.notDeposited}</p>
              <p className={`text-xs mt-1 ${filter === 'notDeposited' ? 'text-warning/80' : 'text-brown-400'}`}>
                {stats.total > 0 ? `${((stats.notDeposited / stats.total) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <FiClock className={`w-8 h-8 ${filter === 'notDeposited' ? 'text-warning' : 'text-brown-400'}`} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-admin-border">
            <thead className="bg-admin-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                  เวลาสมัคร
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                  เบอร์โทร
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                  เครดิต
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                  ยอดฝากทั้งหมด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                  สถานะเติมเงิน
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner"></div>
                      <span className="text-brown-400">กำลังโหลด...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown-400">
                    {filter === 'all' ? 'ยังไม่มีลูกค้าสมัครวันนี้' : 'ไม่พบข้อมูล'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                      {formatTime(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brown-200">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                      {member.fullname || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gold-500 font-semibold">
                      ฿{formatCurrency(member.credit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gold-500 font-semibold">
                      ฿{formatCurrency(member.totalDeposits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.totalDeposits > 0 ? (
                        <span className="px-3 py-1 bg-success/20 text-success border border-success/30 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <FiCheckCircle className="w-3 h-3" />
                          เติมเงินแล้ว
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-warning/20 text-warning border border-warning/30 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <FiClock className="w-3 h-3" />
                          ยังไม่เติมเงิน
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
