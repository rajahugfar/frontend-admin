import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { FaEdit, FaEye, FaTimes, FaHistory } from 'react-icons/fa'

interface EditLog {
  id: number
  stockId: number
  stockName: string
  action: string
  oldResult3Top: string | null
  oldResult2Top: string | null
  oldResult2Bottom: string | null
  newResult3Top: string | null
  newResult2Top: string | null
  newResult2Bottom: string | null
  totalWinners: number
  totalReversedAmount: number
  createdAt: string
}

interface ReverseLog {
  id: number
  stockId: number
  memberId: string
  username: string
  poyId: string
  poyItemId: string
  reversedAmount: number
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export default function LotteryEditLogs() {
  const [editLogs, setEditLogs] = useState<EditLog[]>([])
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null)
  const [reverseLogs, setReverseLogs] = useState<ReverseLog[]>([])
  const [loading, setLoading] = useState(true)
  const [reverseLoading, setReverseLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEditLogs()
  }, [])

  const fetchEditLogs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/lottery/daily/edit-logs?limit=100&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setEditLogs(response.data.data.logs || [])
    } catch (error) {
      console.error('Failed to fetch edit logs:', error)
      alert('ไม่สามารถโหลดประวัติการแก้ไขได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchReverseLogs = async (stockId: number) => {
    setReverseLoading(true)
    setSelectedStockId(stockId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/lottery/daily/${stockId}/reverse-logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setReverseLogs(response.data.data.logs || [])
      setShowModal(true)
    } catch (error) {
      console.error('Failed to fetch reverse logs:', error)
      alert('ไม่สามารถโหลดรายละเอียดการดึงเงินคืนได้')
    } finally {
      setReverseLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black flex justify-center items-center">
        <div className="text-xl text-gold-400">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-2xl shadow-2xl p-8 mb-8 border border-gold-300">
        <h1 className="text-3xl font-bold text-brown-900 mb-2 flex items-center gap-3">
          <FaHistory className="text-4xl" />
          ประวัติการแก้ไขผลหวย
        </h1>
        <p className="text-brown-800 mt-1">
          บันทึกทุกครั้งที่มีการแก้ไขผลหวยและดึงเงินรางวัลคืน
        </p>
      </div>

      {editLogs.length === 0 ? (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border p-8 text-center">
          <FaEdit className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">ไม่มีประวัติการแก้ไขหวย</p>
        </div>
      ) : (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    วันที่แก้ไข
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    ชื่อหวย
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    3 ตัวบน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    2 ตัวบน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    2 ตัวล่าง
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    ดึงเงินคืน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-400 uppercase tracking-wider">
                    การกระทำ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {editLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {log.stockName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">{log.oldResult3Top || '-'}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400 font-semibold">{log.newResult3Top || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">{log.oldResult2Top || '-'}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400 font-semibold">{log.newResult2Top || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">{log.oldResult2Bottom || '-'}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400 font-semibold">{log.newResult2Bottom || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-red-400 font-bold text-base">
                        -{log.totalReversedAmount.toLocaleString()} ฿
                      </div>
                      <div className="text-xs text-gray-400">{log.totalWinners} คน</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => fetchReverseLogs(log.stockId)}
                        disabled={reverseLoading && selectedStockId === log.stockId}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-brown-900 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        <FaEye />
                        {reverseLoading && selectedStockId === log.stockId ? 'กำลังโหลด...' : 'ดูรายละเอียด'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal แสดงรายละเอียดการดึงเงินคืน */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-gold-500/50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 p-6 border-b border-admin-border flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold-400 flex items-center gap-3">
                <FaHistory className="text-3xl" />
                รายละเอียดการดึงเงินรางวัลคืน
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setReverseLogs([])
                  setSelectedStockId(null)
                }}
                className="text-gray-400 hover:text-red-400 transition-colors text-3xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {reverseLogs.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <FaEdit className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>ไม่มีข้อมูลการดึงเงินคืน</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/40 rounded-xl p-4 border border-red-500/30">
                      <div className="text-sm text-gray-400 mb-1">ยอดเงินรวมที่ดึงคืน</div>
                      <div className="text-3xl font-bold text-red-400">
                        {reverseLogs.reduce((sum, log) => sum + log.reversedAmount, 0).toLocaleString()} ฿
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-gold-500/30">
                      <div className="text-sm text-gray-400 mb-1">จำนวนสมาชิกที่ได้รับผลกระทบ</div>
                      <div className="text-3xl font-bold text-gold-400">{reverseLogs.length} คน</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-admin-border">
                      <thead className="bg-black/40">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gold-400 uppercase">
                            ผู้ใช้งาน
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gold-400 uppercase">
                            ยอดเงินก่อน
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gold-400 uppercase">
                            ดึงคืน
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gold-400 uppercase">
                            ยอดเงินหลัง
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gold-400 uppercase">
                            วันที่
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-admin-border">
                        {reverseLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-black/20 transition-colors">
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-white">{log.username}</div>
                              <div className="text-xs text-gray-500">{log.memberId.slice(0, 8)}...</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-300">
                              {log.balanceBefore.toLocaleString()} ฿
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className="text-red-400 font-bold">
                                -{log.reversedAmount.toLocaleString()} ฿
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-300">
                              {log.balanceAfter.toLocaleString()} ฿
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
