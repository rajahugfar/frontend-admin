import { useEffect, useState } from 'react'
import { FiSearch, FiEdit2, FiEye } from 'react-icons/fi'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import AdjustTurnoverModal from '@components/admin/modals/AdjustTurnoverModal'
import 'dayjs/locale/th'

dayjs.locale('th')

interface MemberTurnover {
  memberId: string
  phone: string
  fullname: string | null
  turnoverBalance: number
  turnoverLifetime: number
  turnoverRedeemed: number
  turnoverLastRedeemAt: string | null
  turnoverUpdatedAt: string
}

export default function TurnoverMembers() {
  const [members, setMembers] = useState<MemberTurnover[]>([])
  const [filteredMembers, setFilteredMembers] = useState<MemberTurnover[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<MemberTurnover | null>(null)
  const [showAdjustModal, setShowAdjustModal] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = members.filter(
        (m) =>
          m.phone.includes(searchTerm) ||
          (m.fullname && m.fullname.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMembers(filtered)
    } else {
      setFilteredMembers(members)
    }
  }, [searchTerm, members])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      // Use backend API directly to avoid nginx routing issues
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/admin/members?limit=1000`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
      })

      const result = await response.json()

      if (result.status === 'success' && result.data && result.data.members) {
        // Transform admin members API to turnover format
        const transformedMembers = result.data.members.map((m: any) => ({
          memberId: m.id,
          phone: m.phone,
          fullname: m.fullname,
          turnoverBalance: m.turnoverBalance || 0,
          turnoverLifetime: m.turnoverLifetime || 0,
          turnoverRedeemed: m.turnoverRedeemedLifetime || 0,
          turnoverLastRedeemAt: m.turnoverLastRedeemAt || null,
          turnoverUpdatedAt: m.turnoverUpdatedAt || m.updatedAt || m.createdAt,
        }))
        setMembers(transformedMembers)
        setFilteredMembers(transformedMembers)
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
      toast.error('ไม่สามารถโหลดข้อมูลสมาชิกได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustClick = (member: MemberTurnover) => {
    setSelectedMember(member)
    setShowAdjustModal(true)
  }

  const handleAdjustSuccess = () => {
    setShowAdjustModal(false)
    fetchMembers()
    toast.success('ปรับยอดเทิร์นสำเร็จ')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brown-100 mb-2">สมาชิกและเทิร์นโอเวอร์</h1>
          <p className="text-brown-400">จัดการยอดเทิร์นสมาชิกทั้งหมด</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="ค้นหาเบอร์โทร หรือ ชื่อสมาชิก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brown-400">ไม่พบข้อมูลสมาชิก</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-admin-hover border-b border-admin-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase tracking-wider">
                    เทิร์นคงเหลือ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase tracking-wider">
                    เทิร์นสะสม
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase tracking-wider">
                    แลกสะสม (THB)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase tracking-wider">
                    แลกล่าสุด
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredMembers.map((member) => (
                  <tr key={member.memberId} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-brown-100 font-medium">{member.phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-brown-300">{member.fullname || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-gold-500 font-semibold">{formatNumber(member.turnoverBalance)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-brown-300">{formatNumber(member.turnoverLifetime)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-green-500">{formatNumber(member.turnoverRedeemed)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-brown-400 text-sm">
                        {member.turnoverLastRedeemAt
                          ? dayjs(member.turnoverLastRedeemAt).format('DD/MM/YYYY')
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAdjustClick(member)}
                          className="p-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-500 rounded-lg transition-all"
                          title="ปรับยอดเทิร์น"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`/admin/members/${member.memberId}`}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-all"
                          title="ดูรายละเอียด"
                        >
                          <FiEye className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Adjust Turnover Modal */}
      {showAdjustModal && selectedMember && (
        <AdjustTurnoverModal
          member={selectedMember}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={handleAdjustSuccess}
        />
      )}
    </div>
  )
}
