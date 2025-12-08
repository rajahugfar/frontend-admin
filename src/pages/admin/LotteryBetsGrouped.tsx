import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminPoyAPI, PoyHeader } from '@/api/adminPoyAPI';
import {
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaTicketAlt,
  FaCoins,
  FaMoneyBillWave,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaTrophy
} from 'react-icons/fa';

interface LotteryGroup {
  stock_id: number;
  stock_name: string;
  huay_code: string;
  huay_time: string;
  stock_status: number;
  poys: PoyHeader[];
  totalPoys: number;
  totalBets: number;
  totalWins: number;
  netProfit: number;
  activePoys: number;
  completedPoys: number;
  cancelledPoys: number;
}

const LotteryBetsGrouped: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<LotteryGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminPoyAPI.getAllPoys({
        date: selectedDate,
        limit: 10000, // Get all for grouping
        offset: 0
      });

      if (response.status === 'success' && response.data) {
        groupPoysByLottery(response.data.poys);
      }
    } catch (error) {
      console.error('Failed to fetch poys:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get field value from both camelCase and snake_case
  const getField = (obj: any, camelCase: string, snake_case: string) => {
    return obj[camelCase] ?? obj[snake_case];
  };

  const groupPoysByLottery = (poys: PoyHeader[]) => {
    const grouped = new Map<number, LotteryGroup>();

    poys.forEach((poy) => {
      const stockId = getField(poy, 'stockId', 'stock_id');
      if (!grouped.has(stockId)) {
        grouped.set(stockId, {
          stock_id: stockId,
          stock_name: getField(poy, 'stockName', 'stockName') || getField(poy, 'note', 'note') || 'ไม่ระบุ',
          huay_code: getField(poy, 'huayCode', 'huay_code') || '',
          huay_time: getField(poy, 'huayTime', 'huay_time') || '',
          stock_status: poy.status,
          poys: [],
          totalPoys: 0,
          totalBets: 0,
          totalWins: 0,
          netProfit: 0,
          activePoys: 0,
          completedPoys: 0,
          cancelledPoys: 0
        });
      }

      const group = grouped.get(stockId)!;
      group.poys.push(poy);
      group.totalPoys++;
      group.totalBets += parseFloat(getField(poy, 'totalPrice', 'totalprice')?.toString() || '0');
      group.totalWins += parseFloat(getField(poy, 'winPrice', 'win_price')?.toString() || '0');

      if (poy.status === 1) group.activePoys++;
      else if (poy.status === 2) group.completedPoys++;
      else if (poy.status === 0) group.cancelledPoys++;
    });

    // Calculate net profit for each group
    grouped.forEach((group) => {
      group.netProfit = group.totalBets - group.totalWins;
    });

    // Sort by huay_time
    const sortedGroups = Array.from(grouped.values()).sort((a, b) => {
      return a.huay_time.localeCompare(b.huay_time);
    });

    setGroups(sortedGroups);

    // Auto expand first group
    if (sortedGroups.length > 0) {
      setExpandedGroups(new Set([sortedGroups[0].stock_id]));
    }
  };

  const toggleGroup = (stockId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(stockId)) {
      newExpanded.delete(stockId);
    } else {
      newExpanded.add(stockId);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groups.map(g => g.stock_id)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      const localDateString = dateString.replace('Z', '+07:00');
      const date = new Date(localDateString);
      return new Intl.DateTimeFormat('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return new Intl.DateTimeFormat('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok',
      }).format(date);
    } catch {
      return timeString;
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="px-2 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium flex items-center gap-1">
            <FaClock className="text-xs" /> รอผล
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-1 bg-success/20 text-success rounded-full text-xs font-medium flex items-center gap-1">
            <FaCheckCircle className="text-xs" /> ประกาศผล
          </span>
        );
      case 0:
        return (
          <span className="px-2 py-1 bg-error/20 text-error rounded-full text-xs font-medium flex items-center gap-1">
            <FaBan className="text-xs" /> ยกเลิก
          </span>
        );
      default:
        return null;
    }
  };

  const filteredGroups = groups.filter(group => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.stock_name.toLowerCase().includes(query) ||
      group.poys.some(poy =>
        poy.poy_number?.toLowerCase().includes(query) ||
        poy.member_id?.toLowerCase().includes(query)
      )
    );
  });

  // Calculate overall statistics
  const overallStats = filteredGroups.reduce((acc, group) => {
    acc.totalPoys += group.totalPoys;
    acc.totalBets += group.totalBets;
    acc.totalWins += group.totalWins;
    acc.netProfit += group.netProfit;
    acc.activePoys += group.activePoys;
    acc.completedPoys += group.completedPoys;
    acc.cancelledPoys += group.cancelledPoys;
    return acc;
  }, {
    totalPoys: 0,
    totalBets: 0,
    totalWins: 0,
    netProfit: 0,
    activePoys: 0,
    completedPoys: 0,
    cancelledPoys: 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-2xl shadow-2xl p-8 mb-8 border border-gold-300">
        <h1 className="text-3xl font-bold text-brown-900 mb-2 flex items-center gap-3">
          <FaTicketAlt className="text-4xl" />
          รายการโพยแบ่งตามหวย
        </h1>
        <p className="text-brown-700 text-lg">ดูรายการโพยแยกตามงวดหวยแต่ละงวด พร้อมสรุปยอด</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">งวดทั้งหมด</span>
            <FaTrophy className="text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white">{filteredGroups.length}</div>
          <div className="text-xs text-gray-500">งวด</div>
        </div>

        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">โพยทั้งหมด</span>
            <FaTicketAlt className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{overallStats.totalPoys}</div>
          <div className="text-xs text-gray-500">โพย</div>
        </div>

        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">รอผล</span>
            <FaClock className="text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning">{overallStats.activePoys}</div>
          <div className="text-xs text-gray-500">โพย</div>
        </div>

        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">ประกาศผล</span>
            <FaCheckCircle className="text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{overallStats.completedPoys}</div>
          <div className="text-xs text-gray-500">โพย</div>
        </div>

        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">ยอดแทง</span>
            <FaCoins className="text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white">{formatCurrency(overallStats.totalBets)}</div>
          <div className="text-xs text-gray-500">บาท</div>
        </div>

        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">ยอดถูก</span>
            <FaMoneyBillWave className="text-warning" />
          </div>
          <div className="text-lg font-bold text-warning">{formatCurrency(overallStats.totalWins)}</div>
          <div className="text-xs text-gray-500">บาท</div>
        </div>

        <div className="bg-admin-card rounded-xl p-4 border border-admin-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">กำไร/ขาดทุน</span>
            <FaChartLine className={overallStats.netProfit >= 0 ? 'text-success' : 'text-error'} />
          </div>
          <div className={`text-lg font-bold ${overallStats.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
            {formatCurrency(overallStats.netProfit)}
          </div>
          <div className="text-xs text-gray-500">บาท</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card rounded-xl border border-admin-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-300 text-sm font-medium mb-2">วันที่</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-gray-300 text-sm font-medium mb-2">ค้นหา</label>
            <input
              type="text"
              placeholder="ค้นหาชื่อหวย, เลขโพย, รหัสสมาชิก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 bg-admin-darker border border-gold-500/40 text-white rounded-lg hover:bg-gold-500/20 transition-all"
            >
              ขยายทั้งหมด
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 bg-admin-darker border border-gold-500/40 text-white rounded-lg hover:bg-gold-500/20 transition-all"
            >
              ย่อทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Lottery Groups */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xl">กำลังโหลดข้อมูล...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xl">ไม่พบข้อมูลโพย</div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.stock_id);
            return (
              <div key={group.stock_id} className="bg-admin-card rounded-xl border border-admin-border overflow-hidden">
                {/* Group Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-admin-darker/50 transition-all"
                  onClick={() => toggleGroup(group.stock_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-gold-400">
                        {isExpanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <FaTrophy className="text-gold-400" />
                          {group.stock_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-400">
                            <FaClock className="inline mr-1" />
                            เวลาออกรางวัล: {formatTime(group.huay_time)}
                          </span>
                          {getStatusBadge(group.stock_status)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-right">
                      <div>
                        <div className="text-xs text-gray-400">โพย</div>
                        <div className="text-lg font-bold text-white">{group.totalPoys}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">รอผล</div>
                        <div className="text-lg font-bold text-warning">{group.activePoys}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">ยอดแทง</div>
                        <div className="text-sm font-bold text-blue-400">{formatCurrency(group.totalBets)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">ยอดถูก</div>
                        <div className="text-sm font-bold text-warning">{formatCurrency(group.totalWins)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">กำไร/ขาดทุน</div>
                        <div className={`text-sm font-bold ${group.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                          {formatCurrency(group.netProfit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Details */}
                {isExpanded && (
                  <div className="border-t border-admin-border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-admin-darker/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">เลขโพย</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">สมาชิก</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">เวลาแทง</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">ยอดแทง</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">ยอดถูก</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">สถานะ</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.poys.map((poy, index) => (
                            <tr
                              key={poy.id}
                              className={`border-t border-admin-border/50 hover:bg-admin-darker/30 transition-all ${
                                index % 2 === 0 ? 'bg-admin-darker/10' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <span className="text-white font-medium">{getField(poy, 'poyNumber', 'poy_number') || '-'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-white text-sm">{getField(poy, 'poyName', 'poy_name') || '-'}</div>
                                <div className="text-xs text-gray-400">{getField(poy, 'memberId', 'member_id')}</div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-300 text-sm">
                                {formatDateTime(getField(poy, 'dateBuy', 'date_buy'))}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-blue-400 font-medium">{formatCurrency(parseFloat(getField(poy, 'totalPrice', 'totalprice')?.toString() || '0'))}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-warning font-medium">{formatCurrency(parseFloat(getField(poy, 'winPrice', 'win_price')?.toString() || '0'))}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">{getStatusBadge(poy.status)}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/admin/lottery/poy/${poy.id}`);
                                    }}
                                    className="px-3 py-1.5 bg-info hover:bg-info/80 text-white rounded-lg transition-all text-xs flex items-center gap-1"
                                  >
                                    <FaEye />
                                    ดู
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LotteryBetsGrouped;
