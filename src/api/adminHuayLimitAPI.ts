import { adminAPIClient } from './adminAPI'

// ============================================
// TypeScript Interfaces
// ============================================

export interface HuayLimit {
  id: number
  stockId: number  // Changed from huayId - now references stock_master.id (lottery period/day)
  huayType: string // g/s/o/b
  poyOption: string // teng_bon_3, tode_3, etc.
  poyNumber?: string
  multiply: number // payout multiplier
  pPrice: number // maximum price per number
  status: number // 1=active, 0=inactive
}

export interface CreateHuayLimitRequest {
  stockId: number  // Changed from huayId - stock_master.id
  huayType: string
  poyOption: string
  poyNumber?: string
  multiply: number
  pPrice: number
  status: number
}

export interface UpdateHuayLimitRequest {
  huayType?: string
  poyOption?: string
  poyNumber?: string
  multiply?: number
  pPrice?: number
  status?: number
}

// ============================================
// Admin Huay Limit API
// ============================================

export const adminHuayLimitAPI = {
  /**
   * Get all payout rates
   */
  getAll: async (): Promise<HuayLimit[]> => {
    const response = await adminAPIClient.get('/lottery/huay-limit')
    return response.data.data || []
  },

  /**
   * Get payout rates for a specific stock/lottery period
   * @param stockId - The stock ID (lottery period)
   */
  getByStockId: async (stockId: number): Promise<HuayLimit[]> => {
    const response = await adminAPIClient.get(`/stock/${stockId}/huay-limit`)
    return response.data.data || []
  },

  /**
   * Get a single payout rate by ID
   * @param id - The payout rate ID
   */
  getById: async (id: number): Promise<HuayLimit> => {
    const response = await adminAPIClient.get(`/lottery/huay-limit/${id}`)
    return response.data.data
  },

  /**
   * Create a new payout rate
   * @param stockId - The stock ID (lottery period)
   * @param data - The payout rate data
   */
  create: async (stockId: number, data: CreateHuayLimitRequest): Promise<HuayLimit> => {
    const response = await adminAPIClient.post(`/stock/${stockId}/huay-limit`, data)
    return response.data.data
  },

  /**
   * Update an existing payout rate
   * @param id - The payout rate ID
   * @param data - The updated payout rate data
   */
  update: async (id: number, data: UpdateHuayLimitRequest): Promise<HuayLimit> => {
    const response = await adminAPIClient.put(`/lottery/huay-limit/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a payout rate
   * @param id - The payout rate ID
   */
  delete: async (id: number): Promise<void> => {
    await adminAPIClient.delete(`/lottery/huay-limit/${id}`)
  }
}

export default adminHuayLimitAPI
