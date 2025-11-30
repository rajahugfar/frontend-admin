import { useEffect, useState } from 'react'
import { FiUsers, FiDollarSign, FiTrendingUp, FiRepeat, FiAward, FiSettings } from 'react-icons/fi'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

interface TurnoverStats {
  member_count: number
  lottery_count: number
  lottery_total: number
  game_count: number
  game_total: number
  redeem_count: number
  redeem_total: number
}

interface Period {
  startDate: string
  endDate: string
}

export default function TurnoverOverview() {
  const [stats, setStats] = useState<TurnoverStats>({
    member_count: 0,
    lottery_count: 0,
    lottery_total: 0,
    game_count: 0,
    game_total: 0,
    redeem_count: 0,
    redeem_total: 0,
  })
  const [period, setPeriod] = useState<Period>({
    startDate: '',
    endDate: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/admin/turnover/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success && data.data) {
        setStats(data.data)
        if (data.period) {
          setPeriod(data.period)
        }
      }
    } catch (error) {
      console.error('Failed to fetch turnover stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const totalTurnover = stats.lottery_total + stats.game_total
  const totalTransactions = stats.lottery_count + stats.game_count

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brown-100 mb-2">ภาพรวมระบบเทิร์นโอเวอร์</h1>
        <p className="text-brown-400">
          ช่วงเวลา: {period.startDate && dayjs(period.startDate).format('DD/MM/YYYY')} -
          {period.endDate && dayjs(period.endDate).format('DD/MM/YYYY')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Members with Turnover */}
            <div className="bg-admin-card border border-admin-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-brown-400 text-sm font-medium">สมาชิกที่มีเทิร์น</h3>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FiUsers className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-brown-100">{formatNumber(stats.member_count)}</p>
              <p className="text-xs text-brown-500 mt-1">คน</p>
            </div>

            {/* Total Turnover */}
            <div className="bg-admin-card border border-admin-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-brown-400 text-sm font-medium">เทิร์นรวมทั้งหมด</h3>
                <div className="p-2 bg-gold-500/10 rounded-lg">
                  <FiRepeat className="w-5 h-5 text-gold-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-brown-100">{formatNumber(totalTurnover)}</p>
              <p className="text-xs text-brown-500 mt-1">{formatNumber(totalTransactions)} ธุรกรรม</p>
            </div>

            {/* Total Redeemed */}
            <div className="bg-admin-card border border-admin-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-brown-400 text-sm font-medium">ยอดแลกรวม</h3>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-brown-100">{formatNumber(stats.redeem_total)}</p>
              <p className="text-xs text-brown-500 mt-1">{formatNumber(stats.redeem_count)} ครั้ง</p>
            </div>

            {/* Turnover Efficiency */}
            <div className="bg-admin-card border border-admin-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-brown-400 text-sm font-medium">อัตราการแลก</h3>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FiTrendingUp className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-brown-100">
                {totalTurnover > 0 ? ((stats.redeem_total / totalTurnover) * 100).toFixed(2) : '0.00'}%
              </p>
              <p className="text-xs text-brown-500 mt-1">
                {stats.redeem_total} / {formatNumber(totalTurnover)}
              </p>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Lottery Turnover */}
            <div className="bg-admin-card border border-admin-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brown-100 mb-4 flex items-center gap-2">
                <FiAward className="w-5 h-5 text-gold-500" />
                เทิร์นจากหวย
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-brown-400">จำนวนธุรกรรม</span>
                  <span className="text-brown-100 font-semibold">{formatNumber(stats.lottery_count)} ครั้ง</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-400">เทิร์นรวม</span>
                  <span className="text-gold-500 font-bold text-xl">{formatNumber(stats.lottery_total)} THB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-400">สัดส่วน</span>
                  <span className="text-brown-100">
                    {totalTurnover > 0 ? ((stats.lottery_total / totalTurnover) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Game Turnover */}
            <div className="bg-admin-card border border-admin-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brown-100 mb-4 flex items-center gap-2">
                <FiAward className="w-5 h-5 text-green-500" />
                เทิร์นจากเกมส์
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-brown-400">จำนวนธุรกรรม</span>
                  <span className="text-brown-100 font-semibold">{formatNumber(stats.game_count)} ครั้ง</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-400">เทิร์นรวม</span>
                  <span className="text-green-500 font-bold text-xl">{formatNumber(stats.game_total)} THB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-400">สัดส่วน</span>
                  <span className="text-brown-100">
                    {totalTurnover > 0 ? ((stats.game_total / totalTurnover) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-admin-card border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-brown-100 mb-4">ลิงก์ด่วน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/turnover/members"
                className="flex items-center gap-3 p-4 bg-admin-hover hover:bg-gold-500/10 rounded-lg transition-all border border-transparent hover:border-gold-500"
              >
                <FiUsers className="w-6 h-6 text-gold-500" />
                <div>
                  <p className="text-brown-100 font-medium">สมาชิกและเทิร์น</p>
                  <p className="text-brown-500 text-sm">จัดการยอดเทิร์นสมาชิก</p>
                </div>
              </a>

              <a
                href="/admin/turnover/redemptions"
                className="flex items-center gap-3 p-4 bg-admin-hover hover:bg-green-500/10 rounded-lg transition-all border border-transparent hover:border-green-500"
              >
                <FiDollarSign className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-brown-100 font-medium">ประวัติการแลก</p>
                  <p className="text-brown-500 text-sm">ดูรายการแลกเทิร์น</p>
                </div>
              </a>

              <a
                href="/admin/turnover/settings"
                className="flex items-center gap-3 p-4 bg-admin-hover hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500"
              >
                <FiSettings className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-brown-100 font-medium">ตั้งค่าระบบ</p>
                  <p className="text-brown-500 text-sm">จัดการการตั้งค่า</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
