import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiArrowUp, FiArrowDown, FiDollarSign,
  FiClock, FiUser, FiFilter
} from 'react-icons/fi';
import { adminAPIClient } from '@/api/adminAPI';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

interface Transaction {
  id: string;
  type: string;
  amount: number;
  beforeBalance: number | null;
  afterBalance: number | null;
  status: string;
  remark: string | null;
  createdAt: string;
}

interface MemberInfo {
  id: string;
  phone: string;
  fullname: string;
  credit: number;
}

const AdminMemberTransactions: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [memberId]);

  const loadData = async () => {
    if (!memberId) return;

    try {
      setLoading(true);

      // Load member info
      const memberRes = await adminAPIClient.get(`/members/${memberId}`);
      if (memberRes.data.status === 'success' && memberRes.data.data) {
        setMember(memberRes.data.data.member);
      }

      // Load transactions
      const txRes = await adminAPIClient.get(`/members/${memberId}/transactions?limit=1000`);
      console.log('Transaction API Response:', txRes.data);

      // Handle both response formats
      let txList: Transaction[] = [];
      if (txRes.data.success && txRes.data.data) {
        // Backend format: { success: true, data: [...] }
        txList = Array.isArray(txRes.data.data) ? txRes.data.data : [];
      } else if (txRes.data.status === 'success' && txRes.data.data) {
        // Alternative format: { status: 'success', data: { transactions: [...] } }
        txList = txRes.data.data.transactions || [];
      }

      console.log('Transactions loaded:', txList.length);
      if (txList.length > 0) {
        console.log('First transaction:', txList[0]);
      }
      setTransactions(txList);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'DEPOSIT_BONUS':
        return <FiArrowDown className="text-success" />;
      case 'WITHDRAW':
        return <FiArrowUp className="text-error" />;
      default:
        return <FiDollarSign className="text-brown-400" />;
    }
  };

  const getTypeLabel = (type: string, amount: number) => {
    const labels: Record<string, string> = {
      'DEPOSIT': 'ฝากเงิน',
      'DEPOSIT_BONUS': 'โบนัสฝาก',
      'WITHDRAW': 'ถอนเงิน',
      'CASHBACK': 'คืนยอดเสีย',
      'PROMOTION': 'โปรโมชั่น',
      'CREDIT_ADJUSTMENT': amount >= 0 ? 'เพิ่มเครดิต' : 'ลดเครดิต',
      'ADJUSTMENT': amount >= 0 ? 'เพิ่มเครดิต' : 'ลดเครดิต',
      'LOTTERY_BET': 'แทงหวย',
      'LOTTERY_WIN': 'ถูกหวย',
      'GAME_BET': 'แทงเกม',
      'GAME_WIN': 'ชนะเกม',
      'TRANSFER_IN': 'โอนเข้า',
      'TRANSFER_OUT': 'โอนออก'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success border border-success/20">
            สำเร็จ
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning border border-warning/20">
            รอดำเนินการ
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-error/10 text-error border border-error/20">
            ยกเลิก
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-brown-500/10 text-brown-400 border border-brown-500/20">
            {status}
          </span>
        );
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/members/${memberId}`)}
            className="p-2 hover:bg-admin-hover rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 text-brown-400" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gold-500">
              ประวัติธุรกรรม
            </h1>
            {member && (
              <p className="text-brown-400 text-sm mt-1">
                {member.phone} - {member.fullname}
              </p>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <FiFilter className="text-brown-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-brown-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">ทั้งหมด</option>
            <option value="DEPOSIT">ฝากเงิน</option>
            <option value="WITHDRAW">ถอนเงิน</option>
            <option value="CASHBACK">คืนยอดเสีย</option>
            <option value="LOTTERY_BET">แทงหวย</option>
            <option value="LOTTERY_WIN">ถูกหวย</option>
            <option value="GAME_BET">แทงเกม</option>
            <option value="GAME_WIN">ชนะเกม</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-admin-card border border-admin-border rounded-xl overflow-hidden"
      >
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-brown-400">
            ไม่มีรายการธุรกรรม
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-300 uppercase">
                    วันที่/เวลา
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-300 uppercase">
                    ประเภท
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-300 uppercase">
                    จำนวน
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-300 uppercase">
                    ยอดก่อน
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brown-300 uppercase">
                    ยอดหลัง
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-brown-300 uppercase">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brown-300 uppercase">
                    หมายเหตุ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-brown-200">
                      <div className="flex items-center gap-2">
                        <FiClock className="text-brown-500" />
                        <div>
                          <div>{dayjs(tx.createdAt).format('DD/MM/YYYY')}</div>
                          <div className="text-xs text-brown-500">
                            {dayjs(tx.createdAt).format('HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="text-brown-200">{getTypeLabel(tx.type, tx.amount)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-bold ${
                        tx.amount >= 0
                          ? 'text-success'
                          : 'text-error'
                      }`}>
                        {Math.abs(tx.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-brown-400">
                      {tx.beforeBalance !== null
                        ? tx.beforeBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-brown-200 font-medium">
                      {tx.afterBalance !== null
                        ? tx.afterBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-brown-400 max-w-xs truncate">
                      {tx.remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminMemberTransactions;
