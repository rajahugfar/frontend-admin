import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, Lottery, LotteryPeriod } from '../../api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiPlus, FiX, FiCheck, FiClock, FiCalendar, FiDollarSign, FiEye } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const LotteryPeriods: React.FC = () => {
  const navigate = useNavigate()
  const [periods, setPeriods] = useState<LotteryPeriod[]>([])
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [filterLottery, setFilterLottery] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    lottery_id: '',
    period_date: '',
  })

  // Announce result modal state
  const [announceModalOpen, setAnnounceModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<LotteryPeriod | null>(null)
  const [resultForm, setResultForm] = useState({
    result_3d_top: '',
    result_3d_bottom: '',
    result_2d_top: '',
    result_2d_bottom: '',
    result_4d: '',
  })

  useEffect(() => {
    fetchLotteries()
  }, [])

  useEffect(() => {
    fetchPeriods()
  }, [page, filterLottery, filterStatus])

  const fetchLotteries = async () => {
    try {
      const data = await adminLotteryAPI.getAllLotteries()
      setLotteries(data.filter((l) => l.is_active))
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
    }
  }

  const fetchPeriods = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
      if (filterLottery !== 'all') params.lottery_id = filterLottery
      if (filterStatus !== 'all') params.status = filterStatus

      const data = await adminLotteryAPI.getPeriods(params)
      setPeriods(data.periods)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch periods:', error)
      toast.error('ไม่สามารถโหลดข้อมูลงวดได้')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    setCreateForm({
      lottery_id: lotteries[0]?.id || '',
      period_date: new Date().toISOString().split('T')[0],
    })
    setCreateModalOpen(true)
  }

  const handleCreateSubmit = async () => {
    if (!createForm.lottery_id || !createForm.period_date) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      await adminLotteryAPI.createPeriod(createForm)
      toast.success('สร้างงวดใหม่สำเร็จ')
      setCreateModalOpen(false)
      fetchPeriods()
    } catch (error: any) {
      console.error('Failed to create period:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถสร้างงวดได้')
    }
  }

  const handleClosePeriod = async (period: LotteryPeriod) => {
    if (!confirm(`ต้องการปิดงวด ${period.period_name} ?`)) return

    try {
      await adminLotteryAPI.closePeriod(period.id)
      toast.success('ปิดงวดสำเร็จ')
      fetchPeriods()
    } catch (error: any) {
      console.error('Failed to close period:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถปิดงวดได้')
    }
  }

  const handleAnnounceClick = (period: LotteryPeriod) => {
    setSelectedPeriod(period)
    setResultForm({
      result_3d_top: '',
      result_3d_bottom: '',
      result_2d_top: '',
      result_2d_bottom: '',
      result_4d: '',
    })
    setAnnounceModalOpen(true)
  }

  const handleAnnounceSubmit = async () => {
    if (!selectedPeriod) return

    // Validate required fields
    if (!resultForm.result_3d_top || !resultForm.result_2d_top) {
      toast.error('กรุณากรอก 3ตัวบน และ 2ตัวบน')
      return
    }

    // Validate number lengths
    if (resultForm.result_3d_top.length !== 3 || resultForm.result_2d_top.length !== 2) {
      toast.error('กรุณากรอกตัวเลขให้ถูกต้อง')
      return
    }

    try {
      await adminLotteryAPI.announceResult(selectedPeriod.id, resultForm)
      toast.success('ประกาศผลรางวัลสำเร็จ')
      setAnnounceModalOpen(false)
      fetchPeriods()
    } catch (error: any) {
      console.error('Failed to announce result:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถประกาศผลได้')
    }
  }

  const handleViewBets = (periodId: string) => {
    navigate(`/admin/lottery/bets?period_id=${periodId}`)
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      OPEN: { bg: 'bg-green-100', text: 'text-green-700', label: 'เปิดรับ' },
      CLOSED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'ปิดรับ' },
      ANNOUNCED: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'ประกาศผล' },
      PAID: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'จ่ายเงินแล้ว' },
    }
    const badge = badges[status] || badges['OPEN']
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการงวดหวย</h1>
          <p className="text-gray-600">สร้างงวดใหม่ ปิดรับ และประกาศผลรางวัล</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus />
          สร้างงวดใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <select
            value={filterLottery}
            onChange={(e) => {
              setFilterLottery(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">หวยทั้งหมด</option>
            {lotteries.map((lottery) => (
              <option key={lottery.id} value={lottery.id}>
                {lottery.lottery_name}
              </option>
            ))}
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
            <option value="OPEN">เปิดรับ</option>
            <option value="CLOSED">ปิดรับ</option>
            <option value="ANNOUNCED">ประกาศผล</option>
            <option value="PAID">จ่ายเงินแล้ว</option>
          </select>
        </div>
      </div>

      {/* Periods Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">งวดที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หวย</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลาเปิด-ปิด</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดเดิมพัน</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {periods.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {period.period_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.lottery_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-gray-400" />
                        {formatDate(period.period_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-gray-400" />
                        {period.open_time} - {period.close_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(period.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1 text-blue-600 font-medium">
                        <FiDollarSign />
                        {(period.total_bet_amount || 0).toLocaleString('th-TH')}
                      </div>
                      <div className="text-xs text-gray-500">{period.total_bets || 0} โพย</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {period.status === 'OPEN' && (
                          <button
                            onClick={() => handleClosePeriod(period)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          >
                            ปิดรับ
                          </button>
                        )}
                        {period.status === 'CLOSED' && (
                          <button
                            onClick={() => handleAnnounceClick(period)}
                            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs"
                          >
                            ประกาศผล
                          </button>
                        )}
                        <button
                          onClick={() => handleViewBets(period.id)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs inline-flex items-center gap-1"
                        >
                          <FiEye size={14} />
                          ดูโพย
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && periods.length === 0 && (
          <div className="p-8 text-center text-gray-500">ไม่พบข้อมูลงวด</div>
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

      {/* Create Period Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">สร้างงวดใหม่</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกหวย</label>
                <select
                  value={createForm.lottery_id}
                  onChange={(e) => setCreateForm({ ...createForm, lottery_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {lotteries.map((lottery) => (
                    <option key={lottery.id} value={lottery.id}>
                      {lottery.lottery_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
                <input
                  type="date"
                  value={createForm.period_date}
                  onChange={(e) => setCreateForm({ ...createForm, period_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">เวลาเปิด-ปิดจะถูกตั้งค่าอัตโนมัติตามหวยที่เลือก</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                สร้างงวด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announce Result Modal */}
      {announceModalOpen && selectedPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">ประกาศผลรางวัล</h3>
              <button onClick={() => setAnnounceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">{selectedPeriod.lottery_name}</div>
              <div className="text-xs text-blue-600">{selectedPeriod.period_name}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">3 ตัวบน *</label>
                <input
                  type="text"
                  maxLength={3}
                  value={resultForm.result_3d_top}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, result_3d_top: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">3 ตัวล่าง</label>
                <input
                  type="text"
                  maxLength={3}
                  value={resultForm.result_3d_bottom}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, result_3d_bottom: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold"
                  placeholder="456"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2 ตัวบน *</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={resultForm.result_2d_top}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, result_2d_top: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2 ตัวล่าง</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={resultForm.result_2d_bottom}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, result_2d_bottom: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold"
                    placeholder="34"
                  />
                </div>
              </div>

              {selectedPeriod.lottery_type === 'government' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">4 ตัว</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={resultForm.result_4d}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, result_4d: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold"
                    placeholder="1234"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAnnounceModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAnnounceSubmit}
                className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
              >
                <FiCheck />
                ประกาศผล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LotteryPeriods
