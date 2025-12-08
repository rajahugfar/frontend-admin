import { adminAPIClient } from './adminAPI';

// ============================================
// TypeScript Interfaces
// ============================================

export interface PoyHeader {
  id: string;
  stock_id: number;
  stockName?: string;
  huayCode?: string;
  member_id: string;
  huay_id: number;
  poy_type: string;
  poy_name?: string;
  poy_number?: string;
  date_buy: string;
  create_date: string;
  totalprice: number;
  win_price: number;
  balance_after: number;
  huay_time?: string;
  note?: string;
  date_cancel?: string;
  user_cancel?: string;
  cancel_note?: string;
  status: number; // 0=cancelled, 1=pending, 2=completed
}

export interface PoyItem {
  id: string;
  poy_id: string;
  number: string;
  type: string;
  price: number;
  win_price: number;
  is_win: boolean;
  created_at: string;
  updated_at: string;
}

export interface PoyStatistics {
  totalPoys: number;
  totalBets: number;
  totalWins: number;
  netProfit: number;
  activePoys: number;
  cancelledPoys: number;
  completedPoys: number;
}

export interface PoyPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface GetAllPoysResponse {
  poys: PoyHeader[];
  statistics: PoyStatistics;
  pagination: PoyPagination;
}

export interface GetAllPoysParams {
  date?: string;
  status?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetMemberPoysParams {
  limit?: number;
  offset?: number;
  status?: number;
}

export interface PoyDetailResponse {
  header: PoyHeader;
  items: PoyItem[];
}

export interface CancelPoyRequest {
  reason: string;
}

export interface CancelPoyResponse {
  poyId: string;
  refundAmount: number;
  reason: string;
}

// ============================================
// Admin POY API
// ============================================

export const adminPoyAPI = {
  /**
   * Get all poys with filters and statistics
   * GET /api/v1/admin/poy/all
   */
  getAllPoys: async (params?: GetAllPoysParams) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await adminAPIClient.get<{ status: string; message?: string; data: GetAllPoysResponse }>(
      `/poy/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Get poys for a specific member
   * GET /api/v1/admin/poy/member/:memberId
   */
  getMemberPoys: async (memberId: string, params?: GetMemberPoysParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());

    const response = await adminAPIClient.get<{ status: string; message?: string; data: GetAllPoysResponse }>(
      `/poy/member/${memberId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Get poy detail with items
   * GET /api/v1/admin/poy/:id
   */
  getPoyDetail: async (poyId: string) => {
    const response = await adminAPIClient.get<{ status: string; message?: string; data: PoyDetailResponse }>(
      `/poy/${poyId}`
    );
    return response.data;
  },

  /**
   * Cancel a poy and refund credit
   * POST /api/v1/admin/poy/:id/cancel
   */
  cancelPoy: async (poyId: string, data: CancelPoyRequest) => {
    const response = await adminAPIClient.post<{ status: string; message: string; data: CancelPoyResponse }>(
      `/poy/${poyId}/cancel`,
      data
    );
    return response.data;
  },
};

export default adminPoyAPI;
