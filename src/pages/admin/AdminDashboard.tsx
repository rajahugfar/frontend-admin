import { useEffect, useState } from 'react'
import { adminDashboardAPI } from '@/api/adminAPI'
import { DashboardStats, RecentTransaction } from '@/types/admin'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsData, transactionsData] = await Promise.all([
        adminDashboardAPI.getStats(period),
        adminDashboardAPI.getRecentTransactions(10),
      ])
      setStats(statsData)
      setRecentTransactions(transactionsData || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use empty data on error
      setStats({
        today: {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalMembers: 0,
          activeMembers: 0,
          pendingDeposits: 0,
          pendingWithdrawals: 0,
          profit: 0,
        },
        thisWeek: {
          totalDeposits: 0,
          totalWithdrawals: 0,
          newMembers: 0,
          profit: 0,
        },
        thisMonth: {
          totalDeposits: 0,
          totalWithdrawals: 0,
          newMembers: 0,
          profit: 0,
        },
      })
      setRecentTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-success bg-success/10'
      case 'pending':
        return 'text-warning bg-warning/10'
      case 'rejected':
      case 'cancelled':
        return 'text-error bg-error/10'
      default:
        return 'text-brown-400 bg-brown-400/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'สำเร็จ'
      case 'approved':
        return 'อนุมัติ'
      case 'pending':
        return 'รอดำเนินการ'
      case 'rejected':
        return 'ปฏิเสธ'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'ฝาก'
      case 'withdrawal':
        return 'ถอน'
      case 'credit_adjustment':
        return 'ปรับยอด'
      case 'game_transfer':
        return 'เกม'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-admin-bg">
        <div className="text-gold-500">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-admin-card to-brown-900 border-b border-admin-border shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gold-500 mb-2">
                แดชบอร์ด
              </h1>
              <p className="text-brown-300">
                ภาพรวมระบบ Permchok V2
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 bg-admin-bg rounded-lg p-1">
              <button
                onClick={() => setPeriod('today')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  period === 'today'
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'text-brown-300 hover:text-gold-500'
                }`}
              >
                วันนี้
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  period === 'week'
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'text-brown-300 hover:text-gold-500'
                }`}
              >
                สัปดาห์นี้
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  period === 'month'
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'text-brown-300 hover:text-gold-500'
                }`}
              >
                เดือนนี้
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deposits */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                <FiTrendingUp className="w-6 h-6 text-success" />
              </div>
              <span className="text-xs text-brown-400 font-medium">ยอดฝาก</span>
            </div>
            <div className="text-3xl font-bold text-gold-500 mb-1 drop-shadow-lg">
              {formatCurrency(stats?.today.totalDeposits || 0)}
            </div>
            <div className="text-sm text-brown-400">
              รายการรอดำเนินการ: <span className="text-warning font-semibold">{stats?.today.pendingDeposits || 0}</span>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-error/10 rounded-lg group-hover:bg-error/20 transition-colors">
                <FiTrendingDown className="w-6 h-6 text-error" />
              </div>
              <span className="text-xs text-brown-400 font-medium">ยอดถอน</span>
            </div>
            <div className="text-3xl font-bold text-gold-500 mb-1 drop-shadow-lg">
              {formatCurrency(stats?.today.totalWithdrawals || 0)}
            </div>
            <div className="text-sm text-brown-400">
              รายการรอดำเนินการ: <span className="text-warning font-semibold">{stats?.today.pendingWithdrawals || 0}</span>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/10 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-gold-500" />
              </div>
              <span className="text-xs text-brown-400">กำไร</span>
            </div>
            <div className="text-2xl font-bold text-gold-500 mb-1">
              {formatCurrency(stats?.today.profit || 0)}
            </div>
            <div className="text-sm text-brown-400">
              ฝาก - ถอน
            </div>
          </div>

          {/* Total Members */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info/10 rounded-lg">
                <FiUsers className="w-6 h-6 text-info" />
              </div>
              <span className="text-xs text-brown-400">สมาชิก</span>
            </div>
            <div className="text-2xl font-bold text-gold-500 mb-1">
              {stats?.today.totalMembers || 0}
            </div>
            <div className="text-sm text-brown-400">
              ออนไลน์: {stats?.today.activeMembers || 0}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/deposits/pending"
            className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-xl p-6 hover:border-success/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <FiCheckCircle className="w-8 h-8 text-success group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-success">
                {stats?.today.pendingDeposits || 0}
              </span>
            </div>
            <div className="text-brown-200 font-medium">รอตรวจสอบฝาก</div>
            <div className="text-sm text-brown-400 mt-1">คลิกเพื่อดำเนินการ →</div>
          </Link>

          <Link
            to="/admin/withdrawals/pending"
            className="bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 rounded-xl p-6 hover:border-warning/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <FiClock className="w-8 h-8 text-warning group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-warning">
                {stats?.today.pendingWithdrawals || 0}
              </span>
            </div>
            <div className="text-brown-200 font-medium">รอตรวจสอบถอน</div>
            <div className="text-sm text-brown-400 mt-1">คลิกเพื่อดำเนินการ →</div>
          </Link>

          <Link
            to="/admin/members"
            className="bg-gradient-to-br from-info/10 to-info/5 border border-info/20 rounded-xl p-6 hover:border-info/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <FiUsers className="w-8 h-8 text-info group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-info">
                {stats?.today.activeMembers || 0}
              </span>
            </div>
            <div className="text-brown-200 font-medium">สมาชิกออนไลน์</div>
            <div className="text-sm text-brown-400 mt-1">ดูรายละเอียด →</div>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-admin-border">
            <h2 className="text-xl font-display font-bold text-gold-500">
              รายการล่าสุด
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    เวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-300 uppercase tracking-wider">
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brown-400">
                      ไม่มีรายการ
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-admin-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                        {dayjs(transaction.createdAt).format('DD/MM/YY HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-brown-200">
                          {transaction.memberFullname || transaction.memberPhone}
                        </div>
                        <div className="text-xs text-brown-400">{transaction.memberPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-brown-300">
                          {getTypeText(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-medium ${
                          transaction.type === 'deposit' ? 'text-success' : 'text-error'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
