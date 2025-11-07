import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminLotteryDailyAPI, StockBetsResponse, BetNumberItem, BetDetailItem } from '../../api/adminLotteryDailyAPI';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

interface BetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number;
  betType: string;
  number: string;
  betTypeName: string;
}

const BetDetailModal: React.FC<BetDetailModalProps> = ({ isOpen, onClose, stockId, betType, number, betTypeName }) => {
  const [loading, setLoading] = useState(false);
  const [betDetails, setBetDetails] = useState<BetDetailItem[]>([]);

  useEffect(() => {
    if (isOpen && stockId && betType && number) {
      fetchBetDetail();
    }
  }, [isOpen, stockId, betType, number]);

  const fetchBetDetail = async () => {
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
      second: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-brown-900">รายละเอียดการแทง</h2>
            <p className="text-brown-700 mt-1">
              {betTypeName} | เลข: <span className="font-bold text-2xl">{number}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brown-900/20 rounded-lg transition-all"
          >
            <FaTimes className="text-2xl text-brown-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          {loading ? (
            <div className="text-center py-12 text-gray-400">กำลังโหลดข้อมูล...</div>
          ) : betDetails.length === 0 ? (
            <div className="text-center py-12 text-gray-400">ไม่พบข้อมูลการแทง</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-admin-darker border-b border-admin-border">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-300">ลำดับ</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-300">ชื่อสมาชิก</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">ยอดแทง</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">ยอดถูก</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-300">สถานะ</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-300">เวลาแทง</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-300">ดูโพย</th>
                  </tr>
                </thead>
                <tbody>
                  {betDetails.map((detail, index) => (
                    <tr key={detail.betId} className="border-b border-admin-border/50 hover:bg-admin-darker/50 transition-all">
                      <td className="px-4 py-3 text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 text-white">{detail.memberName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-blue-400 font-medium">{formatCurrency(detail.amount)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-warning font-medium">
                          {detail.winAmount > 0 ? formatCurrency(detail.winAmount) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {detail.status === 1 ? (
                          <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-medium">รอผล</span>
                        ) : detail.status === 2 ? (
                          <span className="px-3 py-1 bg-info/20 text-info rounded-full text-xs font-medium">ถูกรางวัล</span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">อื่นๆ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400 text-sm">{formatDateTime(detail.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`/admin/poy/${detail.poyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 rounded-lg text-xs font-medium transition-all inline-block"
                        >
                          ดูโพย
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-admin-darker font-bold">
                    <td colSpan={2} className="px-4 py-3 text-right text-gold-400">รวม:</td>
                    <td className="px-4 py-3 text-right text-blue-400">
                      {formatCurrency(betDetails.reduce((sum, d) => sum + d.amount, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-warning">
                      {formatCurrency(betDetails.reduce((sum, d) => sum + d.winAmount, 0))}
                    </td>
                    <td colSpan={3}></td>
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
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

const LotteryDailyDetail: React.FC = () => {
  const { stockId } = useParams<{ stockId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockBetsResponse | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ type: string; number: string; typeName: string } | null>(null);

  useEffect(() => {
    if (stockId) {
      fetchStockBets();
    }
  }, [stockId]);

  const fetchStockBets = async () => {
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const openBetDetail = (betType: string, number: string, typeName: string) => {
    setSelectedBet({ type: betType, number, typeName });
    setModalOpen(true);
  };

  const getBetTypeName = (betType: string): string => {
    const typeNames: { [key: string]: string } = {
      'teng_bon_4': '4 บน',
      'tode_4': '4 โต๊ด',
      'teng_bon_3': '3 บน',
      'tode_3': '3 โต๊ด',
      'teng_lang_nha_3': '3 หน้า',
      'teng_lang_3': '3 ล่าง',
      'teng_bon_2': '2 บน',
      'teng_lang_2': '2 ล่าง',
      'teng_bon_1': 'วิ่งบน',
      'teng_lang_1': 'วิ่งล่าง',
    };
    return typeNames[betType] || betType;
  };

  // Prepare table data - create rows where each row contains data from all bet types
  const prepareTableData = () => {
    if (!stockData) return { columns: [], rows: [], totals: {} };

    const isGLO = stockData.huayCode === 'GLO' || stockData.has4d;

    // Define column order based on lottery type
    const columns = isGLO ? [
      'teng_bon_4', 'tode_4', 'teng_bon_3', 'tode_3',
      'teng_lang_nha_3', 'teng_lang_3', 'teng_bon_2', 'teng_lang_2',
      'teng_bon_1', 'teng_lang_1'
    ] : [
      'teng_bon_3', 'tode_3', 'teng_bon_2', 'teng_lang_2',
      'teng_bon_1', 'teng_lang_1'
    ];

    // Find max rows needed
    let maxRows = 0;
    const betArrays: { [key: string]: BetNumberItem[] } = {};

    columns.forEach(col => {
      const bets = stockData.betGroups[col] || [];
      betArrays[col] = bets;
      if (bets.length > maxRows) {
        maxRows = bets.length;
      }
    });

    // Create rows
    const rows: any[] = [];
    for (let i = 0; i < maxRows; i++) {
      const row: any = { index: i };
      columns.forEach(col => {
        row[col] = betArrays[col][i] || null;
      });
      rows.push(row);
    }

    // Calculate totals
    const totals: any = {};
    columns.forEach(col => {
      const bets = betArrays[col];
      totals[col] = {
        count: bets.length,
        sum: bets.reduce((sum, bet) => sum + bet.amount, 0)
      };
    });

    return { columns, rows, totals };
  };

  const { columns, rows, totals } = prepareTableData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-2xl shadow-2xl p-8 mb-8 border border-gold-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/lottery/daily')}
            className="p-3 bg-brown-900/20 hover:bg-brown-900/40 rounded-lg transition-all"
          >
            <FaArrowLeft className="text-2xl text-brown-900" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-brown-900">{stockData?.stockName || 'รายละเอียดโพย'}</h1>
            <p className="text-brown-700 text-lg mt-1">
              รหัสหวย: <span className="font-bold">{stockData?.huayCode}</span>
              {stockData?.has4d && <span className="ml-3 text-sm bg-brown-900/20 px-3 py-1 rounded-full">มี 4 ตัว</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Bet Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xl">กำลังโหลดข้อมูล...</div>
      ) : !stockData ? (
        <div className="text-center py-20 text-gray-400 text-xl">ไม่พบข้อมูลหวย</div>
      ) : rows.length === 0 ? (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border p-8">
          <div className="text-center py-20 text-gray-400 text-xl">ยังไม่มีการแทง</div>
        </div>
      ) : (
        <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border p-6 overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '1200px' }}>
            <thead>
              <tr className="bg-admin-darker border-b-2 border-gold-500">
                {columns.map(col => (
                  <React.Fragment key={col}>
                    <th className="px-3 py-3 text-center text-gold-400 font-bold border-r border-admin-border">
                      {getBetTypeName(col)}
                    </th>
                    <th className="px-3 py-3 text-center text-gold-400 font-bold border-r border-admin-border">
                      จำนวน
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-admin-border/30 hover:bg-admin-darker/50 transition-all">
                  {columns.map(col => {
                    const bet = row[col];
                    return (
                      <React.Fragment key={`${rowIndex}-${col}`}>
                        <td className="px-3 py-2 text-center border-r border-admin-border/30">
                          {bet ? (
                            <button
                              onClick={() => openBetDetail(col, bet.number, getBetTypeName(col))}
                              className="text-white font-mono text-base hover:text-gold-400 hover:underline cursor-pointer font-medium"
                            >
                              {bet.number}
                            </button>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-blue-400 border-r border-admin-border/30">
                          {bet ? formatCurrency(bet.amount) : '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-admin-darker via-admin-dark to-admin-darker border-t-2 border-gold-500 font-bold">
                {columns.map(col => (
                  <React.Fragment key={`total-${col}`}>
                    <td className="px-3 py-3 text-center text-warning border-r border-admin-border">
                      {totals[col].count}
                    </td>
                    <td className="px-3 py-3 text-center text-success border-r border-admin-border">
                      {formatCurrency(totals[col].sum)}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            </tfoot>
          </table>
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
