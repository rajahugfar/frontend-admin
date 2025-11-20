import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, Lottery, LotteryStats } from '@/api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiTrendingUp, FiCheck, FiX, FiClock, FiPieChart, FiInfo, FiSettings, FiCalendar } from 'react-icons/fi'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import LotteryDetailModal from '@/components/admin/modals/LotteryDetailModal'
import HuayConfigModal from '@/components/admin/modals/HuayConfigModal'

dayjs.locale('th')

const LotteryManagement: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingStocks, setGeneratingStocks] = useState(false)
  const [generateStockModalOpen, setGenerateStockModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [filterGroup, setFilterGroup] = useState<number>(0)
  const [stats, setStats] = useState<LotteryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    lastUpdate: new Date().toISOString(),
    groupStats: {}
  })

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loadingModal, setLoadingModal] = useState(false)

  // New modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null)

  const [formData, setFormData] = useState({
    huayCode: '',
    huayName: '',
    timeClose: '',
    huayGroup: 1,
    dateOpent: [] as number[],
    opentFix: '',
    icon: '',
    status: true,
    flagNextday: false,
    has4d: false,
    detail: ''
  })

  useEffect(() => {
    fetchLotteries()
    fetchStats()
  }, [])

  const fetchLotteries = async () => {
    setLoading(true)
    try {
      const data = await adminLotteryAPI.getAllLotteries()
      setLotteries(data)
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      toast.error('ไม่สามารถโหลดข้อมูลหวยได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await adminLotteryAPI.getLotteryStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setSelectedId(null)
    setFormData({
      huayCode: '',
      huayName: '',
      timeClose: '',
      huayGroup: 1,
      dateOpent: [],
      opentFix: '',
      icon: '',
      status: true,
      flagNextday: false,
      has4d: false,
      detail: ''
    })
    setModalOpen(true)
  }

  const handleEdit = async (lottery: Lottery) => {
    setIsEditing(true)
    setSelectedId(lottery.id)
    setLoadingModal(true)
    setModalOpen(true)

    try {
      const lotteryData = await adminLotteryAPI.getLotteryByID(lottery.id.toString())

      let dateOpentArray: number[] = []
      if (lotteryData.dateOpent && lotteryData.dateOpent !== null && lotteryData.dateOpent.trim() !== '') {
        dateOpentArray = lotteryData.dateOpent
          .split(',')
          .map(d => parseInt(d.trim()))
          .filter(d => !isNaN(d))
      }

      let timeClose = lotteryData.timeClose || ''
      if (timeClose.includes('T')) {
        const timePart = timeClose.split('T')[1]?.split('Z')[0]?.substring(0, 5) || ''
        timeClose = timePart
      }

      setTimeout(() => {
        setFormData({
          huayCode: lotteryData.huayCode,
          huayName: lotteryData.huayName,
          timeClose: timeClose,
          huayGroup: lotteryData.huayGroup,
          dateOpent: dateOpentArray,
          opentFix: lotteryData.opentFix ?? '',
          icon: lotteryData.icon ?? '',
          status: Boolean(lotteryData.status),
          flagNextday: Boolean(lotteryData.flagNextday),
          has4d: Boolean(lotteryData.has4d || lotteryData.hauy4),
          detail: lotteryData.detail ?? ''
        })
        setLoadingModal(false)
      }, 100)
    } catch (error) {
      console.error('Failed to fetch lottery details:', error)
      toast.error('ไม่สามารถโหลดข้อมูลหวยได้')
      setModalOpen(false)
      setLoadingModal(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.huayCode || !formData.huayName) {
      toast.error('กรุณากรอกรหัสหวยและชื่อหวย')
      return
    }

    try {
      const payload: any = {
        huayName: formData.huayName,
        huayGroup: formData.huayGroup,
        timeClose: formData.timeClose || '23:59',
        opentFix: formData.opentFix || null,
        dateOpent: formData.dateOpent.length > 0 ? formData.dateOpent.join(',') : null,
        icon: formData.icon || null,
        flagNextday: formData.flagNextday ? 1 : 0,
        has4d: formData.has4d ? 1 : 0,
        status: formData.status ? 1 : 0,
        detail: formData.detail || ''
      }

      // สำหรับ create เท่านั้น
      if (!isEditing) {
        payload.huayCode = formData.huayCode
        payload.detail = ''
      }

      if (isEditing && selectedId) {
        await adminLotteryAPI.updateLottery(selectedId.toString(), payload)
        toast.success('อัปเดตหวยสำเร็จ')
      } else {
        await adminLotteryAPI.createLottery(payload)
        toast.success('สร้างหวยสำเร็จ')
      }

      setModalOpen(false)
      fetchLotteries()
      fetchStats()
    } catch (error) {
      console.error('Failed to save lottery:', error)
      toast.error('ไม่สามารถบันทึกข้อมูลได้')
    }
  }

  const handleDelete = async (lottery: Lottery) => {
    if (!confirm(`คุณต้องการลบหวย "${lottery.huayName}" หรือไม่?`)) {
      return
    }

    try {
      await adminLotteryAPI.deleteLottery(lottery.id.toString())
      toast.success('ลบหวยสำเร็จ')
      fetchLotteries()
      fetchStats()
    } catch (error) {
      console.error('Failed to delete lottery:', error)
      toast.error('ไม่สามารถลบหวยได้')
    }
  }

  const handleToggleStatus = async (lottery: Lottery) => {
    try {
      await adminLotteryAPI.toggleLotteryStatus(lottery.id.toString())
      toast.success(`${lottery.status ? 'ปิด' : 'เปิด'}หวยสำเร็จ`)
      fetchLotteries()
      fetchStats()
    } catch (error) {
      console.error('Failed to toggle status:', error)
      toast.error('ไม่สามารถเปลี่ยนสถานะได้')
    }
  }

  const handleShowDetail = (lottery: Lottery) => {
    setSelectedLottery(lottery)
    setDetailModalOpen(true)
  }

  const handleShowConfig = (lottery: Lottery) => {
    setSelectedLottery(lottery)
    setConfigModalOpen(true)
  }

  const handleGenerateDailyStocks = async () => {
    setGeneratingStocks(true)
    try {
      const result = await adminLotteryAPI.generateDailyStocks()

      if (result.errors && result.errors.length > 0) {
        if (result.created === 0) {
          toast.error(`ไม่สามารถสร้างหวยรายวันได้: ${result.errors[0]}`)
        } else {
          toast('สร้างหวยรายวันบางส่วนสำเร็จ', { icon: '⚠️' })
        }
      } else if (result.created === 0 && result.totalEligible > 0) {
        toast('หวยรายวันถูกสร้างไปแล้วทั้งหมด', { icon: 'ℹ️' })
      } else if (result.created > 0) {
        toast.success(`สร้างหวยรายวันสำเร็จ ${result.created} รายการ`)
      } else {
        toast('ไม่พบหวยที่ต้องสร้างในวันที่เลือก', { icon: 'ℹ️' })
      }

      console.log('Generate Daily Stocks Result:', result)
      setGenerateStockModalOpen(false)
      setSelectedDate(dayjs().format('YYYY-MM-DD'))
    } catch (error) {
      console.error('Failed to generate daily stocks:', error)
      toast.error('ไม่สามารถสร้างหวยรายวันได้')
    } finally {
      setGeneratingStocks(false)
    }
  }

  const getGroupName = (group: number): string => {
    const groups: { [key: number]: string } = {
      1: 'หวยไทย', 2: 'ลาว', 3: 'เวียดนาม', 4: 'หุ้นไทย', 5: 'หุ้นต่างประเทศ', 6: 'วีซ่า', 7: 'อื่นๆ'
    }
    return groups[group] || `กลุ่ม ${group}`
  }

  const getDayName = (day: number): string => {
    const days: { [key: number]: string } = {
      1: 'จ', 2: 'อ', 3: 'พ', 4: 'พฤ', 5: 'ศ', 6: 'ส', 7: 'อา'
    }
    return days[day] || ''
  }

  const getDayNameFull = (day: number): string => {
    const days: { [key: number]: string } = {
      1: 'จันทร์', 2: 'อังคาร', 3: 'พุธ', 4: 'พฤหัสบดี', 5: 'ศุกร์', 6: 'เสาร์', 7: 'อาทิตย์'
    }
    return days[day] || ''
  }

  const getFlagEmoji = (countryCode: string): string => {
    const code = countryCode.toLowerCase()
    const flags: { [key: string]: string } = {
      'th': '🇹🇭', 'la': '🇱🇦', 'vn': '🇻🇳', 'cn': '🇨🇳', 'jp': '🇯🇵',
      'kr': '🇰🇷', 'sg': '🇸🇬', 'my': '🇲🇾', 'tw': '🇹🇼', 'hk': '🇭🇰'
    }
    return flags[code] || '🏴'
  }

  const getCountryOptions = () => {
    return [
      { code: '', name: '- ไม่ระบุ -' },
      { code: 'th', name: 'ไทย' },
      { code: 'la', name: 'ลาว' },
      { code: 'vn', name: 'เวียดนาม' },
      { code: 'cn', name: 'จีน' },
      { code: 'jp', name: 'ญี่ปุ่น' },
      { code: 'kr', name: 'เกาหลีใต้' },
      { code: 'tw', name: 'ไต้หวัน' },
      { code: 'hk', name: 'ฮ่องกง' },
      { code: 'sg', name: 'สิงคโปร์' },
      { code: 'my', name: 'มาเลเซีย' }
    ]
  }

  const toggleDateOpent = (day: number) => {
    setFormData(prev => {
      const newDateOpent = prev.dateOpent.includes(day)
        ? prev.dateOpent.filter(d => d !== day)
        : [...prev.dateOpent, day].sort()

      // ถ้าเลือกวัน ให้ล้างค่า opentFix
      return {
        ...prev,
        dateOpent: newDateOpent,
        opentFix: newDateOpent.length > 0 ? '' : prev.opentFix
      }
    })
  }

  const filteredLotteries = filterGroup === 0
    ? lotteries
    : lotteries.filter(l => l.huayGroup === filterGroup)

  const groupColors: { [key: number]: string } = {
    1: 'text-blue-500 cursor-pointer hover:text-blue-700',
    2: 'text-green-500 cursor-pointer hover:text-green-700',
    3: 'text-cyan-500 cursor-pointer hover:text-cyan-700',
    4: 'text-orange-500 cursor-pointer hover:text-orange-700',
    5: 'text-red-500 cursor-pointer hover:text-red-700',
    6: 'text-purple-500 cursor-pointer hover:text-purple-700',
    7: 'text-gray-500 cursor-pointer hover:text-gray-700'
  }

  return (
    <div className="min-h-screen bg-admin-bg p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gold-500 mb-2">หวยมาสเตอร์</h1>
        <p className="text-brown-300">จัดการข้อมูลหวยทั้งหมดในระบบ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Lotteries */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-info/10 rounded-lg group-hover:bg-info/20 transition-colors">
              <FiTrendingUp className="w-6 h-6 text-info" />
            </div>
            <span className="text-xs text-brown-400 font-medium">หวยทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-gold-500 mb-1 drop-shadow-lg">
            {stats.total}
          </div>
          <div className="text-sm text-brown-400">จำนวนหวยในระบบ</div>
        </div>

        {/* Active */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
              <FiCheck className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs text-brown-400 font-medium">เปิดใช้งาน</span>
          </div>
          <div className="text-3xl font-bold text-gold-500 mb-1 drop-shadow-lg">
            {stats.active}
          </div>
          <div className="text-sm text-brown-400">หวยที่เปิดใช้งาน</div>
        </div>

        {/* Inactive */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
              <FiX className="w-6 h-6 text-warning" />
            </div>
            <span className="text-xs text-brown-400 font-medium">ปิดใช้งาน</span>
          </div>
          <div className="text-3xl font-bold text-gold-500 mb-1 drop-shadow-lg">
            {stats.inactive}
          </div>
          <div className="text-sm text-brown-400">หวยที่ปิดใช้งาน</div>
        </div>

        {/* Last Update */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
              <FiClock className="w-6 h-6 text-gold-500" />
            </div>
            <span className="text-xs text-brown-400 font-medium">อัปเดตล่าสุด</span>
          </div>
          <div className="text-lg font-bold text-gold-500 mb-1">
            {dayjs(stats.lastUpdate).format('DD/MM/YY')}
          </div>
          <div className="text-sm text-brown-400">
            {dayjs(stats.lastUpdate).format('HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Group Statistics Card */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiPieChart className="w-5 h-5 text-gold-500" />
          <h3 className="text-lg font-display font-bold text-gold-500">สถิติตามกลุ่ม</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map(group => (
            <div
              key={group}
              onClick={() => setFilterGroup(filterGroup === group ? 0 : group)}
              className={`text-center p-4 bg-admin-bg rounded-lg border border-admin-border hover:border-gold-500/30 transition-all cursor-pointer ${groupColors[group]}`}
            >
              <div className="text-3xl font-bold mb-1">
                {stats.groupStats[group] || 0}
              </div>
              <div className="text-sm">
                {getGroupName(group)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 items-center">
          <label className="text-brown-300 font-medium">กรองตามกลุ่มหวย:</label>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(parseInt(e.target.value))}
            className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value={0}>ทั้งหมด</option>
            {[1, 2, 3, 4, 5, 6, 7].map(group => (
              <option key={group} value={group}>{getGroupName(group)}</option>
            ))}
          </select>
          {filterGroup !== 0 && (
            <button
              onClick={() => setFilterGroup(0)}
              className="px-4 py-2 text-brown-300 bg-admin-bg border border-admin-border rounded-lg hover:border-gold-500/50 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { fetchStats(); fetchLotteries(); }}
            className="flex items-center gap-2 px-4 py-2 bg-admin-bg border border-admin-border text-brown-200 rounded-lg hover:border-gold-500/50 hover:text-gold-500 transition-all"
          >
            <FiRefreshCw size={18} />
            รีเฟรชสถิติ
          </button>
          <button
            onClick={() => setGenerateStockModalOpen(true)}
            disabled={generatingStocks}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCalendar size={18} />
            สร้างหวยรายวัน
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50"
          >
            <FiPlus size={20} />
            เพิ่มหวยใหม่
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-brown-300">กำลังโหลด...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">ลำดับ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">รหัส</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">ชื่อหวย</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">กลุ่ม</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">เวลาปิด</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">ปิดข้ามวันไหม</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">วันที่เปิดฟิกวัน</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">วันที่เปิดหวย</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredLotteries.map((lottery, index) => (
                  <tr key={lottery.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {lottery.icon ? (
                        <span className="text-2xl" title={lottery.icon}>
                          {getFlagEmoji(lottery.icon)}
                        </span>
                      ) : (
                        <span className="text-brown-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gold-500">
                      {lottery.huayCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                      {lottery.huayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20">
                        {getGroupName(lottery.huayGroup)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                      {lottery.timeClose ? lottery.timeClose.split('T')[1]?.substring(0, 5) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {lottery.flagNextday ? (
                        <span className="text-warning">ใช่</span>
                      ) : (
                        <span className="text-brown-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                      {lottery.opentFix || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-brown-200">
                      {lottery.dateOpent ?
                        lottery.dateOpent.split(',').map(d => getDayName(parseInt(d))).join(',')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStatus(lottery)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          lottery.status
                            ? 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
                            : 'bg-error/10 text-error hover:bg-error/20 border border-error/20'
                        }`}
                      >
                        {lottery.status ? 'เปิด' : 'ปิด'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleShowDetail(lottery)}
                          className="text-info hover:text-info/80 inline-flex items-center gap-1 transition-colors"
                        >
                          <FiInfo />
                          รายละเอียด
                        </button>
                        <button
                          onClick={() => handleShowConfig(lottery)}
                          className="text-gold-500 hover:text-gold-600 inline-flex items-center gap-1 transition-colors"
                        >
                          <FiSettings />
                          กำหนด Config
                        </button>
                        <button
                          onClick={() => handleEdit(lottery)}
                          className="text-info hover:text-info/80 inline-flex items-center gap-1 transition-colors"
                        >
                          <FiEdit2 />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(lottery)}
                          className="text-error hover:text-error/80 inline-flex items-center gap-1 transition-colors"
                        >
                          <FiTrash2 />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredLotteries.length === 0 && (
          <div className="p-8 text-center text-brown-400">ไม่พบข้อมูลหวย</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-gold-500">
                {isEditing ? 'แก้ไขหวย' : 'เพิ่มหวยใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brown-400 hover:text-gold-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {loadingModal ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-brown-300">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-1">รหัสหวย *</label>
                    <input
                      type="text"
                      value={formData.huayCode}
                      onChange={(e) => setFormData({ ...formData, huayCode: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="เช่น SET_1"
                      disabled={isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-1">ชื่อหวย *</label>
                    <input
                      type="text"
                      value={formData.huayName}
                      onChange={(e) => setFormData({ ...formData, huayName: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="เช่น หุ้นไทย รอบเช้า"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-1">เวลาปิดหวย</label>
                    <input
                      type="time"
                      value={formData.timeClose}
                      onChange={(e) => setFormData({ ...formData, timeClose: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brown-300 mb-1">กลุ่มหวย</label>
                    <select
                      value={formData.huayGroup}
                      onChange={(e) => setFormData({ ...formData, huayGroup: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(group => (
                        <option key={group} value={group}>{getGroupName(group)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-300 mb-2">วันที่เปิดหวย</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <label key={day} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.dateOpent.includes(day)}
                          onChange={() => toggleDateOpent(day)}
                          disabled={formData.opentFix !== ''}
                          className="mr-2 w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500 focus:ring-2"
                        />
                        <span className="text-sm text-brown-300">{getDayNameFull(day)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-300 mb-1">
                    Fix วันเปิด <span className="text-xs text-brown-500">(เช่น 1,16 หรือ 17,27)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.opentFix}
                    onChange={(e) => setFormData({ ...formData, opentFix: e.target.value, dateOpent: [] })}
                    disabled={formData.dateOpent.length > 0}
                    className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="17,27"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.flagNextday}
                        onChange={(e) => setFormData({ ...formData, flagNextday: e.target.checked })}
                        className="mr-2 w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-brown-300">ผลออกข้ามวัน (Next Day)</span>
                    </label>
                    <p className="text-xs text-brown-500 ml-6 mt-1">เลือกถ้าหวยงวดนี้ออกผลในวันถัดไป</p>
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has4d}
                        onChange={(e) => setFormData({ ...formData, has4d: e.target.checked })}
                        className="mr-2 w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-brown-300">มีหวย 4 ตัว</span>
                    </label>
                    <p className="text-xs text-brown-500 ml-6 mt-1">เลือกถ้าหวยชนิดนี้มีการออก 4 ตัว</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-300 mb-1">ธงชาติ</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="flex-1 px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      {getCountryOptions().map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {formData.icon && (
                      <div className="flex items-center justify-center w-12 h-10 text-3xl">
                        {getFlagEmoji(formData.icon)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-300 mb-1">สถานะ</label>
                  <select
                    value={formData.status ? '1' : '0'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === '1' })}
                    className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="1">เปิดใช้งาน</option>
                    <option value="0">ปิดใช้งาน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-300 mb-1">กติกา (Detail)</label>
                  <textarea
                    value={formData.detail}
                    onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent min-h-[120px]"
                    placeholder="กรอกกติกาหวย (รองรับ HTML)"
                  />
                  <p className="text-xs text-brown-500 mt-1">สามารถใส่ HTML ได้ เช่น &lt;b&gt;, &lt;br&gt;, &lt;ul&gt;, &lt;li&gt;</p>
                </div>
              </div>
            )}

            {!loadingModal && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 text-brown-300 bg-admin-bg border border-admin-border rounded-lg hover:border-gold-500/50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 text-white bg-gradient-to-r from-gold-600 to-gold-500 rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50"
                >
                  {isEditing ? 'บันทึก' : 'เพิ่มหวย'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lottery Detail Modal */}
      {selectedLottery && (
        <LotteryDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedLottery(null)
          }}
          lottery={selectedLottery}
        />
      )}

      {/* Huay Config Modal */}
      {selectedLottery && (
        <HuayConfigModal
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false)
            setSelectedLottery(null)
          }}
          lottery={selectedLottery}
        />
      )}

      {/* Generate Daily Stock Modal */}
      {generateStockModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-gold-500">สร้างหวยรายวัน</h3>
              <button
                onClick={() => {
                  setGenerateStockModalOpen(false)
                  setSelectedDate(dayjs().format('YYYY-MM-DD'))
                }}
                className="text-brown-400 hover:text-gold-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">
                  เลือกวันที่สร้างหวย
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <p className="text-xs text-brown-500 mt-2">
                  ระบบจะสร้างหวยตามคอนฟิกของ lottery_master ที่ตรงกับวันที่เลือก
                </p>
              </div>

              <div className="bg-admin-bg border border-admin-border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-brown-300">
                    <p className="font-medium mb-1">หมายเหตุ:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>หวยที่มี date_opent (วันที่เปิด) จะถูกตรวจสอบตามวันในสัปดาห์</li>
                      <li>หวยที่มี opent_fix (วันเปิดฟิกซ์) จะถูกตรวจสอบตามวันที่ในเดือน</li>
                      <li>ระบบจะไม่สร้างซ้ำหากมีหวยรายวันอยู่แล้ว</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setGenerateStockModalOpen(false)
                  setSelectedDate(dayjs().format('YYYY-MM-DD'))
                }}
                disabled={generatingStocks}
                className="px-6 py-2 text-brown-300 bg-admin-bg border border-admin-border rounded-lg hover:border-gold-500/50 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleGenerateDailyStocks}
                disabled={generatingStocks}
                className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-gold-600 to-gold-500 rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingStocks ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <FiCalendar size={18} />
                    สร้างหวย
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LotteryManagement
