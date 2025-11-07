import { useState, useEffect } from 'react'
import { FiRefreshCw, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi'
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ลูกค้าสมัครวันนี้</h1>
          <p className="text-sm text-gray-600 mt-1">
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setFilter('all')}
          className={`p-6 rounded-lg shadow cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
              : 'bg-white hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${filter === 'all' ? 'text-blue-100' : 'text-gray-600'}`}>
                สมัครทั้งหมด
              </p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <FiEye className={`w-8 h-8 ${filter === 'all' ? 'text-blue-100' : 'text-blue-600'}`} />
          </div>
        </div>

        <div
          onClick={() => setFilter('deposited')}
          className={`p-6 rounded-lg shadow cursor-pointer transition-all ${
            filter === 'deposited'
              ? 'bg-green-600 text-white ring-2 ring-green-400'
              : 'bg-white hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${filter === 'deposited' ? 'text-green-100' : 'text-gray-600'}`}>
                เติมเงินแล้ว
              </p>
              <p className="text-3xl font-bold mt-2">{stats.deposited}</p>
              <p className={`text-xs mt-1 ${filter === 'deposited' ? 'text-green-100' : 'text-gray-500'}`}>
                {stats.total > 0 ? `${((stats.deposited / stats.total) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <FiCheckCircle className={`w-8 h-8 ${filter === 'deposited' ? 'text-green-100' : 'text-green-600'}`} />
          </div>
        </div>

        <div
          onClick={() => setFilter('notDeposited')}
          className={`p-6 rounded-lg shadow cursor-pointer transition-all ${
            filter === 'notDeposited'
              ? 'bg-orange-600 text-white ring-2 ring-orange-400'
              : 'bg-white hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${filter === 'notDeposited' ? 'text-orange-100' : 'text-gray-600'}`}>
                ยังไม่เติมเงิน
              </p>
              <p className="text-3xl font-bold mt-2">{stats.notDeposited}</p>
              <p className={`text-xs mt-1 ${filter === 'notDeposited' ? 'text-orange-100' : 'text-gray-500'}`}>
                {stats.total > 0 ? `${((stats.notDeposited / stats.total) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <FiClock className={`w-8 h-8 ${filter === 'notDeposited' ? 'text-orange-100' : 'text-orange-600'}`} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เวลาสมัคร
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เบอร์โทร
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เครดิต
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดฝากทั้งหมด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะเติมเงิน
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>กำลังโหลด...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {filter === 'all' ? 'ยังไม่มีลูกค้าสมัครวันนี้' : 'ไม่พบข้อมูล'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.fullname || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{formatCurrency(member.credit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{formatCurrency(member.totalDeposits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.totalDeposits > 0 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <FiCheckCircle className="w-3 h-3" />
                          เติมเงินแล้ว
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
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
