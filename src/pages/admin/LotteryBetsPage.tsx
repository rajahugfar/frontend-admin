import React, { useState, useEffect } from 'react'
import { adminLotteryAPI } from '@/api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiDownload, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPercent } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'

interface LotteryBet {
  id: string
  member_username: string
  lottery_name: string
  period_name: string
  period_date: string
  bet_type: string
  number: string
  amount: number
  payout_rate: number
  status: string
  win_amount: number | null
}

interface LotteryPeriod {
  id: string
  lottery_name: string
  period_name: string
  draw_date: string
  status: string
}

const LotteryBetsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [bets, setBets] = useState<LotteryBet[]>([])
  const [periods, setPeriods] = useState<LotteryPeriod[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [filterPeriod, setFilterPeriod] = useState<string>(searchParams.get('period_id') || 'all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterBetType, setFilterBetType] = useState<string>('all')
  const [searchMember, setSearchMember] = useState('')

  // Statistics
  const [stats, setStats] = useState({
    total_bets: 0,
    total_bet_amount: 0,
    total_payout: 0,
    net_profit: 0,
    win_rate: 0,
  })

  useEffect(() => {
    fetchPeriods()
  }, [])

  useEffect(() => {
    fetchBets()
  }, [page, filterPeriod, filterStatus, filterBetType])

  const fetchPeriods = async () => {
    try {
      const response = await adminLotteryAPI.getPeriods({ limit: 100, offset: 0 })
      if (response.data) {
        setPeriods(response.data.periods || [])
      }
    } catch (error) {
      console.error('Failed to fetch periods:', error)
    }
  }

  const fetchBets = async () => {
    if (filterPeriod === 'all') {
      setBets([])
      return
    }

    setLoading(true)
    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterBetType !== 'all') params.bet_type = filterBetType

      const response = await adminLotteryAPI.getPeriodBets(filterPeriod, params)
      if (response.data) {
        setBets(response.data.bets || [])
        setTotal(response.data.total || 0)
        calculateStats(response.data.bets || [])
      }
    } catch (error) {
      console.error('Failed to fetch bets:', error)
      toast.error('ไม่สามารถโหลดข้อมูลโพยได้')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (betsList: LotteryBet[]) => {
    const totalBets = betsList.length
    const totalBetAmount = betsList.reduce((sum, bet) => sum + bet.amount, 0)
    const totalPayout = betsList.reduce((sum, bet) => sum + (bet.win_amount || 0), 0)
    const netProfit = totalBetAmount - totalPayout
    const winCount = betsList.filter((bet) => bet.status === 'WIN').length
    const winRate = totalBets > 0 ? (winCount / totalBets) * 100 : 0

    setStats({
      total_bets: totalBets,
      total_bet_amount: totalBetAmount,
      total_payout: totalPayout,
      net_profit: netProfit,
      win_rate: winRate,
    })
  }

  const handleExportCSV = () => {
    if (bets.length === 0) {
      toast.error('ไม่มีข้อมูลให้ Export')
      return
    }

    const headers = [
      'สมาชิก',
      'หวย',
      'งวดที่',
      'วันที่',
      'ประเภท',
      'เลข',
      'ยอดเดิมพัน',
      'อัตราจ่าย',
      'สถานะ',
      'ยอดถูกรางวัล',
    ]

    const rows = bets.map((bet) => [
      bet.member_username || '-',
      bet.lottery_name || '-',
      bet.period_name || '-',
      bet.period_date || '-',
      getBetTypeLabel(bet.bet_type),
      bet.number,
      bet.amount,
      bet.payout_rate,
      getStatusLabel(bet.status),
      bet.win_amount || 0,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `lottery_bets_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('ส่งออกข้อมูลสำเร็จ')
  }

  const getBetTypeLabel = (betType: string): string => {
    const labels: { [key: string]: string } = {
      '3top': '3ตัวบน',
      '3tod': '3ตัวโต๊ด',
      '3bottom': '3ตัวล่าง',
      '2top': '2ตัวบน',
      '2bottom': '2ตัวล่าง',
      'run_top': 'วิ่งบน',
      'run_bottom': 'วิ่งล่าง',
      '4d': '4ตัว',
    }
    return labels[betType] || betType
  }

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      PENDING: 'รอผล',
      WIN: 'ถูกรางวัล',
      LOSE: 'ไม่ถูก',
      CANCELLED: 'ยกเลิก',
    }
    return labels[status] || status
  }

  const getBetTypeBadge = (betType: string): string => {
    const badges: { [key: string]: string } = {
      '3top': 'bg-info/20 text-info border border-info/30',
      '3tod': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      '3bottom': 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      '2top': 'bg-success/20 text-success border border-success/30',
      '2bottom': 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
      'run_top': 'bg-warning/20 text-warning border border-warning/30',
      'run_bottom': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      '4d': 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    }
    return badges[betType] || 'bg-admin-hover text-brown-300 border border-admin-border'
  }

  const getStatusBadge = (status: string): string => {
    const badges: { [key: string]: string } = {
      PENDING: 'bg-admin-hover text-brown-300 border border-admin-border',
      WIN: 'bg-success/20 text-success border border-success/30',
      LOSE: 'bg-error/20 text-error border border-error/30',
      CANCELLED: 'bg-warning/20 text-warning border border-warning/30',
    }
    return badges[status] || 'bg-admin-hover text-brown-300 border border-admin-border'
  }

  const filteredBets = bets.filter((bet) => {
    if (searchMember && bet.member_username) {
      return bet.member_username.toLowerCase().includes(searchMember.toLowerCase())
    }
    return true
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-500/10 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-gold-500" />
            </div>
            รายการเดิมพันหวย
          </h1>
          <p className="text-brown-300 text-sm ml-13">ดูรายการเดิมพันหวยทั้งหมด</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
          disabled={bets.length === 0}
        >
          <FiDownload />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      {filterPeriod !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brown-400 text-sm">จำนวนโพย</p>
                <p className="text-2xl font-bold text-brown-100">{stats.total_bets}</p>
              </div>
              <div className="bg-info/20 p-3 rounded-full">
                <FiDollarSign className="text-info" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brown-400 text-sm">ยอดเดิมพัน</p>
                <p className="text-2xl font-bold text-info">
                  {stats.total_bet_amount.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="bg-info/20 p-3 rounded-full">
                <FiTrendingUp className="text-info" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brown-400 text-sm">ยอดจ่ายรางวัล</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.total_payout.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="bg-warning/20 p-3 rounded-full">
                <FiTrendingDown className="text-warning" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brown-400 text-sm">กำไรสุทธิ</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.net_profit >= 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {stats.net_profit.toLocaleString('th-TH')}
                </p>
              </div>
              <div
                className={`${
                  stats.net_profit >= 0 ? 'bg-success/20' : 'bg-error/20'
                } p-3 rounded-full`}
              >
                <FiDollarSign
                  className={stats.net_profit >= 0 ? 'text-success' : 'text-error'}
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brown-400 text-sm">เปอร์เซ็นต์ถูก</p>
                <p className="text-2xl font-bold text-purple-400">{stats.win_rate.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <FiPercent className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-admin-card border border-admin-border rounded-xl shadow-lg p-6">
        <div>
          <label className="block text-sm font-medium text-brown-200 mb-1">เลือกงวด</label>
          <select
            value={filterPeriod}
            onChange={(e) => {
              setFilterPeriod(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="all">เลือกงวด</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.lottery_name} - {period.period_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-brown-200 mb-1">ประเภท</label>
          <select
            value={filterBetType}
            onChange={(e) => {
              setFilterBetType(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="all">ประเภททั้งหมด</option>
            <option value="3top">3ตัวบน</option>
            <option value="3tod">3ตัวโต๊ด</option>
            <option value="3bottom">3ตัวล่าง</option>
            <option value="2top">2ตัวบน</option>
            <option value="2bottom">2ตัวล่าง</option>
            <option value="run_top">วิ่งบน</option>
            <option value="run_bottom">วิ่งล่าง</option>
            <option value="4d">4ตัว</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-brown-200 mb-1">สถานะ</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="PENDING">รอผล</option>
            <option value="WIN">ถูกรางวัล</option>
            <option value="LOSE">ไม่ถูก</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-brown-200 mb-1">ค้นหาสมาชิก</label>
          <input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>

      {/* Bets Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-brown-400">กำลังโหลด...</p>
          </div>
        ) : filterPeriod === 'all' ? (
          <div className="p-8 text-center text-brown-400">กรุณาเลือกงวดที่ต้องการดู</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-gradient-to-r from-admin-bg to-admin-bg/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase">สมาชิก</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase">หวย</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase">งวดที่</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase">ประเภท</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase">เลข</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase">ยอดเดิมพัน</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase">อัตราจ่าย</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-200 uppercase">สถานะ</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-200 uppercase">ยอดถูกรางวัล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-admin-hover/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brown-100">
                      {bet.member_username || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                      {bet.lottery_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                      {bet.period_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${getBetTypeBadge(bet.bet_type)}`}>
                        {getBetTypeLabel(bet.bet_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gold-500">
                      {bet.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-info">
                      {bet.amount.toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-brown-300">
                      {bet.payout_rate}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${getStatusBadge(bet.status)}`}>
                        {getStatusLabel(bet.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {bet.status === 'WIN' ? (
                        <span className="font-bold text-success">
                          {(bet.win_amount || 0).toLocaleString('th-TH')}
                        </span>
                      ) : (
                        <span className="text-brown-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredBets.length === 0 && filterPeriod !== 'all' && (
          <div className="p-8 text-center text-brown-400">ไม่พบข้อมูลโพย</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 hover:bg-admin-hover disabled:opacity-50 transition-all"
          >
            ก่อนหน้า
          </button>
          <div className="px-4 py-2 bg-admin-hover rounded-lg text-brown-200">
            หน้า {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 hover:bg-admin-hover disabled:opacity-50 transition-all"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  )
}

export default LotteryBetsPage
