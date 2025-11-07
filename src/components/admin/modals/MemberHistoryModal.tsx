import { useState, useEffect } from 'react'
import { FiX, FiRefreshCw } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  status: string
  createdAt: string
  remark?: string
}

interface MemberHistoryModalProps {
  isOpen: boolean
  member: Member | null
  onClose: () => void
}

export default function MemberHistoryModal({ isOpen, member, onClose }: MemberHistoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all')

  useEffect(() => {
    if (isOpen && member) {
      fetchTransactions()
    }
  }, [isOpen, member])

  const fetchTransactions = async () => {
    if (!member) return

    try {
      setLoading(true)
      const response = await adminMemberAPI.getMemberTransactions(member.id, 1, 100)
      setTransactions(response.transactions || [])
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error)
      toast.error('ไม่สามารถโหลดประวัติธุรกรรมได้')
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      approved: 'อนุมัติ',
      success: 'สำเร็จ',
      rejected: 'ปฏิเสธ',
      cancelled: 'ยกเลิก',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getTypeInfo = (type: string) => {
    if (type === 'deposit') {
      return {
        label: 'ฝากเงิน',
        color: 'text-green-600',
        sign: '+',
      }
    }
    return {
      label: 'ถอนเงิน',
      color: 'text-red-600',
      sign: '-',
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ประวัติการเติมเงิน/ถอนเงิน</h2>
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
                ทั้งหมด ({transactions.length})
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'deposit'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ฝากเงิน ({transactions.filter((t) => t.type === 'deposit').length})
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'withdrawal'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ถอนเงิน ({transactions.filter((t) => t.type === 'withdrawal').length})
              </button>
            </div>
            <button
              onClick={fetchTransactions}
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
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">ไม่พบประวัติธุรกรรม</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      วันที่/เวลา
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      ประเภท
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      จำนวนเงิน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      สถานะ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => {
                    const typeInfo = getTypeInfo(tx.type)
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`font-medium ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-semibold ${typeInfo.color}`}>
                            {typeInfo.sign} {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(tx.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tx.remark || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">ฝากเงินทั้งหมด</div>
                <div className="text-lg font-bold text-green-600">
                  +{' '}
                  {formatCurrency(
                    transactions
                      .filter((t) => t.type === 'deposit' && t.status === 'approved')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">ถอนเงินทั้งหมด</div>
                <div className="text-lg font-bold text-red-600">
                  -{' '}
                  {formatCurrency(
                    transactions
                      .filter((t) => t.type === 'withdrawal' && t.status === 'approved')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">ยอดรวม</div>
                <div className="text-lg font-bold text-[#C4A962]">
                  {formatCurrency(
                    transactions
                      .filter((t) => t.status === 'approved')
                      .reduce((sum, t) => {
                        return t.type === 'deposit' ? sum + t.amount : sum - t.amount
                      }, 0)
                  )}
                </div>
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
