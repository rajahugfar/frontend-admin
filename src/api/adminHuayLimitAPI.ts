import { adminAPIClient } from './adminAPI'

// ============================================
// TypeScript Interfaces
// ============================================

export interface HuayLimit {
  id: number
  huayId: number
  huayType: string // g/s/o/b
  poyOption: string // teng_bon_3, tode_3, etc.
  poyNumber?: string
  multiply: number // payout multiplier
  pPrice: number // maximum price per number
  status: number // 1=active, 0=inactive
}

export interface CreateHuayLimitRequest {
  huayId: number
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
   * Get payout rates for a specific lottery
   * @param lotteryId - The lottery ID
   */
  getByLotteryId: async (lotteryId: number): Promise<HuayLimit[]> => {
    const response = await adminAPIClient.get(`/lottery/${lotteryId}/huay-limit`)
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
   * @param lotteryId - The lottery ID
   * @param data - The payout rate data
   */
  create: async (lotteryId: number, data: CreateHuayLimitRequest): Promise<HuayLimit> => {
    const response = await adminAPIClient.post(`/lottery/${lotteryId}/huay-limit`, data)
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
