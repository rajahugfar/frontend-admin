import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

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
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ประวัติการแก้ไขผลหวย</h1>
        <p className="text-gray-600 mt-1">
          บันทึกทุกครั้งที่มีการแก้ไขผลหวยและดึงเงินรางวัลคืน
        </p>
      </div>

      {editLogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          ไม่มีประวัติการแก้ไขหวย
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่แก้ไข
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อหวย
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  3 ตัวบน (เก่า → ใหม่)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2 ตัวบน (เก่า → ใหม่)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2 ตัวล่าง (เก่า → ใหม่)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ดึงเงินคืน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.stockName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-red-600">{log.oldResult3Top || '-'}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-600 font-semibold">{log.newResult3Top || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-red-600">{log.oldResult2Top || '-'}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-600 font-semibold">{log.newResult2Top || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-red-600">{log.oldResult2Bottom || '-'}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-600 font-semibold">{log.newResult2Bottom || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-red-600 font-semibold">
                      -{log.totalReversedAmount.toLocaleString()} ฿
                    </div>
                    <div className="text-xs text-gray-500">{log.totalWinners} คน</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => fetchReverseLogs(log.stockId)}
                      className="text-blue-600 hover:text-blue-800 underline"
                      disabled={reverseLoading && selectedStockId === log.stockId}
                    >
                      {reverseLoading && selectedStockId === log.stockId ? 'กำลังโหลด...' : 'ดูรายละเอียด'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal แสดงรายละเอียดการดึงเงินคืน */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">รายละเอียดการดึงเงินรางวัลคืน</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setReverseLogs([])
                  setSelectedStockId(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {reverseLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">ไม่มีข้อมูลการดึงเงินคืน</div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">
                      ยอดเงินรวมที่ดึงคืน:{' '}
                      <span className="font-semibold text-red-600">
                        {reverseLogs.reduce((sum, log) => sum + log.reversedAmount, 0).toLocaleString()} ฿
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      จำนวนสมาชิก: <span className="font-semibold">{reverseLogs.length} คน</span>
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          ผู้ใช้งาน
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          ยอดเงินก่อน
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          ดึงคืน
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          ยอดเงินหลัง
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          วันที่
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reverseLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">
                            <div className="font-medium text-gray-900">{log.username}</div>
                            <div className="text-xs text-gray-500">{log.memberId.slice(0, 8)}...</div>
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {log.balanceBefore.toLocaleString()} ฿
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            <span className="text-red-600 font-semibold">
                              -{log.reversedAmount.toLocaleString()} ฿
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {log.balanceAfter.toLocaleString()} ฿
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
