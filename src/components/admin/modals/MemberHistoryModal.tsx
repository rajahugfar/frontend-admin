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
  type: string
  amount: number
  status: string
  createdAt: string
  remark?: string
  method?: string
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
    const statusLower = status.toLowerCase()
    const badges: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-success/10 text-success border-success/20',
      success: 'bg-success/10 text-success border-success/20',
      completed: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-error/10 text-error border-error/20',
      cancelled: 'bg-brown-500/10 text-brown-400 border-brown-500/20',
    }
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      approved: 'อนุมัติ',
      success: 'สำเร็จ',
      completed: 'สำเร็จ',
      rejected: 'ปฏิเสธ',
      cancelled: 'ยกเลิก',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[statusLower] || 'bg-brown-500/10 text-brown-400'}`}>
        {labels[statusLower] || status}
      </span>
    )
  }

  const getTypeInfo = (type: string, amount: number) => {
    // Check by amount for CREDIT_ADJUSTMENT
    if (type === 'CREDIT_ADJUSTMENT' || type === 'ADJUSTMENT') {
      if (amount >= 0) {
        return {
          label: 'เพิ่มเครดิต',
          color: 'text-success',
          sign: '',
          isDeposit: true,
        }
      } else {
        return {
          label: 'ลดเครดิต',
          color: 'text-error',
          sign: '',
          isDeposit: false,
        }
      }
    }

    // Other types
    const types: Record<string, any> = {
      'DEPOSIT': { label: 'ฝากเงิน', color: 'text-success', sign: '', isDeposit: true },
      'WITHDRAW': { label: 'ถอนเงิน', color: 'text-error', sign: '', isDeposit: false },
      'deposit': { label: 'ฝากเงิน', color: 'text-success', sign: '', isDeposit: true },
      'withdrawal': { label: 'ถอนเงิน', color: 'text-error', sign: '', isDeposit: false },
    }

    return types[type] || {
      label: type,
      color: 'text-brown-200',
      sign: '',
      isDeposit: amount >= 0,
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    const typeInfo = getTypeInfo(tx.type, tx.amount)
    if (filter === 'deposit') return typeInfo.isDeposit
    if (filter === 'withdrawal') return !typeInfo.isDeposit
    return false
  })

  const depositCount = transactions.filter(tx => getTypeInfo(tx.type, tx.amount).isDeposit).length
  const withdrawalCount = transactions.filter(tx => !getTypeInfo(tx.type, tx.amount).isDeposit).length

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-gold-500">ประวัติการเติมเงิน/ถอนเงิน</h2>
            <p className="text-brown-400 text-sm mt-1">
              {member.phone} - {member.fullname}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-admin-hover rounded transition-colors">
            <FiX className="w-6 h-6 text-brown-400" />
          </button>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-admin-border bg-admin-bg">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gold-500 text-white'
                    : 'bg-admin-card text-brown-200 border border-admin-border hover:bg-admin-hover'
                }`}
              >
                ทั้งหมด ({transactions.length})
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'deposit'
                    ? 'bg-success text-white'
                    : 'bg-admin-card text-brown-200 border border-admin-border hover:bg-admin-hover'
                }`}
              >
                ฝากเงิน ({depositCount})
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'withdrawal'
                    ? 'bg-error text-white'
                    : 'bg-admin-card text-brown-200 border border-admin-border hover:bg-admin-hover'
                }`}
              >
                ถอนเงิน ({withdrawalCount})
              </button>
            </div>
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="ml-auto p-2 hover:bg-admin-hover rounded-lg transition-colors disabled:opacity-50 text-brown-300"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiRefreshCw className="w-8 h-8 animate-spin text-brown-500" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-brown-400">ไม่พบประวัติธุรกรรม</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-admin-bg border-b border-admin-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown-300 uppercase">
                      วันที่/เวลา
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown-300 uppercase">
                      ประเภท
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-brown-300 uppercase">
                      จำนวนเงิน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown-300 uppercase">
                      สถานะ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown-300 uppercase">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {filteredTransactions.map((tx) => {
                    const typeInfo = getTypeInfo(tx.type, tx.amount)
                    return (
                      <tr key={tx.id} className="hover:bg-admin-hover">
                        <td className="px-4 py-3 text-sm text-brown-200">
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
                            {formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(tx.status)}</td>
                        <td className="px-4 py-3 text-sm text-brown-400">
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
          <div className="px-6 py-4 border-t border-admin-border bg-admin-bg">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-brown-400">ฝากเงินทั้งหมด</div>
                <div className="text-lg font-bold text-success">
                  {formatCurrency(
                    transactions
                      .filter((t) => {
                        const typeInfo = getTypeInfo(t.type, t.amount)
                        return typeInfo.isDeposit && (t.status === 'approved' || t.status === 'success' || t.status === 'completed')
                      })
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-brown-400">ถอนเงินทั้งหมด</div>
                <div className="text-lg font-bold text-error">
                  {formatCurrency(
                    transactions
                      .filter((t) => {
                        const typeInfo = getTypeInfo(t.type, t.amount)
                        return !typeInfo.isDeposit && (t.status === 'approved' || t.status === 'success' || t.status === 'completed')
                      })
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-brown-400">ยอดรวม</div>
                <div className="text-lg font-bold text-gold-500">
                  {formatCurrency(
                    transactions
                      .filter((t) => t.status === 'approved' || t.status === 'success' || t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-admin-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-admin-card border border-admin-border text-brown-200 rounded-lg hover:border-gold-500/50 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
