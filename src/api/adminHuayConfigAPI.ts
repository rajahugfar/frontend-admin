import { adminAPIClient } from './adminAPI'

// ============================================
// TypeScript Interfaces
// ============================================

export interface HuayConfig {
  id: number
  huayId: number
  huayType: string
  optionType: string // teng_bon_3, tode_3, etc.
  minPrice: number
  maxPrice: number
  multiply: number // payout multiplier
  status: number // 1=active, 0=inactive
  default: number // 1=default config, 0=tiered config
  maxPricePerNum: number
  maxPricePerUser: number
  typeConfig: number // 1=payout configuration, 2=betting limit
  createdAt?: string
  updatedAt?: string
}

export interface CreateHuayConfigRequest {
  optionType: string
  minPrice: number
  maxPrice: number
  multiply: number
  status: number
  default: number
  maxPricePerNum?: number
  maxPricePerUser?: number
  typeConfig: number
}

export interface UpdateHuayConfigRequest {
  optionType?: string
  minPrice?: number
  maxPrice?: number
  multiply?: number
  status?: number
  default?: number
  maxPricePerNum?: number
  maxPricePerUser?: number
  typeConfig?: number
}

// ============================================
// Admin Huay Config API
// ============================================

export const adminHuayConfigAPI = {
  /**
   * Get all configs for a lottery by type
   * @param lotteryId - The lottery ID
   * @param type - 1 for payout, 2 for limits
   */
  getConfigsByLottery: async (lotteryId: number, type: number): Promise<HuayConfig[]> => {
    const response = await adminAPIClient.get(`/lottery/${lotteryId}/huay-config`, {
      params: { type }
    })
    return response.data.data || []
  },

  /**
   * Get a single config by ID
   * @param configId - The config ID
   */
  getConfigById: async (configId: number): Promise<HuayConfig> => {
    const response = await adminAPIClient.get(`/lottery/huay-config/${configId}`)
    return response.data.data
  },

  /**
   * Create a new config for a lottery
   * @param lotteryId - The lottery ID
   * @param data - The config data
   */
  createConfig: async (lotteryId: number, data: CreateHuayConfigRequest): Promise<HuayConfig> => {
    const response = await adminAPIClient.post(`/lottery/${lotteryId}/huay-config`, data)
    return response.data.data
  },

  /**
   * Update an existing config
   * @param configId - The config ID
   * @param data - The updated config data
   */
  updateConfig: async (configId: number, data: UpdateHuayConfigRequest): Promise<HuayConfig> => {
    const response = await adminAPIClient.put(`/lottery/huay-config/${configId}`, data)
    return response.data.data
  },

  /**
   * Delete a config
   * @param configId - The config ID
   */
  deleteConfig: async (configId: number): Promise<void> => {
    await adminAPIClient.delete(`/lottery/huay-config/${configId}`)
  },

  /**
   * Set a config as default
   * @param configId - The config ID
   */
  setDefault: async (configId: number): Promise<HuayConfig> => {
    const response = await adminAPIClient.post(`/lottery/huay-config/${configId}/set-default`)
    return response.data.data
  }
}

export default adminHuayConfigAPI
