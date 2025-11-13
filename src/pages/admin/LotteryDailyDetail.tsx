import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminLotteryDailyAPI, StockBetsResponse, BetNumberItem, BetDetailItem } from '@/api/adminLotteryDailyAPI';
import { FaArrowLeft, FaTimes, FaChartLine, FaCoins } from 'react-icons/fa';

interface BetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number;
  betType: string;
  number: string;
  betTypeName: string;
}

const BetDetailModal: React.FC<BetDetailModalProps> = memo(({ isOpen, onClose, stockId, betType, number, betTypeName }) => {
  const [loading, setLoading] = useState(false);
  const [betDetails, setBetDetails] = useState<BetDetailItem[]>([]);

  const fetchBetDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminLotteryDailyAPI.getBetDetail(stockId, betType, number);
      if (response.status === 'success' && response.data) {
        setBetDetails(response.data.betDetail);
      }
    } catch (error) {
      console.error('Failed to fetch bet detail:', error);
    } finally {
      setLoading(false);
    }
  }, [stockId, betType, number]);

  useEffect(() => {
    if (isOpen && stockId && betType && number) {
      fetchBetDetail();
    }
  }, [isOpen, fetchBetDetail]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }, []);

  const totalAmount = useMemo(() => betDetails.reduce((sum, d) => sum + d.amount, 0), [betDetails]);
  const totalWinAmount = useMemo(() => betDetails.reduce((sum, d) => sum + d.winAmount, 0), [betDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-brown-900">รายละเอียดการแทง</h2>
            <p className="text-brown-700 mt-1">
              {betTypeName} | เลข: <span className="font-bold text-3xl ml-2">{number}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-brown-900/20 rounded-xl transition-all"
          >
            <FaTimes className="text-2xl text-brown-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-500 mb-4"></div>
              <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
            </div>
          ) : betDetails.length === 0 ? (
            <div className="text-center py-20">
              <FaCoins className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">ไม่พบข้อมูลการแทง</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-admin-darker via-brown-900 to-admin-darker border-b-2 border-gold-500">
                    <th className="px-4 py-4 text-left text-sm font-bold text-gold-400">ลำดับ</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gold-400">ชื่อสมาชิก</th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gold-400">ยอดแทง</th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gold-400">ยอดถูก</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gold-400">สถานะ</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gold-400">เวลาแทง</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gold-400">ดูโพย</th>
                  </tr>
                </thead>
                <tbody>
                  {betDetails.map((detail, index) => (
                    <tr key={detail.betId} className="border-b border-admin-border/30 hover:bg-admin-darker/50 transition-all">
                      <td className="px-4 py-3 text-gray-300 font-medium">{index + 1}</td>
                      <td className="px-4 py-3 text-white font-medium">{detail.memberName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-blue-400 font-bold">{formatCurrency(detail.amount)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-warning font-bold">
                          {detail.winAmount > 0 ? formatCurrency(detail.winAmount) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {detail.status === 1 ? (
                          <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-bold border border-success/30">รอผล</span>
                        ) : detail.status === 2 ? (
                          <span className="px-3 py-1 bg-info/20 text-info rounded-full text-xs font-bold border border-info/30">ถูกรางวัล</span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold border border-gray-500/30">อื่นๆ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400 text-sm">{formatDateTime(detail.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`/admin/lottery/poy/${detail.poyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 rounded-lg text-xs font-bold transition-all inline-block border border-gold-500/30"
                        >
                          ดูโพย
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0">
                  <tr className="bg-gradient-to-r from-admin-darker via-brown-900 to-admin-darker border-t-2 border-gold-500 font-bold">
                    <td colSpan={2} className="px-4 py-4 text-right text-gold-400 text-lg">รวมทั้งหมด:</td>
                    <td className="px-4 py-4 text-right text-blue-400 text-lg">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-right text-warning text-lg">
                      {formatCurrency(totalWinAmount)}
                    </td>
                    <td colSpan={3} className="px-4 py-4 text-left text-gray-400 text-sm">
                      ({betDetails.length} รายการ)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-admin-darker p-4 flex justify-end border-t border-admin-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
});

BetDetailModal.displayName = 'BetDetailModal';

const LotteryDailyDetail: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const stockId = lotteryId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockBetsResponse | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ type: string; number: string; typeName: string } | null>(null);

  const fetchStockBets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminLotteryDailyAPI.getStockBets(parseInt(stockId!));
      if (response.status === 'success' && response.data) {
        setStockData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stock bets:', error);
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    if (stockId) {
      fetchStockBets();
    }
  }, [fetchStockBets]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }, []);

  const openBetDetail = useCallback((betType: string, number: string, typeName: string) => {
    setSelectedBet({ type: betType, number, typeName });
    setModalOpen(true);
  }, []);

  const getBetTypeName = useCallback((betType: string): string => {
    const typeNames: { [key: string]: string } = {
      'teng_bon_4': '4 ตัวบน',
      'tode_4': '4 ตัวโต๊ด',
      'teng_bon_3': '3 ตัวบน',
      'tode_3': '3 ตัวโต๊ด',
      'teng_lang_nha_3': '3 ตัวหน้า',
      'teng_lang_3': '3 ตัวล่าง',
      'teng_bon_2': '2 ตัวบน',
      'teng_lang_2': '2 ตัวล่าง',
      'teng_bon_1': 'วิ่งบน',
      'teng_lang_1': 'วิ่งล่าง',
    };
    return typeNames[betType] || betType;
  }, []);

  // Prepare table data with virtual scrolling support
  const { columns, rows, totals, grandTotal } = useMemo(() => {
    if (!stockData) return { columns: [], rows: [], totals: {}, grandTotal: { totalCount: 0, totalAmount: 0 } };

    const isGLO = stockData.huayCode === 'GLO' || stockData.has4d;

    const columns = isGLO ? [
      'teng_bon_4', 'tode_4', 'teng_bon_3', 'tode_3',
      'teng_lang_nha_3', 'teng_lang_3', 'teng_bon_2', 'teng_lang_2',
      'teng_bon_1', 'teng_lang_1'
    ] : [
      'teng_bon_3', 'tode_3', 'teng_bon_2', 'teng_lang_2',
      'teng_bon_1', 'teng_lang_1'
    ];

    let maxRows = 0;
    const betArrays: { [key: string]: BetNumberItem[] } = {};

    columns.forEach(col => {
      const bets = stockData.betGroups[col] || [];
      betArrays[col] = bets;
      if (bets.length > maxRows) {
        maxRows = bets.length;
      }
    });

    const rows: any[] = [];
    for (let i = 0; i < maxRows; i++) {
      const row: any = { index: i };
      columns.forEach(col => {
        row[col] = betArrays[col][i] || null;
      });
      rows.push(row);
    }

    const totals: any = {};
    let grandTotalCount = 0;
    let grandTotalAmount = 0;

    columns.forEach(col => {
      const bets = betArrays[col];
      const sum = bets.reduce((sum, bet) => sum + bet.amount, 0);
      totals[col] = {
        count: bets.length,
        sum: sum
      };
      grandTotalCount += bets.length;
      grandTotalAmount += sum;
    });

    return {
      columns,
      rows,
      totals,
      grandTotal: { totalCount: grandTotalCount, totalAmount: grandTotalAmount }
    };
  }, [stockData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-2xl shadow-2xl p-8 mb-8 border border-gold-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/lottery/daily')}
            className="p-3 bg-brown-900/20 hover:bg-brown-900/40 rounded-xl transition-all shadow-lg"
          >
            <FaArrowLeft className="text-2xl text-brown-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brown-900 flex items-center gap-3">
              <FaChartLine />
              {stockData?.stockName || 'รายละเอียดโพย'}
            </h1>
            <p className="text-brown-700 text-lg mt-2 flex items-center gap-3">
              <span>รหัสหวย: <span className="font-bold">{stockData?.huayCode}</span></span>
              {stockData?.has4d && (
                <span className="bg-brown-900/30 px-4 py-1 rounded-full font-bold text-sm border border-brown-900/50">
                  มี 4 ตัว
                </span>
              )}
            </p>
          </div>
          {/* Summary Stats */}
          <div className="flex gap-4">
            <div className="bg-brown-900/20 px-6 py-3 rounded-xl border border-brown-900/30">
              <p className="text-brown-700 text-sm">รวมเลข</p>
              <p className="text-2xl font-bold text-brown-900">{formatCurrency(grandTotal.totalCount)}</p>
            </div>
            <div className="bg-brown-900/20 px-6 py-3 rounded-xl border border-brown-900/30">
              <p className="text-brown-700 text-sm">ยอดรวม</p>
              <p className="text-2xl font-bold text-brown-900">{formatCurrency(grandTotal.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bet Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-gold-500 mb-6"></div>
          <p className="text-gray-400 text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      ) : !stockData ? (
        <div className="text-center py-20">
          <FaChartLine className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-xl">ไม่พบข้อมูลหวย</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border p-12">
          <div className="text-center py-20">
            <FaCoins className="text-8xl text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 text-2xl font-bold">ยังไม่มีการแทง</p>
          </div>
        </div>
      ) : (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-gold-500/30 overflow-hidden">
          {/* Table Header Info */}
          <div className="bg-gradient-to-r from-admin-darker via-brown-900 to-admin-darker p-4 border-b border-gold-500/30">
            <p className="text-gray-300 text-sm">
              แสดงข้อมูลทั้งหมด <span className="text-gold-400 font-bold">{rows.length}</span> แถว
            </p>
          </div>

          {/* Virtual Scroll Container */}
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <table className="w-full text-sm" style={{ minWidth: '1400px' }}>
              <thead className="sticky top-0 z-20 shadow-lg">
                <tr className="bg-gradient-to-r from-admin-darker via-brown-900 to-admin-darker border-b-2 border-gold-500">
                  {columns.map(col => (
                    <React.Fragment key={col}>
                      <th className="px-4 py-4 text-center text-gold-400 font-bold border-r border-admin-border/50 min-w-[100px]">
                        <div className="flex flex-col items-center">
                          <span className="text-base">{getBetTypeName(col)}</span>
                          <span className="text-xs text-gray-400 mt-1">
                            ({totals[col]?.count || 0} เลข)
                          </span>
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center text-gold-400 font-bold border-r border-admin-border/50 min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <span className="text-base">ยอดเงิน</span>
                          <span className="text-xs text-success mt-1">
                            {formatCurrency(totals[col]?.sum || 0)}
                          </span>
                        </div>
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-admin-border/20 hover:bg-gold-500/5 transition-all ${
                      rowIndex % 2 === 0 ? 'bg-admin-darker/30' : ''
                    }`}
                  >
                    {columns.map(col => {
                      const bet = row[col];
                      return (
                        <React.Fragment key={`${rowIndex}-${col}`}>
                          <td className="px-4 py-3 text-center border-r border-admin-border/20">
                            {bet ? (
                              <button
                                onClick={() => openBetDetail(col, bet.number, getBetTypeName(col))}
                                className="text-white font-mono text-lg font-bold hover:text-gold-400 hover:scale-110 transition-all cursor-pointer px-3 py-1 rounded hover:bg-gold-500/10"
                              >
                                {bet.number}
                              </button>
                            ) : (
                              <span className="text-gray-700 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center border-r border-admin-border/20">
                            {bet ? (
                              <span className="text-blue-400 font-bold text-base">
                                {formatCurrency(bet.amount)}
                              </span>
                            ) : (
                              <span className="text-gray-700 text-sm">-</span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 shadow-lg">
                <tr className="bg-gradient-to-r from-admin-darker via-brown-900 to-admin-darker border-t-2 border-gold-500 font-bold">
                  {columns.map(col => (
                    <React.Fragment key={`total-${col}`}>
                      <td className="px-4 py-4 text-center text-warning border-r border-admin-border/50 text-lg">
                        {totals[col].count}
                      </td>
                      <td className="px-4 py-4 text-center text-success border-r border-admin-border/50 text-lg">
                        {formatCurrency(totals[col].sum)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Bet Detail Modal */}
      {selectedBet && (
        <BetDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          stockId={parseInt(stockId!)}
          betType={selectedBet.type}
          number={selectedBet.number}
          betTypeName={selectedBet.typeName}
        />
      )}
    </div>
  );
};

export default LotteryDailyDetail;
