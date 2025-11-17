import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiRefreshCw, FiDownload, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'
import { adminReportAPI, adminAPIClient } from '../../api/adminAPI'

interface ProfitSummary {
  totalDeposits: number
  totalWithdrawals: number
  totalBonuses: number
  totalCashback: number
  netProfit: number
  depositCount: number
  withdrawalCount: number
  newMemberCount: number
}

interface DailyData {
  date: string
  deposits: number
  withdrawals: number
  profit: number
  depositCount: number
  withdrawalCount: number
}

const ProfitReport: React.FC = () => {
  const [summary, setSummary] = useState<ProfitSummary | null>(null)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    // First day of current month
    const date = new Date()
    date.setDate(1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}-01`
  })
  const [endDate, setEndDate] = useState(() => {
    // Last day of current month
    const date = new Date()
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const year = lastDay.getFullYear()
    const month = String(lastDay.getMonth() + 1).padStart(2, '0')
    const day = String(lastDay.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await adminReportAPI.getProfitSummary({ startDate, endDate })
      setSummary(data)
    } catch (error: any) {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error fetching profit summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyData = async () => {
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const data = await adminReportAPI.getDailyProfitReport({ year, month })
      setDailyData(data || [])
    } catch (error: any) {
      console.error('Error fetching daily data:', error)
      // If API fails, use empty array
      setDailyData([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (showCalendar) {
      fetchDailyData()
    }
  }, [currentMonth, showCalendar])

  const handleSearch = () => {
    if (!startDate || !endDate) {
      toast.error('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด')
      return
    }
    fetchData()
  }

  const handleExport = async () => {
    try {
      toast.loading('กำลังสร้างไฟล์ Excel...')
      const response = await adminAPIClient.get('/reports/profit/export', {
        params: { startDate, endDate },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `profit_report_${startDate}_${endDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('ดาวน์โหลดรายงาน Excel สำเร็จ')
    } catch (error) {
      toast.dismiss()
      toast.error('ไม่สามารถดาวน์โหลดรายงานได้')
      console.error('Export error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toFixed(0)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getDailyDataForDate = (date: Date): DailyData | null => {
    // Format date as YYYY-MM-DD in local timezone (not UTC)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return dailyData.find(d => d.date === dateStr) || null
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getThaiMonth = (date: Date) => {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear() + 543}`
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subValue
  }: {
    title: string
    value: string
    icon: any
    color: string
    subValue?: string
  }) => (
    <div className="bg-admin-card border border-admin-border rounded-xl p-6 hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-brown-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-brown-400 mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.includes('success') ? 'bg-success/10' : color.includes('error') ? 'bg-error/10' : color.includes('info') ? 'bg-info/10' : 'bg-gold-500/10'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-admin-card to-brown-900 border-b border-admin-border shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2">สรุปรายได้</h1>
          <p className="text-brown-300">รายงานสรุปยอดรายได้และกำไร</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-brown-300 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-brown-300 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:bg-brown-600 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="w-5 h-5 animate-spin" />
                  <span>กำลังโหลด...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-5 h-5" />
                  <span>ค้นหา</span>
                </>
              )}
            </button>

            <button
              onClick={handleExport}
              disabled={loading || !summary}
              className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:bg-brown-600 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gold-500">กำลังโหลด...</div>
          </div>
        ) : summary ? (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="ยอดฝากทั้งหมด"
                value={`฿${formatCurrency(summary.totalDeposits)}`}
                icon={FiTrendingUp}
                color="text-success"
                subValue={`${summary.depositCount} รายการ`}
              />
              <StatCard
                title="ยอดถอนทั้งหมด"
                value={`฿${formatCurrency(summary.totalWithdrawals)}`}
                icon={FiTrendingDown}
                color="text-error"
                subValue={`${summary.withdrawalCount} รายการ`}
              />
              <StatCard
                title="โบนัสที่จ่าย"
                value={`฿${formatCurrency(summary.totalBonuses)}`}
                icon={FiDollarSign}
                color="text-gold-500"
              />
              <StatCard
                title="แคชแบ็คที่จ่าย"
                value={`฿${formatCurrency(summary.totalCashback)}`}
                icon={FiDollarSign}
                color="text-info"
              />
            </div>

            {/* Net Profit Card */}
            <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-gold-100 text-sm font-medium mb-2">กำไรสุทธิ</p>
                  <p className="text-4xl font-bold">฿{formatCurrency(summary.netProfit)}</p>
                  <p className="text-gold-100 text-sm mt-2">
                    = ฝาก (฿{formatCurrency(summary.totalDeposits)}) - ถอน (฿{formatCurrency(summary.totalWithdrawals)}) - โบนัส (฿{formatCurrency(summary.totalBonuses)}) - แคชแบ็ค (฿{formatCurrency(summary.totalCashback)})
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <FiDollarSign className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="สมาชิกใหม่"
                value={summary.newMemberCount.toString()}
                icon={FiUsers}
                color="text-info"
                subValue="คน"
              />
              <StatCard
                title="ค่าเฉลี่ยต่อรายการฝาก"
                value={`฿${formatCurrency(summary.depositCount > 0 ? summary.totalDeposits / summary.depositCount : 0)}`}
                icon={FiTrendingUp}
                color="text-success"
              />
              <StatCard
                title="ค่าเฉลี่ยต่อรายการถอน"
                value={`฿${formatCurrency(summary.withdrawalCount > 0 ? summary.totalWithdrawals / summary.withdrawalCount : 0)}`}
                icon={FiTrendingDown}
                color="text-error"
              />
            </div>

            {/* Daily Report Calendar */}
            <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-admin-card to-brown-900 border-b border-admin-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-6 h-6 text-gold-500" />
                    <h2 className="text-xl font-display font-bold text-gold-500">
                      รายงานสรุปรายวัน
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="px-4 py-2 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all text-sm"
                    >
                      {showCalendar ? 'ซ่อน' : 'แสดง'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeMonth('prev')}
                        className="p-2 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-brown-200 font-medium min-w-[150px] text-center">
                        {getThaiMonth(currentMonth)}
                      </span>
                      <button
                        onClick={() => changeMonth('next')}
                        className="p-2 bg-admin-bg hover:bg-admin-hover text-brown-300 rounded-lg transition-all"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              {showCalendar && (
                <div className="p-6">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-brown-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
                      const days = []

                      // Empty cells before first day
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(
                          <div key={`empty-${i}`} className="aspect-square" />
                        )
                      }

                      // Days of month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        const data = getDailyDataForDate(date)
                        const isToday = new Date().toDateString() === date.toDateString()

                        days.push(
                          <div
                            key={day}
                            className={`border rounded-lg p-3 transition-all min-h-[140px] ${
                              isToday
                                ? 'border-gold-500 bg-gold-500/10'
                                : data
                                ? 'border-admin-border bg-admin-bg hover:border-gold-500/50 hover:shadow-lg cursor-pointer'
                                : 'border-admin-border/30 bg-admin-bg/30'
                            }`}
                          >
                            <div className="h-full flex flex-col">
                              <div className={`text-sm font-bold mb-2 ${
                                isToday ? 'text-gold-500' : 'text-brown-300'
                              }`}>
                                {day}
                              </div>
                              {data ? (
                                <div className="flex-1 flex flex-col justify-between text-xs">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-brown-400">ฝาก:</span>
                                      <span className="text-success font-bold">
                                        {formatShortCurrency(data.deposits)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-brown-400">ถอน:</span>
                                      <span className="text-error font-bold">
                                        {formatShortCurrency(data.withdrawals)}
                                      </span>
                                    </div>
                                    <div className="h-px bg-admin-border my-1"></div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-brown-400 font-medium">ผล:</span>
                                      <span className={`font-bold ${
                                        data.profit >= 0 ? 'text-success' : 'text-error'
                                      }`}>
                                        {data.profit >= 0 ? '+' : ''}{formatShortCurrency(data.profit)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={`text-center text-xs font-bold mt-2 pt-2 border-t-2 ${
                                    data.profit >= 0
                                      ? 'border-success text-success'
                                      : 'border-error text-error'
                                  }`}>
                                    {data.profit >= 0 ? '🟢 กำไร' : '🔴 ขาดทุน'}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center justify-center">
                                  <span className="text-brown-500 text-xs">ไม่มีข้อมูล</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return days
                    })()}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-6 border-t border-admin-border">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-success/20 border border-success/50"></div>
                        <span className="text-brown-300">ยอดฝาก</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-error/20 border border-error/50"></div>
                        <span className="text-brown-300">ยอดถอน</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gold-500/20 border border-gold-500"></div>
                        <span className="text-brown-300">วันนี้</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brown-400 text-xs">หมายเหตุ: K = พัน, M = ล้าน</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
            <p className="text-brown-400">ไม่มีข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfitReport
