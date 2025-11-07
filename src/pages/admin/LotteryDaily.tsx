import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLotteryDailyAPI, DailyLotteryItem, DailyListStatistics } from '../../api/adminLotteryDailyAPI';
import { FaSearch, FaTrophy, FaCheckCircle, FaClock, FaBan, FaChartLine, FaCoins, FaMoneyBillWave, FaPlay, FaStop, FaEdit } from 'react-icons/fa';
import LotteryResultModal from '../../components/admin/modals/LotteryResultModal';

const LotteryDaily: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<DailyListStatistics | null>(null);
  const [lotteries, setLotteries] = useState<DailyLotteryItem[]>([]);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<{
    stockId: number;
    stockName: string;
    lotteryGroup: number;
    huayCode: string;
    has4d: boolean;
  } | null>(null);

  // Group lotteries by group
  const groupedLotteries = React.useMemo(() => {
    const groups: { [key: number]: { name: string; items: DailyLotteryItem[] } } = {};

    lotteries.forEach(lottery => {
      const groupId = lottery.lotteryGroup;
      if (!groups[groupId]) {
        const groupNames: { [key: number]: string } = {
          0: 'หวยรัฐบาล/ออมสิน/ธกส',
          1: 'หวยรัฐบาล',
          2: 'หวยลาว',
          3: 'หวยฮานอย',
          4: 'หุ้นไทย',
          5: 'หุ้นต่างประเทศ',
        };
        groups[groupId] = {
          name: groupNames[groupId] || 'อื่นๆ',
          items: []
        };
      }
      groups[groupId].items.push(lottery);
    });

    // Sort items within each group by closing time (earliest first)
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeA - timeB;
      });
    });

    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([groupId, data]) => ({ groupId: parseInt(groupId), ...data }));
  }, [lotteries]);

  const getFlagEmoji = (iconCode: string) => {
    const flags: { [key: string]: string } = {
      'th': '🇹🇭',
      'la': '🇱🇦',
      'vn': '🇻🇳',
      'cn': '🇨🇳',
      'jp': '🇯🇵',
      'kr': '🇰🇷',
      'sg': '🇸🇬',
      'tw': '🇹🇼',
      'hk': '🇭🇰',
      'gb': '🇬🇧',
      'de': '🇩🇪',
      'ru': '🇷🇺',
      'us': '🇺🇸',
    };
    return flags[iconCode?.toLowerCase()] || '🏳️';
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { date: selectedDate };
      if (statusFilter !== 'all') params.status = parseInt(statusFilter);
      if (searchQuery) params.search = searchQuery;

      const response = await adminLotteryDailyAPI.getDailyList(params);
      if (response.status === 'success' && response.data) {
        setStatistics(response.data.statistics);
        setLotteries(response.data.lotteries);
      }
    } catch (error) {
      console.error('Failed to fetch daily list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleOpenLottery = async (lotteryId: number) => {
    if (!confirm('ต้องการเปิดรับแทงหวยนี้หรือไม่?')) return;
    try {
      const response = await adminLotteryDailyAPI.openLottery(lotteryId);
      if (response.status === 'success') {
        alert(response.message || 'เปิดรับแทงเรียบร้อย');
        fetchData();
      } else {
        alert(response.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Failed to open lottery:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleCloseLottery = async (lotteryId: number) => {
    if (!confirm('ต้องการปิดรับแทงหวยนี้หรือไม่?')) return;
    try {
      const response = await adminLotteryDailyAPI.closeLottery(lotteryId);
      if (response.status === 'success') {
        alert(response.message || 'ปิดรับแทงเรียบร้อย');
        fetchData();
      } else {
        alert(response.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Failed to close lottery:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleCancelLottery = async (lotteryId: number) => {
    if (!confirm('ต้องการยกเลิกหวยนี้หรือไม่? การยกเลิกจะคืนเงินให้สมาชิกทั้งหมด')) return;
    try {
      const response = await adminLotteryDailyAPI.cancelLottery(lotteryId);
      if (response.status === 'success') {
        alert(response.message || 'ยกเลิกหวยเรียบร้อย');
        fetchData();
      } else {
        alert(response.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Failed to cancel lottery:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-medium flex items-center gap-1">
          <FaCheckCircle /> เปิดแทง
        </span>;
      case 2:
        return <span className="px-3 py-1 bg-info/20 text-info rounded-full text-sm font-medium flex items-center gap-1">
          <FaTrophy /> ประกาศผล
        </span>;
      case 0:
        return <span className="px-3 py-1 bg-error/20 text-error rounded-full text-sm font-medium flex items-center gap-1">
          <FaBan /> ยกเลิก
        </span>;
      case 4:
        return <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm font-medium flex items-center gap-1">
          <FaClock /> ปิดแทง
        </span>;
      default:
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">-</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-2xl shadow-2xl p-8 mb-8 border border-gold-300">
        <h1 className="text-3xl font-bold text-brown-900 mb-2 flex items-center gap-3">
          <FaChartLine className="text-4xl" />
          รายงานหวยรายวัน
        </h1>
        <p className="text-brown-700 text-lg">ดูรายการหวย สถิติ และรายละเอียดการแทง</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ทั้งหมด</span>
              <FaChartLine className="text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{statistics.totalLotteries}</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">เปิดแทง</span>
              <FaCheckCircle className="text-success" />
            </div>
            <div className="text-2xl font-bold text-success">{statistics.openLotteries}</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ปิดแทง</span>
              <FaClock className="text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">{statistics.closedLotteries}</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ประกาศผล</span>
              <FaTrophy className="text-info" />
            </div>
            <div className="text-2xl font-bold text-info">{statistics.resultAnnounced}</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ยกเลิก</span>
              <FaBan className="text-error" />
            </div>
            <div className="text-2xl font-bold text-error">{statistics.cancelledLotteries}</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ยอดแทง</span>
              <FaCoins className="text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white">{formatCurrency(statistics.totalBets)}</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ยอดถูก</span>
              <FaMoneyBillWave className="text-warning" />
            </div>
            <div className="text-xl font-bold text-warning">{formatCurrency(statistics.totalWins)}</div>
          </div>

          <div className={`bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">กำไร/ขาดทุน</span>
              <FaChartLine className={statistics.totalProfitLoss >= 0 ? 'text-success' : 'text-error'} />
            </div>
            <div className={`text-xl font-bold ${statistics.totalProfitLoss >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(statistics.totalProfitLoss)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">วันที่</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="all" className="bg-admin-darker text-white">ทั้งหมด</option>
              <option value="1" className="bg-admin-darker text-white">เปิดแทง</option>
              <option value="4" className="bg-admin-darker text-white">ปิดแทง</option>
              <option value="2" className="bg-admin-darker text-white">ประกาศผล</option>
              <option value="0" className="bg-admin-darker text-white">ยกเลิก</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">ค้นหา</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ค้นหาชื่อหวย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-brown-900 font-medium rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FaSearch />
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Single Table with Group Headers (Excel-style) */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xl">กำลังโหลดข้อมูล...</div>
      ) : groupedLotteries.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xl">ไม่พบข้อมูลหวย</div>
      ) : (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-admin-darker border-b border-admin-border">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">ชื่อหวย</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-300">เวลาปิด</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-300">สถานะ</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-300">ผลรางวัล</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-300">ยอดแทง</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-300">ยอดถูก</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-300">กำไร/ขาดทุน</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-300">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {groupedLotteries.map((group) => (
                  <React.Fragment key={group.groupId}>
                    {/* Group Header Row */}
                    <tr className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600">
                      <td colSpan={8} className="px-6 py-3 border-t-2 border-gold-400">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-brown-900">
                            {group.name}
                          </span>
                          <span className="text-sm font-medium text-brown-800 bg-brown-900/20 px-3 py-1 rounded-full">
                            {group.items.length} รายการ
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Group Items */}
                    {group.items.map((lottery, index) => (
                      <tr
                        key={lottery.id}
                        className={`border-b border-admin-border hover:bg-admin-darker/50 transition-all ${
                          index % 2 === 0 ? 'bg-admin-darker/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getFlagEmoji(lottery.icon)}</span>
                            <div>
                              <div className="text-white font-medium">{lottery.name}</div>
                              {lottery.has4d && (
                                <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded">มี 4 ตัว</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-300 text-sm">{formatDateTime(lottery.time)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">{getStatusBadge(lottery.status)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {lottery.status === 2 ? (
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {/* 4 ตัว */}
                              <div>
                                {lottery.has4d && lottery.result4Up ? (
                                  <div className="px-2 py-1 bg-gold-500/20 text-gold-400 font-bold rounded text-sm">
                                    {lottery.result4Up}
                                  </div>
                                ) : (
                                  <span className="text-gray-600 text-xs">-</span>
                                )}
                              </div>
                              {/* 3 ตัว */}
                              <div>
                                {lottery.result3Up ? (
                                  <div className="px-2 py-1 bg-info/20 text-info font-bold rounded text-sm">
                                    {lottery.result3Up}
                                  </div>
                                ) : (
                                  <span className="text-gray-600 text-xs">-</span>
                                )}
                              </div>
                              {/* 2 ตัว */}
                              <div className="flex flex-col gap-1">
                                {lottery.result2Up ? (
                                  <div className="px-2 py-0.5 bg-success/20 text-success font-bold rounded text-xs">
                                    {lottery.result2Up}
                                  </div>
                                ) : (
                                  <span className="text-gray-600 text-xs">-</span>
                                )}
                                {lottery.result2Low ? (
                                  <div className="px-2 py-0.5 bg-warning/20 text-warning font-bold rounded text-xs">
                                    {lottery.result2Low}
                                  </div>
                                ) : (
                                  <span className="text-gray-600 text-xs">-</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 text-sm">-</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-blue-400 font-medium">{formatCurrency(lottery.betAmount)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-warning font-medium">{formatCurrency(lottery.winAmount)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${lottery.profitLoss >= 0 ? 'text-success' : 'text-error'}`}>
                            {formatCurrency(lottery.profitLoss)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* ปุ่มดูโพย */}
                            <button
                              onClick={() => navigate(`/admin/lottery/daily/${lottery.id}`)}
                              className="px-3 py-2 bg-info hover:bg-info/80 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                              title="ดูโพย"
                            >
                              <FaChartLine />
                              โพย
                            </button>

                            {/* ปุ่มเปิด/ปิดแทง - แสดงเมื่อสถานะเปิดหรือปิดแทง */}
                            {lottery.status === 1 && (
                              <button
                                onClick={() => handleCloseLottery(lottery.id)}
                                className="px-3 py-2 bg-warning hover:bg-warning/80 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                                title="ปิดรับแทง"
                              >
                                <FaStop />
                                ปิด
                              </button>
                            )}
                            {lottery.status === 4 && (
                              <button
                                onClick={() => handleOpenLottery(lottery.id)}
                                className="px-3 py-2 bg-success hover:bg-success/80 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                                title="เปิดรับแทง"
                              >
                                <FaPlay />
                                เปิด
                              </button>
                            )}

                            {/* ปุ่มกรอกผล - แสดงตั้งแต่เปิดรับแทง */}
                            {lottery.status >= 1 && lottery.status !== 0 && (
                              <button
                                onClick={() => {
                                  setSelectedLottery({
                                    stockId: lottery.id,
                                    stockName: lottery.name,
                                    lotteryGroup: lottery.lotteryGroup,
                                    huayCode: lottery.huayCode,
                                    has4d: lottery.has4d
                                  });
                                  setShowResultModal(true);
                                }}
                                className="px-3 py-2 bg-gold-500 hover:bg-gold-600 text-brown-900 font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                                title={lottery.status === 2 ? "แก้ไขผล" : "กรอกผล"}
                              >
                                {lottery.status === 2 ? <FaEdit /> : <FaTrophy />}
                                {lottery.status === 2 ? "แก้ไข" : "กรอกผล"}
                              </button>
                            )}

                            {/* ปุ่มยกเลิก - แสดงเมื่อยังไม่ประกาศผล */}
                            {lottery.status !== 2 && lottery.status !== 0 && (
                              <button
                                onClick={() => handleCancelLottery(lottery.id)}
                                className="px-3 py-2 bg-error hover:bg-error/80 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                                title="ยกเลิกหวย"
                              >
                                <FaBan />
                                ยกเลิก
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lottery Result Modal */}
      <LotteryResultModal
        isOpen={showResultModal}
        lottery={selectedLottery}
        onClose={() => {
          setShowResultModal(false);
          setSelectedLottery(null);
        }}
        onSuccess={() => {
          setShowResultModal(false);
          setSelectedLottery(null);
          fetchData(); // Reload lottery list
        }}
      />
    </div>
  );
};

export default LotteryDaily;
