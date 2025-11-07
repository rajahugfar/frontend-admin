import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, LotteryBet, LotteryPeriod } from '../../api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiDownload, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPercent } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'

const LotteryBets: React.FC = () => {
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
      const data = await adminLotteryAPI.getPeriods({ limit: 100, offset: 0 })
      setPeriods(data.periods)
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

      const data = await adminLotteryAPI.getPeriodBets(filterPeriod, params)
      setBets(data.bets)
      setTotal(data.total)

      // Calculate statistics
      calculateStats(data.bets)
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
      '3top': 'bg-blue-100 text-blue-700',
      '3tod': 'bg-purple-100 text-purple-700',
      '3bottom': 'bg-indigo-100 text-indigo-700',
      '2top': 'bg-green-100 text-green-700',
      '2bottom': 'bg-teal-100 text-teal-700',
      'run_top': 'bg-orange-100 text-orange-700',
      'run_bottom': 'bg-yellow-100 text-yellow-700',
      '4d': 'bg-pink-100 text-pink-700',
    }
    return badges[betType] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadge = (status: string): string => {
    const badges: { [key: string]: string } = {
      PENDING: 'bg-gray-100 text-gray-700',
      WIN: 'bg-green-100 text-green-700',
      LOSE: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-orange-100 text-orange-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredBets = bets.filter((bet) => {
    if (searchMember && bet.member_username) {
      return bet.member_username.toLowerCase().includes(searchMember.toLowerCase())
    }
    return true
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">รายการเดิมพัน</h1>
          <p className="text-gray-600">ดูรายการเดิมพันทั้งหมด</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          disabled={bets.length === 0}
        >
          <FiDownload />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      {filterPeriod !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">จำนวนโพย</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_bets}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiDollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดเดิมพัน</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_bet_amount.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiTrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดจ่ายรางวัล</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.total_payout.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FiTrendingDown className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กำไรสุทธิ</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stats.net_profit.toLocaleString('th-TH')}
                </p>
              </div>
              <div
                className={`${
                  stats.net_profit >= 0 ? 'bg-green-100' : 'bg-red-100'
                } p-3 rounded-full`}
              >
                <FiDollarSign
                  className={stats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เปอร์เซ็นต์ถูก</p>
                <p className="text-2xl font-bold text-purple-600">{stats.win_rate.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiPercent className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <select
            value={filterPeriod}
            onChange={(e) => {
              setFilterPeriod(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          <select
            value={filterBetType}
            onChange={(e) => {
              setFilterBetType(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="PENDING">รอผล</option>
            <option value="WIN">ถูกรางวัล</option>
            <option value="LOSE">ไม่ถูก</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : filterPeriod === 'all' ? (
          <div className="p-8 text-center text-gray-500">กรุณาเลือกงวดที่ต้องการดู</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สมาชิก</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หวย</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">งวดที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">เลข</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดเดิมพัน</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">อัตราจ่าย</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดถูกรางวัล</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bet.member_username || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bet.lottery_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bet.period_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getBetTypeBadge(bet.bet_type)}`}>
                        {getBetTypeLabel(bet.bet_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">
                      {bet.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600">
                      {bet.amount.toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {bet.payout_rate}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(bet.status)}`}>
                        {getStatusLabel(bet.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {bet.status === 'WIN' ? (
                        <span className="font-bold text-green-600">
                          {(bet.win_amount || 0).toLocaleString('th-TH')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredBets.length === 0 && filterPeriod !== 'all' && (
          <div className="p-8 text-center text-gray-500">ไม่พบข้อมูลโพย</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            หน้า {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  )
}

export default LotteryBets
