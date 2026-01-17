import React, { useState, useEffect } from 'react'
import { FiX, FiCopy, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { adminLotteryAPI, Lottery } from '@/api/adminLotteryAPI'
import { adminHuayConfigAPI } from '@/api/adminHuayConfigAPI'
import toast from 'react-hot-toast'

interface CopyConfigModalProps {
  isOpen: boolean
  onClose: () => void
  sourceLottery: Lottery
  onSuccess?: () => void
}

const CopyConfigModal: React.FC<CopyConfigModalProps> = ({
  isOpen,
  onClose,
  sourceLottery,
  onSuccess
}) => {
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [selectedLotteries, setSelectedLotteries] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [conflictLotteries, setConflictLotteries] = useState<number[]>([])
  const [overwriteMode, setOverwriteMode] = useState<'skip' | 'overwrite'>('skip')
  const [selectAll, setSelectAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchLotteries()
      // Reset state when modal opens
      setSelectedLotteries([])
      setConflictLotteries([])
      setOverwriteMode('skip')
      setSelectAll(false)
      setSearchTerm('')
    }
  }, [isOpen])

  const fetchLotteries = async () => {
    setLoading(true)
    try {
      const data = await adminLotteryAPI.getAllLotteries()
      // Filter out source lottery
      const filtered = data.filter(l => l.id !== sourceLottery.id)
      setLotteries(filtered)
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      toast.error('ไม่สามารถโหลดข้อมูลหวยได้')
    } finally {
      setLoading(false)
    }
  }

  const checkConflicts = async () => {
    const conflicts: number[] = []

    // Check each selected lottery for existing configs
    for (const lotteryId of selectedLotteries) {
      try {
        // Check both payout and limit configs
        const [payoutConfigs, limitConfigs] = await Promise.all([
          adminHuayConfigAPI.getConfigsByLottery(lotteryId, 1),
          adminHuayConfigAPI.getConfigsByLottery(lotteryId, 2)
        ])

        if (payoutConfigs.length > 0 || limitConfigs.length > 0) {
          conflicts.push(lotteryId)
        }
      } catch (error) {
        console.error(`Failed to check configs for lottery ${lotteryId}:`, error)
      }
    }

    setConflictLotteries(conflicts)
    return conflicts
  }

  const handleSelectLottery = (lotteryId: number) => {
    setSelectedLotteries(prev => {
      if (prev.includes(lotteryId)) {
        return prev.filter(id => id !== lotteryId)
      }
      return [...prev, lotteryId]
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLotteries([])
    } else {
      const allIds = filteredLotteries.map(l => l.id)
      setSelectedLotteries(allIds)
    }
    setSelectAll(!selectAll)
  }

  const filteredLotteries = lotteries.filter(lottery =>
    lottery.huayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lottery.huayCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCopyConfigs = async () => {
    if (selectedLotteries.length === 0) {
      toast.error('กรุณาเลือกหวยที่ต้องการคัดลอก config')
      return
    }

    setCopying(true)

    try {
      // Check for conflicts
      const conflicts = await checkConflicts()

      if (conflicts.length > 0 && overwriteMode === 'skip') {
        // Show warning and ask for confirmation
        const confirmMessage = `พบ config ที่มีอยู่แล้วใน ${conflicts.length} หวย\nต้องการข้ามหวยที่มี config อยู่แล้วใช่หรือไม่?`

        if (!confirm(confirmMessage)) {
          setCopying(false)
          return
        }
      }

      // Proceed with copying
      let successCount = 0
      let skipCount = 0
      let errorCount = 0

      for (const targetLotteryId of selectedLotteries) {
        try {
          const isConflict = conflictLotteries.includes(targetLotteryId)

          if (isConflict && overwriteMode === 'skip') {
            skipCount++
            continue
          }

          // Copy configs
          await adminHuayConfigAPI.copyConfigs(sourceLottery.id, targetLotteryId, overwriteMode === 'overwrite')
          successCount++
        } catch (error) {
          console.error(`Failed to copy config to lottery ${targetLotteryId}:`, error)
          errorCount++
        }
      }

      // Show result
      let message = `คัดลอก config สำเร็จ ${successCount} หวย`
      if (skipCount > 0) {
        message += `, ข้าม ${skipCount} หวย`
      }
      if (errorCount > 0) {
        message += `, ล้มเหลว ${errorCount} หวย`
        toast.error(message)
      } else {
        toast.success(message)
      }

      // Close modal on success
      if (errorCount === 0) {
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      console.error('Failed to copy configs:', error)
      toast.error('เกิดข้อผิดพลาดในการคัดลอก config')
    } finally {
      setCopying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border">
          <div className="flex items-center gap-3">
            <FiCopy className="text-gold-500 text-xl" />
            <div>
              <h3 className="text-xl font-semibold text-brown-100">คัดลอก Config</h3>
              <p className="text-sm text-brown-400 mt-1">
                คัดลอก config จาก {sourceLottery.huayName} ({sourceLottery.huayCode}) ไปยังหวยอื่น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brown-400 hover:text-brown-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 border-b border-admin-border bg-admin-bg/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหาชื่อหวย หรือรหัสหวย..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Overwrite Mode */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="overwriteMode"
                  value="skip"
                  checked={overwriteMode === 'skip'}
                  onChange={(e) => setOverwriteMode('skip')}
                  className="text-gold-500"
                />
                <span className="text-brown-300">ข้ามที่มีแล้ว</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="overwriteMode"
                  value="overwrite"
                  checked={overwriteMode === 'overwrite'}
                  onChange={(e) => setOverwriteMode('overwrite')}
                  className="text-gold-500"
                />
                <span className="text-brown-300">เขียนทับ</span>
              </label>
            </div>
          </div>

          {/* Select All */}
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="rounded border-admin-border text-gold-500 focus:ring-gold-500"
              />
              <span className="text-brown-300">เลือกทั้งหมด ({filteredLotteries.length} หวย)</span>
            </label>
            <span className="text-sm text-brown-400">
              เลือกแล้ว {selectedLotteries.length} หวย
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          ) : filteredLotteries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brown-400">ไม่พบหวย</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLotteries.map(lottery => (
                <label
                  key={lottery.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedLotteries.includes(lottery.id)
                      ? 'bg-gold-500/10 border-gold-500'
                      : 'bg-admin-hover border-admin-border hover:border-brown-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLotteries.includes(lottery.id)}
                    onChange={() => handleSelectLottery(lottery.id)}
                    className="rounded border-admin-border text-gold-500 focus:ring-gold-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-brown-100 font-medium truncate">{lottery.huayName}</p>
                    <p className="text-brown-400 text-sm">{lottery.huayCode}</p>
                    {conflictLotteries.includes(lottery.id) && (
                      <p className="text-warning text-xs mt-1 flex items-center gap-1">
                        <FiAlertTriangle size={12} />
                        มี config อยู่แล้ว
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    lottery.status
                      ? 'bg-success/10 text-success'
                      : 'bg-error/10 text-error'
                  }`}>
                    {lottery.status ? 'เปิด' : 'ปิด'}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-admin-border bg-admin-bg/50">
          {conflictLotteries.length > 0 && (
            <div className="flex items-center gap-2 text-warning">
              <FiAlertTriangle />
              <span className="text-sm">
                พบ {conflictLotteries.length} หวยที่มี config อยู่แล้ว
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-admin-border rounded-lg hover:bg-admin-hover transition-colors text-brown-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleCopyConfigs}
              disabled={copying || selectedLotteries.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-lg hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {copying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังคัดลอก...
                </>
              ) : (
                <>
                  <FiCopy />
                  คัดลอก Config
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CopyConfigModal