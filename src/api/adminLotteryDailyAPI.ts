import { adminAPIClient } from './adminAPI';

export interface DailyListStatistics {
  totalLotteries: number;
  openLotteries: number;
  closedLotteries: number;
  resultAnnounced: number;
  cancelledLotteries: number;
  totalBets: number;
  totalWins: number;
  totalProfitLoss: number;
}

export interface DailyLotteryItem {
  id: number;
  name: string;
  huayCode: string;
  icon: string;
  has4d: boolean;
  time: string;
  status: number;
  lotteryGroup: number;
  stockType: number;
  result3Up: string;
  result2Up: string;
  result2Low: string;
  result4Up: string;
  resultFull: string;
  result3Front: string;
  result3Down: string;
  betAmount: number;
  winAmount: number;
  profitLoss: number;
}

export interface DailyListResponse {
  statistics: DailyListStatistics;
  lotteries: DailyLotteryItem[];
}

export interface BetNumberItem {
  number: string;
  amount: number;
}

export interface StockBetsResponse {
  stockId: number;
  stockName: string;
  huayCode: string;
  has4d: boolean;
  betGroups: {
    [key: string]: BetNumberItem[];
  };
}

export interface BetDetailItem {
  betId: string;
  poyId: string;
  memberCode: string;
  memberName: string;
  amount: number;
  winAmount: number;
  status: number;
  createdAt: string;
}

export interface BetDetailResponse {
  stockId: number;
  betType: string;
  number: string;
  betDetail: BetDetailItem[];
}

export interface GetDailyListParams {
  date?: string;
  stock_type?: number;
  status?: number;
  search?: string;
}

export const adminLotteryDailyAPI = {
  /**
   * Get daily lottery list with statistics
   */
  getDailyList: async (params?: GetDailyListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.stock_type) queryParams.append('stock_type', params.stock_type.toString());
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await adminAPIClient.get<{ status: string; message: string; data: DailyListResponse }>(
      `/lottery/daily/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Get stock bet numbers grouped by type
   */
  getStockBets: async (stockId: number) => {
    const response = await adminAPIClient.get<{ status: string; message: string; data: StockBetsResponse }>(
      `/lottery/daily/${stockId}/bets`
    );
    return response.data;
  },

  /**
   * Get bet detail for specific number
   */
  getBetDetail: async (stockId: number, betType: string, number: string) => {
    const response = await adminAPIClient.get<{ status: string; message: string; data: BetDetailResponse }>(
      `/lottery/daily/${stockId}/bets/detail?bet_type=${betType}&number=${number}`
    );
    return response.data;
  },

  /**
   * Open lottery for betting
   */
  openLottery: async (stockId: number) => {
    const response = await adminAPIClient.post<{ status: string; message: string }>(
      `/lottery/daily/${stockId}/open`
    );
    return response.data;
  },

  /**
   * Close lottery for betting
   */
  closeLottery: async (stockId: number) => {
    const response = await adminAPIClient.post<{ status: string; message: string }>(
      `/lottery/daily/${stockId}/close`
    );
    return response.data;
  },

  /**
   * Cancel lottery and refund
   */
  cancelLottery: async (stockId: number) => {
    const response = await adminAPIClient.post<{ status: string; message: string }>(
      `/lottery/daily/${stockId}/cancel`
    );
    return response.data;
  },

  /**
   * Save lottery result
   */
  saveResult: async (payload: {
    stockId: number;
    stockWin: string;
    stock2Up: string;
    stock2Low: string;
    stockWin1?: string;
    g3Front?: string;
    g3Down?: string;
    g4Up?: string;
  }) => {
    const response = await adminAPIClient.post<{ status: string; message: string }>(
      `/lottery/daily/${payload.stockId}/result`,
      payload
    );
    return response.data;
  },
};
