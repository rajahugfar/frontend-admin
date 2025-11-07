import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, Lottery } from '../../api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiFilter, FiCalendar, FiDollarSign, FiAward } from 'react-icons/fi'

interface StockMaster {
  id: number
  huayId: number
  huayName?: string
  stockName: string
  stockTime: string
  dateBuy: string
  dateClose: string
  status: number
  result3Top?: string
  result3Bottom?: string
  result2Top?: string
  result2Bottom?: string
  totalBet: number
  totalWin: number
  totalProfit: number
}

const StockMasterList: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number>(0)
  const [selectedLottery, setSelectedLottery] = useState<number>(0)
  const [currentStock, setCurrentStock] = useState<StockMaster | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLotteries()
  }, [])

  useEffect(() => {
    if (selectedLottery > 0) {
      fetchCurrentStock(selectedLottery)
    }
  }, [selectedLottery])

  const fetchLotteries = async () => {
    try {
      const data = await adminLotteryAPI.getAllLotteries()
      setLotteries(data.filter(l => l.status))

      // Auto select first lottery
      const activeLotteries = data.filter(l => l.status)
      if (activeLotteries.length > 0) {
        setSelectedLottery(activeLotteries[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      toast.error('ไม่สามารถโหลดรายการหวยได้')
    }
  }

  const fetchCurrentStock = async (huayId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/v1/admin/lottery/stock/current/${huayId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      const result = await response.json()

      if (result.status === 'success' && result.data) {
        setCurrentStock(result.data)
      } else {
        setCurrentStock(null)
      }
    } catch (error) {
      console.error('Failed to fetch current stock:', error)
      setCurrentStock(null)
    } finally {
      setLoading(false)
    }
  }

  const groupLotteries = (group: number) => {
    return lotteries.filter(l => group === 0 || l.huayGroup === group)
  }

  const filteredLotteries = groupLotteries(selectedGroup)

  const getGroupName = (group: number): string => {
    const groups: { [key: number]: string } = {
      1: 'หวยรัฐบาล',
      2: 'หวยต่างประเทศ',
      3: 'หวยหุ้น',
      4: 'ยี่กี'
    }
    return groups[group] || `กลุ่ม ${group}`
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge bg-secondary">ปิด</span>
      case 1:
        return <span className="badge bg-success">เปิดรับแทง</span>
      case 2:
        return <span className="badge bg-primary">ประมวลผลแล้ว</span>
      default:
        return <span className="badge bg-secondary">-</span>
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
  }

  // Count lotteries by group
  const groupCounts = {
    total: lotteries.length,
    active: lotteries.filter(l => l.status).length,
    group1: lotteries.filter(l => l.huayGroup === 1).length,
    group2: lotteries.filter(l => l.huayGroup === 2).length,
    group3: lotteries.filter(l => l.huayGroup === 3).length,
    group4: lotteries.filter(l => l.huayGroup === 4).length,
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">รายการหวยรายวัน</h1>
        <p className="text-gray-600">ดูข้อมูลงวดหวย และรายการแทง</p>
      </div>

      {/* สถิติ */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded">
              <FiAward className="text-blue-600 w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="text-gray-500 text-xs">หวยทั้งหมด</div>
              <div className="text-xl font-bold text-gray-800">{groupCounts.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded">
              <FiAward className="text-green-600 w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="text-gray-500 text-xs">เปิดใช้งาน</div>
              <div className="text-xl font-bold text-gray-800">{groupCounts.active}</div>
            </div>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50"
          onClick={() => setSelectedGroup(selectedGroup === 1 ? 0 : 1)}
        >
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded">
              <FiAward className="text-purple-600 w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="text-gray-500 text-xs">หวยรัฐบาล</div>
              <div className="text-xl font-bold text-gray-800">{groupCounts.group1}</div>
            </div>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50"
          onClick={() => setSelectedGroup(selectedGroup === 2 ? 0 : 2)}
        >
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded">
              <FiAward className="text-orange-600 w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="text-gray-500 text-xs">ต่างประเทศ</div>
              <div className="text-xl font-bold text-gray-800">{groupCounts.group2}</div>
            </div>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50"
          onClick={() => setSelectedGroup(selectedGroup === 3 ? 0 : 3)}
        >
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded">
              <FiAward className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="text-gray-500 text-xs">หวยหุ้น</div>
              <div className="text-xl font-bold text-gray-800">{groupCounts.group3}</div>
            </div>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50"
          onClick={() => setSelectedGroup(selectedGroup === 4 ? 0 : 4)}
        >
          <div className="flex items-center">
            <div className="bg-pink-100 p-3 rounded">
              <FiAward className="text-pink-600 w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="text-gray-500 text-xs">ยี่กี</div>
              <div className="text-xl font-bold text-gray-800">{groupCounts.group4}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiFilter /> กลุ่มหวย
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>-- ทุกกลุ่ม --</option>
              <option value={1}>หวยรัฐบาล</option>
              <option value={2}>หวยต่างประเทศ</option>
              <option value={3}>หวยหุ้น</option>
              <option value={4}>ยี่กี</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiAward /> เลือกหวย
            </label>
            <select
              value={selectedLottery}
              onChange={(e) => setSelectedLottery(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>-- เลือกหวย --</option>
              {filteredLotteries.map((lottery) => (
                <option key={lottery.id} value={lottery.id}>
                  {lottery.huayName} ({getGroupName(lottery.huayGroup)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current Stock Info */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : currentStock ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiCalendar />
              {currentStock.stockName}
            </h2>
            <div className="text-sm opacity-90 mt-1">
              {formatDate(currentStock.stockTime)}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-sm text-gray-600">วันที่เปิดรับแทง</div>
                <div className="text-lg font-semibold text-gray-900">{formatDate(currentStock.dateBuy)}</div>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <div className="text-sm text-gray-600">วันที่ปิดรับแทง</div>
                <div className="text-lg font-semibold text-gray-900">{formatDate(currentStock.dateClose)}</div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-600">สถานะ</div>
                <div className="text-lg font-semibold">{getStatusBadge(currentStock.status)}</div>
              </div>
            </div>

            {/* Results */}
            {currentStock.status === 2 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiAward className="text-yellow-600" />
                  ผลรางวัล
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {currentStock.result3Top && (
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">3 ตัวบน</div>
                      <div className="text-2xl font-bold text-blue-600">{currentStock.result3Top}</div>
                    </div>
                  )}
                  {currentStock.result3Bottom && (
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">3 ตัวล่าง</div>
                      <div className="text-2xl font-bold text-blue-600">{currentStock.result3Bottom}</div>
                    </div>
                  )}
                  {currentStock.result2Top && (
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">2 ตัวบน</div>
                      <div className="text-2xl font-bold text-green-600">{currentStock.result2Top}</div>
                    </div>
                  )}
                  {currentStock.result2Bottom && (
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">2 ตัวล่าง</div>
                      <div className="text-2xl font-bold text-green-600">{currentStock.result2Bottom}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">ยอดแทงรวม</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(currentStock.totalBet || 0)}
                    </div>
                  </div>
                  <FiDollarSign className="text-blue-400 w-10 h-10" />
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">ยอดถูกรวม</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(currentStock.totalWin || 0)}
                    </div>
                  </div>
                  <FiDollarSign className="text-red-400 w-10 h-10" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">กำไร/ขาดทุน</div>
                    <div className={`text-2xl font-bold ${(currentStock.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(currentStock.totalProfit || 0)}
                    </div>
                  </div>
                  <FiDollarSign className="text-green-400 w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedLottery > 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FiCalendar className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600">ไม่พบงวดหวยสำหรับหวยนี้</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FiAward className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600">กรุณาเลือกหวยเพื่อดูข้อมูล</p>
        </div>
      )}
    </div>
  )
}

export default StockMasterList
