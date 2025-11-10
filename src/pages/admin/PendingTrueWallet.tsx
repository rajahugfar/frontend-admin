import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiLink,
  FiX,
} from 'react-icons/fi'
import { adminTransferAPI } from '@/api/adminAPI'

interface BankStatement {
  id: string
  transactionDate: string
  transactionId: string
  fromAccount: string
  fromBank: string
  fromName: string
  amount: number
  description: string
  referenceCode: string
  matched: boolean
  matchedWith?: string
  matchedAt?: string
  createdAt: string
}

interface PendingDeposit {
  id: string
  memberId: string
  memberPhone: string
  memberName: string
  amount: number
  bonusAmount: number
  gateway: string
  transferDate: string
  transferTime: string
  status: string
  createdAt: string
  suggestedMatches: string[] | null
}

const PendingTrueWallet: React.FC = () => {
  const [statements, setStatements] = useState<BankStatement[]>([])
  const [deposits, setDeposits] = useState<PendingDeposit[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [search, setSearch] = useState('')

  // Match Modal
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch both statements and deposits in parallel
      const [statementsRes, depositsRes] = await Promise.all([
        adminTransferAPI.getTrueWalletStatements({ limit: pageSize, offset: (page - 1) * pageSize }),
        adminTransferAPI.getPendingDepositsForTrueWallet({ limit: 50, offset: 0 }),
      ])

      setStatements(statementsRes.statements || [])
      setTotal(statementsRes.total || 0)
      setDeposits(depositsRes.deposits || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!selectedStatement || !selectedDeposit) {
      toast.error('กรุณาเลือกรายการฝากที่ต้องการจับคู่')
      return
    }

    try {
      await adminTransferAPI.matchTrueWalletDeposit({
        statementId: selectedStatement.id,
        depositId: selectedDeposit,
      })
      toast.success('จับคู่รายการสำเร็จ')
      setShowMatchModal(false)
      setSelectedStatement(null)
      setSelectedDeposit('')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleUnmatch = async (statementId: string) => {
    if (!confirm('คุณต้องการยกเลิกการจับคู่รายการนี้ใช่หรือไม่?')) {
      return
    }

    try {
      await adminTransferAPI.unmatchTrueWalletDeposit(statementId)
      toast.success('ยกเลิกการจับคู่สำเร็จ')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500">จับคู่รายการฝาก TrueWallet</h1>
          <p className="text-brown-400 mt-1">จับคู่รายการโอนเงินจากธนาคารกับรายการฝากที่รอดำเนินการ</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 disabled:opacity-50 transition-colors font-medium"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm font-medium">รายการธนาคารที่ยังไม่จับคู่</p>
              <p className="text-4xl font-bold text-gold-500 mt-2">{statements.filter((s) => !s.matched).length}</p>
            </div>
            <FiAlertCircle className="text-5xl text-gold-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm font-medium">รายการฝากที่รออนุมัติ</p>
              <p className="text-4xl font-bold text-success mt-2">{deposits.length}</p>
            </div>
            <FiCheckCircle className="text-5xl text-green-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-400 text-sm font-medium">ยอดรวมที่ยังไม่จับคู่</p>
              <p className="text-4xl font-bold text-purple-400 mt-2">
                ฿{formatCurrency(statements.filter((s) => !s.matched).reduce((sum, s) => sum + s.amount, 0))}
              </p>
            </div>
            <FiAlertCircle className="text-5xl text-purple-500/30" />
          </div>
        </div>
      </div>

      {/* Bank Statements Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-display font-bold text-gold-500">รายการโอนเงินจากธนาคาร TrueWallet</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            <span className="ml-4 text-brown-300 font-medium">กำลังโหลด...</span>
          </div>
        ) : statements.length === 0 ? (
          <div className="text-center py-20">
            <FiCheckCircle className="mx-auto text-6xl text-success mb-4" />
            <p className="text-brown-400 text-lg">ไม่พบรายการที่ยังไม่จับคู่</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-hover">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-500 uppercase tracking-wider">
                    วันที่/เวลา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-500 uppercase tracking-wider">
                    จาก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold-500 uppercase tracking-wider">
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gold-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gold-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {statements.map((statement) => (
                  <tr
                    key={statement.id}
                    className={`hover:bg-admin-hover transition-colors ${
                      statement.matched ? 'bg-green-500/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-200">
                      {formatDate(statement.transactionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brown-200">{statement.fromName}</div>
                      <div className="text-sm text-brown-400">
                        {statement.fromAccount} ({statement.fromBank})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gold-500">
                      ฿{formatCurrency(statement.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-300">
                      {statement.referenceCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {statement.matched ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30">
                          <FiCheckCircle />
                          จับคู่แล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-warning/20 text-warning border border-warning/30">
                          <FiAlertCircle />
                          รอจับคู่
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {statement.matched ? (
                        <button
                          onClick={() => handleUnmatch(statement.id)}
                          className="px-3 py-1.5 bg-error text-white text-xs font-medium rounded-lg hover:bg-error/80 transition-colors"
                        >
                          ยกเลิกการจับคู่
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedStatement(statement)
                            setShowMatchModal(true)
                          }}
                          className="px-3 py-1.5 bg-gold-500 text-brown-900 text-xs font-medium rounded-lg hover:bg-gold-600 transition-colors flex items-center gap-1 mx-auto"
                        >
                          <FiLink />
                          จับคู่
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="bg-admin-hover px-6 py-4 flex items-center justify-between border-t border-admin-border">
            <div>
              <p className="text-sm text-brown-300">
                แสดง <span className="font-medium text-gold-500">{(page - 1) * pageSize + 1}</span> ถึง{' '}
                <span className="font-medium text-gold-500">{Math.min(page * pageSize, total)}</span> จาก{' '}
                <span className="font-medium text-gold-500">{total}</span> รายการ
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-300 bg-admin-card hover:bg-admin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-300 bg-admin-card hover:bg-admin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {showMatchModal && selectedStatement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-brown-900">จับคู่รายการฝาก</h3>
              <button
                onClick={() => {
                  setShowMatchModal(false)
                  setSelectedStatement(null)
                  setSelectedDeposit('')
                }}
                className="text-brown-900 hover:text-brown-700 transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Selected Statement Info */}
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
                <h4 className="font-bold text-gold-500 mb-2">ข้อมูลการโอนเงิน</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-brown-400">จาก:</span>
                    <span className="ml-2 font-medium text-brown-200">{selectedStatement.fromName}</span>
                  </div>
                  <div>
                    <span className="text-brown-400">จำนวน:</span>
                    <span className="ml-2 font-bold text-gold-500">
                      ฿{formatCurrency(selectedStatement.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-brown-400">บัญชี:</span>
                    <span className="ml-2 text-brown-200">{selectedStatement.fromAccount}</span>
                  </div>
                  <div>
                    <span className="text-brown-400">ธนาคาร:</span>
                    <span className="ml-2 text-brown-200">{selectedStatement.fromBank}</span>
                  </div>
                </div>
              </div>

              {/* Pending Deposits List */}
              <div>
                <h4 className="font-bold text-brown-200 mb-3">เลือกรายการฝากที่ต้องการจับคู่</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {deposits
                    .filter((d) => Math.abs(d.amount - selectedStatement.amount) <= 5)
                    .map((deposit) => (
                      <label
                        key={deposit.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedDeposit === deposit.id
                            ? 'border-gold-500 bg-gold-500/10'
                            : 'border-admin-border hover:border-gold-500/50 hover:bg-admin-hover'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deposit"
                          value={deposit.id}
                          checked={selectedDeposit === deposit.id}
                          onChange={(e) => setSelectedDeposit(e.target.value)}
                          className="mr-3 accent-gold-500"
                        />
                        <div className="inline-block">
                          <div className="font-medium text-brown-200">
                            {deposit.memberName} ({deposit.memberPhone})
                          </div>
                          <div className="text-sm text-brown-400">
                            จำนวน: <span className="text-gold-500 font-semibold">฿{formatCurrency(deposit.amount)}</span> • สถานะ: {deposit.status}
                          </div>
                        </div>
                      </label>
                    ))}

                  {deposits.filter((d) => Math.abs(d.amount - selectedStatement.amount) <= 5).length === 0 && (
                    <p className="text-center text-brown-400 py-8">
                      ไม่พบรายการฝากที่ตรงกับจำนวนเงินนี้ (±5 บาท)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-admin-hover px-6 py-4 flex justify-end gap-3 border-t border-admin-border">
              <button
                onClick={() => {
                  setShowMatchModal(false)
                  setSelectedStatement(null)
                  setSelectedDeposit('')
                }}
                className="px-6 py-2 border border-admin-border rounded-lg text-brown-300 font-medium hover:bg-admin-card transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleMatch}
                disabled={!selectedDeposit}
                className="px-6 py-2 bg-gold-500 text-brown-900 rounded-lg font-medium hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                จับคู่รายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingTrueWallet
