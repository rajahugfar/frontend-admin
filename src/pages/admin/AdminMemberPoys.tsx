import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiList, FiDollarSign, FiTrendingUp, FiTrendingDown,
  FiCheckCircle, FiBarChart2, FiEye
} from 'react-icons/fi';
import { adminAPIClient } from '@/api/adminAPI';
import toast from 'react-hot-toast';

interface Poy {
  id: string;
  stockId: number;
  memberId: string;
  huayId: number;
  poyType: string;
  poyName: string;
  poyNumber: string;
  dateBuy: string;
  createDate: string;
  totalPrice: number;
  winPrice: number;
  balanceAfter: number;
  huayTime: string;
  note: string;
  dateCancel?: string;
  cancelNote?: string;
  status: number; // 0=cancelled, 1=pending, 2=processed
}

interface PoyStatistics {
  totalPoys: number;
  totalBets: number;
  totalWins: number;
  netProfit: number;
  activePoys: number;
  cancelledPoys: number;
  completedPoys: number;
}

interface PoyData {
  poys: Poy[];
  statistics: PoyStatistics;
  pagination: {
    limit: number;
    offset: number;
  };
}

const AdminMemberPoys: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PoyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadPoyData();
  }, [memberId, filterStatus]);

  const loadPoyData = async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await adminAPIClient.get(`/members/${memberId}/poys`, { params });
      if (response.data.status === 'success' && response.data.data) {
        // Ensure we have default values for statistics
        const responseData = response.data.data;
        setData({
          poys: responseData.poys || [],
          statistics: responseData.statistics || {
            totalPoys: 0,
            totalBets: 0,
            totalWins: 0,
            netProfit: 0,
            activePoys: 0,
            cancelledPoys: 0,
            completedPoys: 0
          },
          pagination: responseData.pagination || { limit: 50, offset: 0 }
        });
      } else {
        // Set empty data if no response
        setData({
          poys: [],
          statistics: {
            totalPoys: 0,
            totalBets: 0,
            totalWins: 0,
            netProfit: 0,
            activePoys: 0,
            cancelledPoys: 0,
            completedPoys: 0
          },
          pagination: { limit: 50, offset: 0 }
        });
      }
    } catch (error: any) {
      console.error('Failed to load member poys:', error);
      toast.error('ไม่สามารถโหลดข้อมูลโพยหวยได้');
      // Set empty data on error to prevent crashes
      setData({
        poys: [],
        statistics: {
          totalPoys: 0,
          totalBets: 0,
          totalWins: 0,
          netProfit: 0,
          activePoys: 0,
          cancelledPoys: 0,
          completedPoys: 0
        },
        pagination: { limit: 50, offset: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(amount);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-400/30 rounded-lg text-red-300 font-semibold text-xs">
            ยกเลิก
          </span>
        );
      case 1:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-400/30 rounded-lg text-yellow-300 font-semibold text-xs">
            รอผล
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg text-green-300 font-semibold text-xs">
            ประกาศผล
          </span>
        );
      default:
        return null;
    }
  };

  const getPoyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'g': 'รัฐบาล',
      'o': 'หุ้นไทย',
      'b': 'หุ้นต่างประเทศ',
      's': 'พิเศษ',
      'y': 'ยี่กี'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-5xl text-gold-400"
        >
          <FiList />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl text-white mb-2">ไม่พบข้อมูลโพยหวย</h2>
          <button
            onClick={() => navigate(`/admin/members/${memberId}`)}
            className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-brown-900 font-bold rounded-lg hover:shadow-lg hover:shadow-gold-500/50 transition-all"
          >
            กลับหน้าสมาชิก
          </button>
        </div>
      </div>
    );
  }

  const { poys = [], statistics } = data || { poys: [], statistics: { totalPoys: 0, totalBets: 0, totalWins: 0, netProfit: 0, activePoys: 0, cancelledPoys: 0, completedPoys: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(`/admin/members/${memberId}`)}
              className="flex items-center gap-2 text-gray-300 hover:text-gold-400 transition-colors mb-4"
            >
              <FiArrowLeft className="text-xl" />
              <span>กลับหน้าสมาชิก</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
                  โพยหวย
                </h1>
                <p className="text-gray-400 mt-1">รายการโพยหวยทั้งหมดของสมาชิก</p>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Total Bets */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-gold-500/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiDollarSign className="text-3xl text-gold-400" />
                <FiTrendingDown className="text-xl text-gold-400/50" />
              </div>
              <p className="text-gray-400 text-sm mb-1">ยอดแทงรวม</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(statistics.totalBets)}</p>
              <p className="text-gray-500 text-xs mt-1">{statistics.totalPoys} โพย</p>
            </div>

            {/* Total Wins */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-success/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiTrendingUp className="text-3xl text-success" />
                <FiCheckCircle className="text-xl text-success/50" />
              </div>
              <p className="text-gray-400 text-sm mb-1">ยอดชนะรวม</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(statistics.totalWins)}</p>
              <p className="text-gray-500 text-xs mt-1">บาท</p>
            </div>

            {/* Net Profit */}
            <div className={`bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border ${statistics.netProfit >= 0 ? 'border-success/30' : 'border-danger/30'} p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <FiBarChart2 className={`text-3xl ${statistics.netProfit >= 0 ? 'text-success' : 'text-danger'}`} />
              </div>
              <p className="text-gray-400 text-sm mb-1">กำไร/ขาดทุน</p>
              <p className={`font-bold text-2xl ${statistics.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {statistics.netProfit >= 0 ? '+' : ''}{formatCurrency(statistics.netProfit)}
              </p>
              <p className="text-gray-500 text-xs mt-1">บาท</p>
            </div>

            {/* Status Summary */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-info/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiList className="text-3xl text-info" />
              </div>
              <p className="text-gray-400 text-sm mb-2">สรุปสถานะ</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-400">รอผล:</span>
                  <span className="text-white font-bold">{statistics.activePoys}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">ประกาศผล:</span>
                  <span className="text-white font-bold">{statistics.completedPoys}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">ยกเลิก:</span>
                  <span className="text-white font-bold">{statistics.cancelledPoys}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex gap-2"
          >
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === ''
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-brown-900'
                  : 'bg-admin-card text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              ทั้งหมด ({statistics.totalPoys})
            </button>
            <button
              onClick={() => setFilterStatus('1')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === '1'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                  : 'bg-admin-card text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              รอผล ({statistics.activePoys})
            </button>
            <button
              onClick={() => setFilterStatus('2')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === '2'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-admin-card text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              ประกาศผล ({statistics.completedPoys})
            </button>
            <button
              onClick={() => setFilterStatus('0')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === '0'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                  : 'bg-admin-card text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              ยกเลิก ({statistics.cancelledPoys})
            </button>
          </motion.div>

          {/* Poy List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-admin-card via-admin-darker to-admin-card backdrop-blur-xl rounded-2xl border border-gold-500/30 overflow-hidden shadow-2xl shadow-gold-500/20"
          >
            <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-3 px-6 border-b border-gold-400/30">
              <div className="flex items-center gap-2 text-brown-900">
                <FiList className="text-xl" />
                <span className="text-lg font-bold">รายการโพยหวย</span>
              </div>
            </div>

            {poys.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-400 text-lg">ไม่พบรายการโพยหวย</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-admin-darker/50 border-b border-gold-500/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        เลขที่โพย
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        ชื่อหวย
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        ยอดแทง
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        ยอดชนะ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        วันที่แทง
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gold-400 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {poys.map((poy, index) => (
                      <motion.tr
                        key={poy.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-admin-darker/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="text-white font-mono text-sm">{poy.poyNumber}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-300 text-sm">{poy.poyName}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-info/20 border border-info/30 rounded text-info text-xs font-medium">
                            {getPoyTypeLabel(poy.poyType)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-white font-bold">{formatCurrency(poy.totalPrice)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-bold ${poy.winPrice > 0 ? 'text-success' : 'text-gray-500'}`}>
                            {formatCurrency(poy.winPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-400 text-xs">{formatDate(poy.dateBuy)}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getStatusBadge(poy.status)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => navigate(`/admin/poy/${poy.id}`)}
                            className="p-2 bg-gold-500/20 hover:bg-gold-500/30 rounded-lg text-gold-400 transition-all group"
                            title="ดูรายละเอียด"
                          >
                            <FiEye className="group-hover:scale-110 transition-transform" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberPoys;
