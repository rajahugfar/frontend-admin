import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminPoyAPI, PoyHeader, PoyStatistics } from '@/api/adminPoyAPI';
import {
  FaSearch,
  FaEye,
  FaChartLine,
  FaCoins,
  FaMoneyBillWave,
  FaTrophy,
  FaBan,
  FaClock,
  FaCheckCircle,
  FaTicketAlt
} from 'react-icons/fa';

const LotteryBets: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<PoyStatistics | null>(null);
  const [poys, setPoys] = useState<PoyHeader[]>([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    fetchData();
  }, [selectedDate, statusFilter, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        date: selectedDate,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };

      if (statusFilter !== 'all') params.status = parseInt(statusFilter);
      if (searchQuery) params.search = searchQuery;

      const response = await adminPoyAPI.getAllPoys(params);
      if (response.status === 'success' && response.data) {
        setStatistics(response.data.statistics);
        setPoys(response.data.poys);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch poys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm font-medium flex items-center gap-1">
            <FaClock /> รอประกาศผล
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-medium flex items-center gap-1">
            <FaCheckCircle /> ประกาศผลแล้ว
          </span>
        );
      case 0:
        return (
          <span className="px-3 py-1 bg-error/20 text-error rounded-full text-sm font-medium flex items-center gap-1">
            <FaBan /> ยกเลิก
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">-</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const localDateString = dateString.replace('Z', '+07:00');
    const date = new Date(localDateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok',
    }).format(date);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-2xl shadow-2xl p-8 mb-8 border border-gold-300">
        <h1 className="text-3xl font-bold text-brown-900 mb-2 flex items-center gap-3">
          <FaTicketAlt className="text-4xl" />
          รายการแทงหวย (โพย)
        </h1>
        <p className="text-brown-700 text-lg">ดูรายการโพยและสถิติการแทงหวยทั้งหมด</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">โพยทั้งหมด</span>
              <FaTicketAlt className="text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{statistics.totalPoys}</div>
            <div className="text-xs text-gray-500 mt-1">โพย</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">รอประกาศผล</span>
              <FaClock className="text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">{statistics.activePoys}</div>
            <div className="text-xs text-gray-500 mt-1">โพย</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ประกาศผลแล้ว</span>
              <FaCheckCircle className="text-success" />
            </div>
            <div className="text-2xl font-bold text-success">{statistics.completedPoys}</div>
            <div className="text-xs text-gray-500 mt-1">โพย</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ยกเลิก</span>
              <FaBan className="text-error" />
            </div>
            <div className="text-2xl font-bold text-error">{statistics.cancelledPoys}</div>
            <div className="text-xs text-gray-500 mt-1">โพย</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ยอดแทง</span>
              <FaCoins className="text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white">{formatCurrency(statistics.totalBets)}</div>
            <div className="text-xs text-gray-500 mt-1">บาท</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">ยอดถูก</span>
              <FaMoneyBillWave className="text-warning" />
            </div>
            <div className="text-xl font-bold text-warning">{formatCurrency(statistics.totalWins)}</div>
            <div className="text-xs text-gray-500 mt-1">บาท</div>
          </div>

          <div className="bg-admin-card rounded-xl p-4 border border-admin-border shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">กำไร/ขาดทุน</span>
              <FaChartLine className={statistics.netProfit >= 0 ? 'text-success' : 'text-error'} />
            </div>
            <div className={`text-xl font-bold ${statistics.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(statistics.netProfit)}
            </div>
            <div className="text-xs text-gray-500 mt-1">บาท</div>
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
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="all" className="bg-admin-darker text-white">ทั้งหมด</option>
              <option value="1" className="bg-admin-darker text-white">รอประกาศผล</option>
              <option value="2" className="bg-admin-darker text-white">ประกาศผลแล้ว</option>
              <option value="0" className="bg-admin-darker text-white">ยกเลิก</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">ค้นหา</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ค้นหาเลขโพย, ชื่อสมาชิก, หรือรหัสสมาชิก..."
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

      {/* Poys Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xl">กำลังโหลดข้อมูล...</div>
      ) : poys.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xl">ไม่พบข้อมูลโพย</div>
      ) : (
        <>
          <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 border-b border-gold-400">
                    <th className="px-6 py-4 text-left text-sm font-bold text-brown-900">เลขโพย</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-brown-900">สมาชิก</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-brown-900">หวย</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-brown-900">วันที่แทง</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-brown-900">ยอดแทง</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-brown-900">ยอดถูก</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-brown-900">สถานะ</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-brown-900">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {poys.map((poy, index) => (
                    <tr
                      key={poy.id}
                      className={`border-b border-admin-border hover:bg-admin-darker/50 transition-all ${
                        index % 2 === 0 ? 'bg-admin-darker/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-gold-400" />
                          <span className="text-white font-medium">{poy.poy_number || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{poy.poy_name || '-'}</div>
                        <div className="text-xs text-gray-400">{poy.member_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300">{poy.note || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300 text-sm">
                        {formatDateTime(poy.date_buy)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-blue-400 font-medium">{formatCurrency(poy.totalprice)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-warning font-medium">{formatCurrency(poy.win_price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">{getStatusBadge(poy.status)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/lottery/poy/${poy.id}`)}
                            className="px-3 py-2 bg-info hover:bg-info/80 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                            title="ดูรายละเอียด"
                          >
                            <FaEye />
                            ดูรายละเอียด
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-admin-card rounded-xl p-4 border border-admin-border">
              <div className="text-gray-300 text-sm">
                แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, total)} จาก {total} รายการ
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-admin-darker border border-gold-500/40 text-white rounded-lg hover:bg-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ก่อนหน้า
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-gold-500 text-brown-900 font-bold'
                            : 'bg-admin-darker border border-gold-500/40 text-white hover:bg-gold-500/20'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-admin-darker border border-gold-500/40 text-white rounded-lg hover:bg-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LotteryBets;
