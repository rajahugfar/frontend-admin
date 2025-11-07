import { useState, useEffect } from 'react'
import { FiX, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { adminMemberAPI } from '@/api/adminAPI'

interface Member {
  id: string
  phone: string
  fullname: string | null
}

interface GameHistory {
  betId: string
  gameCode: string
  gameName: string
  betAmount: number
  winAmount: number
  profitLoss: number
  betTime: string
  settleTime: string
  status: string
}

interface MemberGameHistoryModalProps {
  isOpen: boolean
  member: Member | null
  onClose: () => void
}

export default function MemberGameHistoryModal({
  isOpen,
  member,
  onClose,
}: MemberGameHistoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [filter, setFilter] = useState<'all' | 'win' | 'lose'>('all')

  useEffect(() => {
    if (isOpen && member) {
      fetchGameHistory()
    }
  }, [isOpen, member])

  const fetchGameHistory = async () => {
    if (!member) return

    try {
      setLoading(true)

      // Get last 7 days of game history
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)

      const response = await adminMemberAPI.getMemberGameHistory(member.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 100,
        offset: 0,
      })

      setGameHistory(response.records || [])

      if (!response.records || response.records.length === 0) {
        toast.info('ยังไม่มีข้อมูลประวัติเกม 7 วันย้อนหลัง')
      }
    } catch (error: any) {
      console.error('Failed to fetch game history:', error)
      toast.error('ไม่สามารถโหลดประวัติเกมได้')
      setGameHistory([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const filteredHistory = gameHistory.filter((game) => {
    if (filter === 'all') return true
    if (filter === 'win') return game.profitLoss > 0
    if (filter === 'lose') return game.profitLoss < 0
    return true
  })

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ประวัติเกม</h2>
            <p className="text-sm text-gray-600 mt-1">
              {member.phone} - {member.fullname}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#C4A962] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ทั้งหมด ({gameHistory.length})
              </button>
              <button
                onClick={() => setFilter('win')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'win'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ชนะ ({gameHistory.filter((g) => g.profitLoss > 0).length})
              </button>
              <button
                onClick={() => setFilter('lose')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'lose'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                แพ้ ({gameHistory.filter((g) => g.profitLoss < 0).length})
              </button>
            </div>
            <button
              onClick={fetchGameHistory}
              disabled={loading}
              className="ml-auto p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiRefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎮</div>
              <p className="text-gray-500">ไม่พบประวัติเกม</p>
              <p className="text-sm text-gray-400 mt-2">
                ยังไม่มีการเล่นเกมหรือยังไม่ได้เชื่อมต่อกับ Game Provider
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      วันที่/เวลา
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      เกม
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      ค่าย
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      เดิมพัน
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      ชนะ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      กำไร/ขาดทุน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((game) => (
                    <tr key={game.betId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(game.betTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{game.gameName || game.gameCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{game.gameCode}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatCurrency(game.betAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatCurrency(game.winAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={`font-semibold ${
                            game.profitLoss > 0
                              ? 'text-green-600'
                              : game.profitLoss < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {game.profitLoss > 0 ? '+' : ''}
                          {formatCurrency(game.profitLoss)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          {game.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredHistory.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">ยอดเดิมพันรวม</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(gameHistory.reduce((sum, g) => sum + g.betAmount, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">ยอดชนะรวม</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(gameHistory.reduce((sum, g) => sum + g.winAmount, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">กำไร/ขาดทุน</div>
                <div
                  className={`text-lg font-bold ${
                    gameHistory.reduce((sum, g) => sum + g.profitLoss, 0) > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {gameHistory.reduce((sum, g) => sum + g.profitLoss, 0) > 0 ? '+' : ''}
                  {formatCurrency(gameHistory.reduce((sum, g) => sum + g.profitLoss, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">จำนวนเกม</div>
                <div className="text-lg font-bold text-[#C4A962]">{gameHistory.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
