import { useEffect, useState } from 'react'
import { FiUsers, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiX } from 'react-icons/fi'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import 'dayjs/locale/th'

dayjs.locale('th')

interface ReferralStats {
  totalReferrers: number
  totalReferrals: number
  totalCommissionPaid: number
  pendingCommission: number
  todayCommission: number
  thisMonthCommission: number
}

interface ReferralUser {
  id: number
  username: string
  phone: string
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  totalCommission: number
  pendingCommission: number
  withdrawnCommission: number
  createdAt: string
}

interface CommissionWithdrawal {
  id: number
  userId: number
  username: string
  phone: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  processedAt?: string
  processedBy?: string
  note?: string
}

export default function ReferralManagement() {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrers: 0,
    totalReferrals: 0,
    totalCommissionPaid: 0,
    pendingCommission: 0,
    todayCommission: 0,
    thisMonthCommission: 0
  })
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([])
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawal[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'withdrawals'>('users')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CommissionWithdrawal | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalNote, setApprovalNote] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch real data from API
      const [statsData, usersData, withdrawalsData] = await Promise.all([
        fetch('/api/v1/admin/referral/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`,
          },
          credentials: 'include'
        }).then(res => res.json()).catch(() => ({ data: null })),
        
        fetch('/api/v1/admin/referral/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`,
          },
          credentials: 'include'
        }).then(res => res.json()).catch(() => ({ data: [] })),
        
        fetch('/api/v1/admin/referral/withdrawals/pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`,
          },
          credentials: 'include'
        }).then(res => res.json()).catch(() => ({ data: [] }))
      ])

      // Set stats or use defaults
      if (statsData.data) {
        setStats(statsData.data)
      } else {
        setStats({
          totalReferrers: 0,
          totalReferrals: 0,
          totalCommissionPaid: 0,
          pendingCommission: 0,
          todayCommission: 0,
          thisMonthCommission: 0
        })
      }

      // Set users
      setReferralUsers(usersData.data || [])
      
      // Set withdrawals
      setWithdrawals(withdrawalsData.data || [])
      
    } catch (error: any) {
      console.error('Failed to fetch referral data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveWithdrawal = async (withdrawal: CommissionWithdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowApprovalModal(true)
  }

  const handleRejectWithdrawal = async (withdrawal: CommissionWithdrawal) => {
    const reason = prompt(`ยืนยันการปฏิเสธคำขอถอนคอมมิชชั่น ฿${withdrawal.amount.toLocaleString()} ของ ${withdrawal.username}\n\nกรุณาระบุเหตุผล:`)
    
    if (!reason) {
      return
    }

    try {
      const response = await fetch(`/api/v1/admin/referral/withdrawals/${withdrawal.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        throw new Error('Failed to reject withdrawal')
      }

      toast.success('ปฏิเสธคำขอถอนเรียบร้อย')
      fetchData()
    } catch (error) {
      console.error('Failed to reject withdrawal:', error)
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธ')
    }
  }

  const confirmApproval = async () => {
    if (!selectedWithdrawal) return

    try {
      const response = await fetch(`/api/v1/admin/referral/withdrawals/${selectedWithdrawal.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          note: approvalNote || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve withdrawal')
      }

      toast.success(`อนุมัติคำขอถอนเรียบร้อย ฿${selectedWithdrawal.amount.toLocaleString()}`)
      setShowApprovalModal(false)
      setSelectedWithdrawal(null)
      setApprovalNote('')
      fetchData()
    } catch (error) {
      console.error('Failed to approve withdrawal:', error)
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ')
    }
  }

  const StatCard = ({ icon: Icon, label, value, color, subValue }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการระบบแนะนำเพื่อน</h1>
          <p className="text-gray-600 mt-1">ระบบคอมมิชชั่นและการถอนเงิน</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={FiUsers}
          label="ผู้แนะนำทั้งหมด"
          value={stats.totalReferrers}
          color="text-blue-600"
          subValue={`รวมผู้ถูกแนะนำ ${stats.totalReferrals} คน`}
        />
        <StatCard
          icon={FiDollarSign}
          label="คอมมิชชั่นจ่ายแล้ว"
          value={`฿${stats.totalCommissionPaid.toLocaleString()}`}
          color="text-green-600"
          subValue={`เดือนนี้ ฿${stats.thisMonthCommission.toLocaleString()}`}
        />
        <StatCard
          icon={FiClock}
          label="คอมมิชชั่นรอจ่าย"
          value={`฿${stats.pendingCommission.toLocaleString()}`}
          color="text-orange-600"
          subValue={`วันนี้ ฿${stats.todayCommission.toLocaleString()}`}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              รายชื่อผู้แนะนำ
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'withdrawals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              คำขอถอนคอมมิชชั่น
              {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' ? (
            /* Users List */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ใช้</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสแนะนำ</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จำนวนผู้แนะนำ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">คอมมิชชั่นทั้งหมด</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">รอจ่าย</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จ่ายแล้ว</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded">
                          {user.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{user.totalReferrals} คน</div>
                        <div className="text-xs text-gray-500">ใช้งาน {user.activeReferrals} คน</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">
                          ฿{user.totalCommission.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-orange-600">
                          ฿{user.pendingCommission.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-green-600">
                          ฿{user.withdrawnCommission.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {dayjs(user.createdAt).format('DD/MM/YYYY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Withdrawals List */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ใช้</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวนเงิน</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">วันที่ขอ</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{withdrawal.username}</div>
                          <div className="text-sm text-gray-500">{withdrawal.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          ฿{withdrawal.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {withdrawal.status === 'pending' && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            รอดำเนินการ
                          </span>
                        )}
                        {withdrawal.status === 'approved' && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            อนุมัติแล้ว
                          </span>
                        )}
                        {withdrawal.status === 'rejected' && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            ปฏิเสธ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {dayjs(withdrawal.requestedAt).format('DD/MM/YYYY HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {withdrawal.status === 'pending' && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleApproveWithdrawal(withdrawal)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <FiCheckCircle className="mr-1" />
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(withdrawal)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiX className="mr-1" />
                              ปฏิเสธ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ยืนยันการอนุมัติ</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">ผู้ใช้:</span>
                <span className="font-medium">{selectedWithdrawal.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เบอร์โทร:</span>
                <span className="font-medium">{selectedWithdrawal.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวนเงิน:</span>
                <span className="font-bold text-green-600">฿{selectedWithdrawal.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ (ถ้ามี)
              </label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="เพิ่มหมายเหตุ..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setSelectedWithdrawal(null)
                  setApprovalNote('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ยืนยันอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
