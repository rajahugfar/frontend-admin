import { useEffect, useState } from 'react'
import { FiDollarSign, FiCalendar } from 'react-icons/fi'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

interface Redemption {
  id: string
  memberId: string
  memberPhone: string
  memberName: string | null
  turnoverAmount: number
  cashReceived: number
  exchangeRate: number
  status: string
  createdAt: string
}

export default function TurnoverRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState({
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  })

  useEffect(() => {
    fetchRedemptions()
  }, [dateFilter])

  const fetchRedemptions = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        type: 'REDEEM',
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      })

      const response = await fetch(`/api/v1/admin/turnover/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_selector')}`,
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success && data.data) {
        setRedemptions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch redemptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const totalRedeemed = redemptions.reduce((sum, r) => sum + r.turnoverAmount, 0)
  const totalCash = redemptions.reduce((sum, r) => sum + r.cashReceived, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brown-100 mb-2">ประวัติการแลกเทิร์น</h1>
        <p className="text-brown-400">รายการแลกเทิร์นเป็นเงินสดทั้งหมด</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brown-400 text-sm font-medium">จำนวนการแลก</h3>
            <FiDollarSign className="w-5 h-5 text-gold-500" />
          </div>
          <p className="text-2xl font-bold text-brown-100">{redemptions.length}</p>
          <p className="text-xs text-brown-500 mt-1">ครั้ง</p>
        </div>

        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brown-400 text-sm font-medium">เทิร์นรวมที่แลก</h3>
            <FiDollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-brown-100">{formatNumber(totalRedeemed)}</p>
          <p className="text-xs text-brown-500 mt-1">THB</p>
        </div>

        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brown-400 text-sm font-medium">เงินสดที่จ่ายออก</h3>
            <FiDollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-brown-100">{formatNumber(totalCash)}</p>
          <p className="text-xs text-brown-500 mt-1">THB</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <FiCalendar className="text-brown-400" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
            />
            <span className="text-brown-400">ถึง</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Redemptions Table */}
      <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brown-400">ไม่พบรายการแลกเทิร์น</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-admin-hover border-b border-admin-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                    วันที่-เวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-400 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase tracking-wider">
                    เทิร์นที่แลก
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brown-400 uppercase tracking-wider">
                    เงินที่ได้รับ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase tracking-wider">
                    อัตราแลก (%)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-400 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {redemptions.map((redemption) => (
                  <tr key={redemption.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-brown-100">{dayjs(redemption.createdAt).format('DD/MM/YYYY')}</div>
                      <div className="text-brown-400 text-sm">{dayjs(redemption.createdAt).format('HH:mm:ss')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-brown-300">{redemption.memberName || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-brown-100 font-medium">{redemption.memberPhone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-blue-500 font-semibold">{formatNumber(redemption.turnoverAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-green-500 font-semibold">{formatNumber(redemption.cashReceived)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-brown-300">{(redemption.exchangeRate * 100).toFixed(2)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">สำเร็จ</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
