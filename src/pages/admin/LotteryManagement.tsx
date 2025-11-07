import React, { useState, useEffect } from 'react'
import { adminLotteryAPI, Lottery } from '../../api/adminLotteryAPI'
import toast from 'react-hot-toast'
import { FiEdit2, FiToggleLeft, FiToggleRight, FiPlus, FiTrash2, FiFlag, FiX } from 'react-icons/fi'

const LotteryManagement: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [loading, setLoading] = useState(false)
  const [filterGroup, setFilterGroup] = useState<number>(0)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    huayCode: '',
    huayName: '',
    timeClose: '',
    huayGroup: 1,
    dateOpent: [] as number[], // 1-7 for Mon-Sun
    opentFix: '',
    icon: '',
    status: true
  })

  const [loadingEdit, setLoadingEdit] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    group1: 0,
    group2: 0,
    group3: 0,
    group4: 0,
    group5: 0,
    group6: 0,
    group7: 0
  })

  useEffect(() => {
    fetchLotteries()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [lotteries])

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

  const calculateStats = () => {
    setStats({
      total: lotteries.length,
      active: lotteries.filter(l => l.status).length,
      group1: lotteries.filter(l => l.huayGroup === 1).length,
      group2: lotteries.filter(l => l.huayGroup === 2).length,
      group3: lotteries.filter(l => l.huayGroup === 3).length,
      group4: lotteries.filter(l => l.huayGroup === 4).length,
      group5: lotteries.filter(l => l.huayGroup === 5).length,
      group6: lotteries.filter(l => l.huayGroup === 6).length,
      group7: lotteries.filter(l => l.huayGroup === 7).length,
    })
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
      status: true
    })
    setModalOpen(true)
  }

  const handleEdit = async (lottery: Lottery) => {
    setIsEditing(true)
    setSelectedId(lottery.id)
    setLoadingEdit(true)
    setModalOpen(true)

    try {
      const lotteryData = await adminLotteryAPI.getLotteryByID(lottery.id.toString())

      // Parse date_opent
      let dateOpentArray: number[] = []
      if (lotteryData.dateOpent && lotteryData.dateOpent !== null && lotteryData.dateOpent.trim() !== '') {
        dateOpentArray = lotteryData.dateOpent
          .split(',')
          .map(d => parseInt(d.trim()))
          .filter(d => !isNaN(d))
      }

      // Format time
      let timeClose = lotteryData.timeClose || ''
      if (timeClose.includes('T')) {
        const timePart = timeClose.split('T')[1]?.split('Z')[0]?.substring(0, 5) || ''
        timeClose = timePart
      }

      // Update form ด้วย setTimeout เพื่อให้ React render modal ก่อน
      setTimeout(() => {
        setFormData({
          huayCode: lotteryData.huayCode,
          huayName: lotteryData.huayName,
          timeClose: timeClose,
          huayGroup: lotteryData.huayGroup,
          dateOpent: dateOpentArray,
          opentFix: lotteryData.opentFix ?? '',
          icon: lotteryData.icon ?? '',
          status: lotteryData.status
        })
        setLoadingEdit(false)
      }, 100)
    } catch (error) {
      console.error('Failed to fetch lottery details:', error)
      toast.error('ไม่สามารถโหลดข้อมูลหวยได้')
      setModalOpen(false)
      setIsEditing(false)
      setSelectedId(null)
      setLoadingEdit(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.huayCode || !formData.huayName) {
      toast.error('กรุณากรอกรหัสหวยและชื่อหวย')
      return
    }

    try {
      // Convert time to datetime format that backend expects
      const formatTime = (time: string) => {
        if (!time) return '0000-01-01T00:00:00Z'
        // If already in datetime format, return as is
        if (time.includes('T')) return time
        // Convert HH:MM to datetime format
        return `0000-01-01T${time}:00Z`
      }

      const payload = {
        huayCode: formData.huayCode,
        huayName: formData.huayName,
        huayGroup: formData.huayGroup,
        huayType: getHuayTypeFromGroup(formData.huayGroup),
        timeOpen: formatTime('00:00'),
        timeClose: formatTime(formData.timeClose || '23:59'),
        timeResult: formatTime('23:59'),
        flagNextday: false,
        has4d: false,
        has3dTop: true,
        has3dBottom: true,
        has2dTop: true,
        has2dBottom: true,
        displayOrder: 0,
        opentFix: formData.opentFix || null,
        dateOpent: formData.dateOpent.length > 0 ? formData.dateOpent.join(',') : null,
        icon: formData.icon || null,
        status: formData.status
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
    } catch (error) {
      console.error('Failed to toggle status:', error)
      toast.error('ไม่สามารถเปลี่ยนสถานะได้')
    }
  }

  const getHuayTypeFromGroup = (group: number): string => {
    // Map group to huay_type
    const mapping: { [key: number]: string } = {
      1: 'g', // หวยไทย -> government
      2: 'o', // ลาว -> online
      3: 'h', // เวียดนาม -> hanoi
      4: 's', // หุ้นไทย -> stock
      5: 's', // หุ้นต่างประเทศ -> stock
      6: 'y', // วีซ่า -> yeekee
      7: 'o'  // อื่นๆ -> online
    }
    return mapping[group] || 'o'
  }

  const getGroupName = (group: number): string => {
    const groups: { [key: number]: string } = {
      1: 'หวยไทย',
      2: 'หวยหุ้นลาว',
      3: 'หวยหุ้นเวียดนาม',
      4: 'หวยหุ้นไทย',
      5: 'หวยหุ้นต่างประเทศ',
      6: 'หวยวีซ่า',
      7: 'หวยอื่นๆ'
    }
    return groups[group] || `กลุ่ม ${group}`
  }

  const getDayName = (day: number): string => {
    const days: { [key: number]: string } = {
      1: 'จันทร์',
      2: 'อังคาร',
      3: 'พุธ',
      4: 'พฤหัสบดี',
      5: 'ศุกร์',
      6: 'เสาร์',
      7: 'อาทิตย์'
    }
    return days[day] || ''
  }

  const getFlagEmoji = (countryCode: string): string => {
    const code = countryCode.toLowerCase()
    const flags: { [key: string]: string } = {
      'th': '🇹🇭',
      'la': '🇱🇦',
      'vn': '🇻🇳',
      'cn': '🇨🇳',
      'jp': '🇯🇵',
      'kr': '🇰🇷',
      'sg': '🇸🇬',
      'my': '🇲🇾',
      'tw': '🇹🇼',
      'hk': '🇭🇰',
      'us': '🇺🇸',
      'uk': '🇬🇧',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'it': '🇮🇹',
      'es': '🇪🇸',
      'au': '🇦🇺',
      'nz': '🇳🇿',
      'in': '🇮🇳',
      'id': '🇮🇩',
      'ph': '🇵🇭',
      'mm': '🇲🇲',
      'kh': '🇰🇭'
    }
    return flags[code] || '🏴'
  }

  const getCountryOptions = () => {
    return [
      { code: '', flag: '', name: '- ไม่ระบุ -' },
      { code: 'th', flag: '🇹🇭', name: 'ไทย' },
      { code: 'la', flag: '🇱🇦', name: 'ลาว' },
      { code: 'vn', flag: '🇻🇳', name: 'เวียดนาม' },
      { code: 'cn', flag: '🇨🇳', name: 'จีน' },
      { code: 'jp', flag: '🇯🇵', name: 'ญี่ปุ่น' },
      { code: 'kr', flag: '🇰🇷', name: 'เกาหลีใต้' },
      { code: 'tw', flag: '🇹🇼', name: 'ไต้หวัน' },
      { code: 'hk', flag: '🇭🇰', name: 'ฮ่องกง' },
      { code: 'sg', flag: '🇸🇬', name: 'สิงคโปร์' },
      { code: 'my', flag: '🇲🇾', name: 'มาเลเซีย' },
      { code: 'id', flag: '🇮🇩', name: 'อินโดนีเซีย' },
      { code: 'ph', flag: '🇵🇭', name: 'ฟิลิปปินส์' },
      { code: 'mm', flag: '🇲🇲', name: 'พม่า' },
      { code: 'kh', flag: '🇰🇭', name: 'กัมพูชา' },
      { code: 'in', flag: '🇮🇳', name: 'อินเดีย' },
      { code: 'us', flag: '🇺🇸', name: 'สหรัฐอเมริกา' },
      { code: 'uk', flag: '🇬🇧', name: 'สหราชอาณาจักร' },
      { code: 'de', flag: '🇩🇪', name: 'เยอรมนี' },
      { code: 'fr', flag: '🇫🇷', name: 'ฝรั่งเศส' },
      { code: 'it', flag: '🇮🇹', name: 'อิตาลี' },
      { code: 'es', flag: '🇪🇸', name: 'สเปน' },
      { code: 'au', flag: '🇦🇺', name: 'ออสเตรเลีย' },
      { code: 'nz', flag: '🇳🇿', name: 'นิวซีแลนด์' }
    ]
  }

  const toggleDateOpent = (day: number) => {
    setFormData(prev => ({
      ...prev,
      dateOpent: prev.dateOpent.includes(day)
        ? prev.dateOpent.filter(d => d !== day)
        : [...prev.dateOpent, day].sort()
    }))
  }

  const filteredLotteries = filterGroup === 0
    ? lotteries
    : lotteries.filter(l => l.huayGroup === filterGroup)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">หวยมาสเตอร์</h1>
        <p className="text-gray-600">จัดการข้อมูลหวยทั้งหมดในระบบ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90">หวยทั้งหมด</div>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm opacity-90">เปิดใช้งาน</div>
        </div>
        <div
          className="bg-purple-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-purple-600"
          onClick={() => setFilterGroup(filterGroup === 1 ? 0 : 1)}
        >
          <div className="text-2xl font-bold">{stats.group1}</div>
          <div className="text-sm opacity-90">หวยไทย</div>
        </div>
        <div
          className="bg-indigo-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-600"
          onClick={() => setFilterGroup(filterGroup === 2 ? 0 : 2)}
        >
          <div className="text-2xl font-bold">{stats.group2}</div>
          <div className="text-sm opacity-90">ลาว</div>
        </div>
        <div
          className="bg-cyan-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-cyan-600"
          onClick={() => setFilterGroup(filterGroup === 3 ? 0 : 3)}
        >
          <div className="text-2xl font-bold">{stats.group3}</div>
          <div className="text-sm opacity-90">เวียดนาม</div>
        </div>
        <div
          className="bg-orange-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-orange-600"
          onClick={() => setFilterGroup(filterGroup === 4 ? 0 : 4)}
        >
          <div className="text-2xl font-bold">{stats.group4}</div>
          <div className="text-sm opacity-90">หุ้นไทย</div>
        </div>
        <div
          className="bg-red-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-red-600"
          onClick={() => setFilterGroup(filterGroup === 5 ? 0 : 5)}
        >
          <div className="text-2xl font-bold">{stats.group5}</div>
          <div className="text-sm opacity-90">หุ้นต่างประเทศ</div>
        </div>
        <div
          className="bg-pink-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-pink-600"
          onClick={() => setFilterGroup(filterGroup === 6 ? 0 : 6)}
        >
          <div className="text-2xl font-bold">{stats.group6}</div>
          <div className="text-sm opacity-90">วีซ่า</div>
        </div>
        <div
          className="bg-gray-500 text-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-600"
          onClick={() => setFilterGroup(filterGroup === 7 ? 0 : 7)}
        >
          <div className="text-2xl font-bold">{stats.group7}</div>
          <div className="text-sm opacity-90">อื่นๆ</div>
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>ทั้งหมด</option>
            <option value={1}>หวยไทย</option>
            <option value={2}>หวยหุ้นลาว</option>
            <option value={3}>หวยหุ้นเวียดนาม</option>
            <option value={4}>หวยหุ้นไทย</option>
            <option value={5}>หวยหุ้นต่างประเทศ</option>
            <option value={6}>หวยวีซ่า</option>
            <option value={7}>หวยอื่นๆ</option>
          </select>
          {filterGroup !== 0 && (
            <button
              onClick={() => setFilterGroup(0)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <FiPlus size={20} />
          เพิ่มหวยใหม่
        </button>
      </div>

      {/* Table */}
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Icon</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">รหัส</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อหวย</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">กลุ่ม</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">เวลาปิด</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">วันที่เปิดฟิก</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">วันที่เปิดหวย</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLotteries.map((lottery, index) => (
                  <tr key={lottery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {lottery.icon && lottery.icon !== null ? (
                        <span className="text-2xl" title={lottery.icon}>
                          {getFlagEmoji(lottery.icon)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-blue-600">
                      {lottery.huayCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lottery.huayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                        {getGroupName(lottery.huayGroup)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {lottery.timeClose || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {lottery.opentFix && lottery.opentFix !== null ? lottery.opentFix : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {lottery.dateOpent && lottery.dateOpent !== null ? lottery.dateOpent : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStatus(lottery)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium mx-auto ${
                          lottery.status
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {lottery.status ? (
                          <>
                            <FiToggleRight size={18} />
                            เปิด
                          </>
                        ) : (
                          <>
                            <FiToggleLeft size={18} />
                            ปิด
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => handleEdit(lottery)}
                        className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center gap-1"
                      >
                        <FiEdit2 />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(lottery)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                      >
                        <FiTrash2 />
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredLotteries.length === 0 && (
          <div className="p-8 text-center text-gray-500">ไม่พบข้อมูลหวย</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div key={selectedId || 'new'} className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? 'แก้ไขหวย' : 'เพิ่มหวยใหม่'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {loadingEdit ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสหวย *</label>
                  <input
                    type="text"
                    value={formData.huayCode}
                    onChange={(e) => setFormData({ ...formData, huayCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น SET_1"
                    disabled={isEditing}
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหวย *</label>
                <input
                  type="text"
                  value={formData.huayName}
                  onChange={(e) => setFormData({ ...formData, huayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น หุ้นไทย รอบเช้า"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาปิดหวย</label>
                <input
                  type="time"
                  value={formData.timeClose}
                  onChange={(e) => setFormData({ ...formData, timeClose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มหวย</label>
                <select
                  value={formData.huayGroup}
                  onChange={(e) => setFormData({ ...formData, huayGroup: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>หวยไทย</option>
                  <option value={2}>หวยหุ้นลาว</option>
                  <option value={3}>หวยหุ้นเวียดนาม</option>
                  <option value={4}>หวยหุ้นไทย</option>
                  <option value={5}>หวยหุ้นต่างประเทศ</option>
                  <option value={6}>หวยวีซ่า</option>
                  <option value={7}>หวยอื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เปิดหวย</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.dateOpent.includes(day)}
                        onChange={() => toggleDateOpent(day)}
                        disabled={formData.opentFix !== ''}
                        className="mr-2 w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{getDayName(day)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fix วันเปิด <span className="text-xs text-gray-500">(เช่น 1,16 หรือ 17,27)</span>
                </label>
                <input
                  type="text"
                  value={formData.opentFix}
                  onChange={(e) => setFormData({ ...formData, opentFix: e.target.value, dateOpent: [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="17,27"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ธงชาติ</label>
                <div className="flex gap-2 items-center">
                  <select
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {getCountryOptions().map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={formData.status ? '1' : '0'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === '1' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">เปิดใช้งาน</option>
                    <option value="0">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
            )}

            {!loadingEdit && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'บันทึก' : 'เพิ่มหวย'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LotteryManagement
