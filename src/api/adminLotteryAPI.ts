import { adminAPIClient } from './adminAPI'

// ============================================
// TypeScript Interfaces
// ============================================

export interface Lottery {
  id: number
  huayName: string
  huayCode: string
  huayGroup: number
  huayType: string
  timeOpen: string
  timeClose: string
  timeResult: string
  flagNextday: boolean
  has4d: boolean
  has3dTop: boolean
  has3dBottom: boolean
  has2dTop: boolean
  has2dBottom: boolean
  status: boolean
  displayOrder: number
  opentFix?: string | null
  dateOpent?: string | null
  icon?: string | null
  detail?: string | null
  officialWebsite?: string | null
  createdAt: string
  updatedAt: string
  // Additional properties
  is_active?: boolean
  lottery_name?: string
  hauy4?: number
}

export interface LotteryConfig {
  id: number
  lotteryId: number
  optionType: string
  typeConfig: number // 1=payout, 2=limits
  minPrice: number
  maxPrice: number
  multiply: number
  maxPricePerNum: number
  maxPricePerUser: number
  status: boolean
  createdAt: string
  updatedAt: string
}

export interface LotteryPeriod {
  id: string
  lottery_id: string
  lottery_code?: string
  lottery_name?: string
  lottery_type?: string
  period_name: string
  period_date: string
  open_time: string
  close_time: string
  status: 'OPEN' | 'CLOSED' | 'ANNOUNCED' | 'PAID'
  result_3d_top?: string
  result_3d_bottom?: string
  result_2d_top?: string
  result_2d_bottom?: string
  result_4d?: string
  announced_at?: string
  total_bet_amount?: number
  total_payout_amount?: number
  total_bets?: number
  created_at: string
  updated_at: string
}

export interface LotteryBet {
  id: string
  member_id: string
  member_username?: string
  lottery_id: string
  lottery_name?: string
  period_id: string
  period_name?: string
  period_date?: string
  bet_type: string
  number: string
  amount: number
  payout_rate: number
  status: 'PENDING' | 'WIN' | 'LOSE' | 'CANCELLED'
  win_amount?: number
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export interface PeriodStatistics {
  period_id: string
  period_name: string
  total_bets: number
  total_bet_amount: number
  total_win_amount: number
  total_payout_amount: number
  net_profit: number
  win_rate: number
  bets_by_type: {
    bet_type: string
    count: number
    total_amount: number
    total_win_amount: number
  }[]
}

export interface CreatePeriodRequest {
  lottery_id: string
  period_date: string
}

export interface AnnounceResultRequest {
  result_3d_top?: string
  result_3d_bottom?: string
  result_2d_top?: string
  result_2d_bottom?: string
  result_4d?: string
}

export interface UpdateLotteryRequest {
  lottery_name?: string
  time_open?: string
  time_close?: string
  is_active?: boolean
  allow_4d?: boolean
}

export interface UpdatePayoutRateRequest {
  multiply: number
}

export interface PayoutTier {
  id: number
  lotteryId: number
  optionType: string
  type: number // 1=per lottery, 2=per member
  tierOrder: number
  minAmount: number
  maxAmount: {
    Float64: number
    Valid: boolean
  } | null
  multiply: number
  status: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTierRequest {
  lotteryId: number
  optionType: string
  type: number
  tierOrder: number
  minAmount: number
  maxAmount?: number | null
  multiply: number
  status: boolean
}

export interface SetupDefaultTiersRequest {
  lotteryId: number
  optionType: string
  type: number
}

export interface GenerateDailyStocksResult {
  totalEligible: number
  created: number
  skipped: number
  errors?: string[]
  stocksCreated: number[]
}

// ============================================
// Admin Lottery API
// ============================================

export interface LotteryStats {
  total: number
  active: number
  inactive: number
  lastUpdate: string
  groupStats: {
    [key: number]: number
  }
}

export const adminLotteryAPI = {
  // Lottery Management
  getAllLotteries: async (): Promise<Lottery[]> => {
    const response = await adminAPIClient.get('/lottery')
    return response.data.data
  },

  getLotteryStats: async (): Promise<LotteryStats> => {
    const response = await adminAPIClient.get('/lottery/stats')
    return response.data.data
  },

  getLotteryByID: async (id: string): Promise<Lottery> => {
    const response = await adminAPIClient.get(`/lottery/${id}`)
    return response.data.data
  },

  updateLottery: async (id: string, data: UpdateLotteryRequest): Promise<Lottery> => {
    const response = await adminAPIClient.put(`/lottery/${id}`, data)
    return response.data.data
  },

  createLottery: async (data: Partial<Lottery>): Promise<void> => {
    await adminAPIClient.post('/lottery', data)
  },

  deleteLottery: async (id: string): Promise<void> => {
    await adminAPIClient.delete(`/lottery/${id}`)
  },

  toggleLotteryStatus: async (id: string): Promise<Lottery> => {
    const response = await adminAPIClient.post(`/lottery/${id}/toggle`)
    return response.data.data
  },

  // Lottery Config Management
  getAllConfigs: async (): Promise<LotteryConfig[]> => {
    const response = await adminAPIClient.get('/lottery/config')
    return response.data.data
  },

  getLotteryConfig: async (lotteryId: string): Promise<LotteryConfig[]> => {
    const response = await adminAPIClient.get(`/lottery/config/lottery/${lotteryId}`)
    return response.data.data
  },

  getPayoutRates: async (lotteryId: string): Promise<LotteryConfig[]> => {
    const response = await adminAPIClient.get(`/lottery/config/lottery/${lotteryId}/payout`)
    return response.data.data
  },

  getLimits: async (lotteryId: string): Promise<LotteryConfig[]> => {
    const response = await adminAPIClient.get(`/lottery/config/lottery/${lotteryId}/limits`)
    return response.data.data
  },

  createConfig: async (config: Partial<LotteryConfig>): Promise<LotteryConfig> => {
    const response = await adminAPIClient.post('/lottery/config', config)
    return response.data.data
  },

  updateConfig: async (configId: number, config: Partial<LotteryConfig>): Promise<LotteryConfig> => {
    const response = await adminAPIClient.put(`/lottery/config/${configId}`, config)
    return response.data.data
  },

  updatePayoutRate: async (
    lotteryId: string,
    optionType: string,
    multiply: number
  ): Promise<void> => {
    await adminAPIClient.put(`/lottery/config/lottery/${lotteryId}/payout`, {
      optionType,
      multiply,
    })
  },

  bulkUpdateConfigs: async (configs: Array<{ id: number; multiply?: number; maxPrice?: number }>): Promise<void> => {
    await adminAPIClient.put('/lottery/config/bulk', configs)
  },

  deleteConfig: async (configId: number): Promise<void> => {
    await adminAPIClient.delete(`/lottery/config/${configId}`)
  },

  initDefaultConfigs: async (lotteryId: string, huayType: string): Promise<void> => {
    await adminAPIClient.post(`/lottery/config/lottery/${lotteryId}/init`, {
      huayType,
    })
  },

  // Period Management
  createPeriod: async (data: CreatePeriodRequest): Promise<LotteryPeriod> => {
    const response = await adminAPIClient.post('/lottery/periods', data)
    return response.data.data
  },

  getPeriods: async (params?: {
    lottery_id?: string
    status?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<{ periods: LotteryPeriod[]; total: number }> => {
    const response = await adminAPIClient.get('/lottery/periods', { params })
    return response.data.data
  },

  getPeriodByID: async (id: string): Promise<LotteryPeriod> => {
    const response = await adminAPIClient.get(`/lottery/periods/${id}`)
    return response.data.data
  },

  closePeriod: async (id: string): Promise<LotteryPeriod> => {
    const response = await adminAPIClient.post(`/lottery/periods/${id}/close`)
    return response.data.data
  },

  announceResult: async (id: string, data: AnnounceResultRequest): Promise<LotteryPeriod> => {
    const response = await adminAPIClient.post(`/lottery/periods/${id}/result`, data)
    return response.data.data
  },

  getPeriodStatistics: async (id: string): Promise<PeriodStatistics> => {
    const response = await adminAPIClient.get(`/lottery/periods/${id}/statistics`)
    return response.data.data
  },

  getPeriodBets: async (
    id: string,
    params?: {
      member_id?: string
      bet_type?: string
      status?: string
      limit?: number
      offset?: number
    }
  ): Promise<{ bets: LotteryBet[]; total: number }> => {
    const response = await adminAPIClient.get(`/lottery/periods/${id}/bets`, { params })
    return response.data.data
  },

  // Payout Tier Management
  getTiersByLottery: async (
    lotteryId: number,
    optionType: string,
    type: number = 1
  ): Promise<PayoutTier[]> => {
    const response = await adminAPIClient.get(`/lottery/tiers/lottery/${lotteryId}`, {
      params: { optionType, type }
    })
    return response.data.data
  },

  calculateMultiply: async (
    lotteryId: number,
    optionType: string,
    type: number,
    amount: number
  ): Promise<{ multiply: number; amount: number }> => {
    const response = await adminAPIClient.get('/lottery/tiers/calculate-multiply', {
      params: { lotteryId, optionType, type, amount }
    })
    return response.data
  },

  createTier: async (tier: CreateTierRequest): Promise<PayoutTier> => {
    const response = await adminAPIClient.post('/lottery/tiers', tier)
    return response.data.data
  },

  updateTier: async (tierId: number, tier: Partial<CreateTierRequest>): Promise<PayoutTier> => {
    const response = await adminAPIClient.put(`/lottery/tiers/${tierId}`, tier)
    return response.data.data
  },

  deleteTier: async (tierId: number): Promise<void> => {
    await adminAPIClient.delete(`/lottery/tiers/${tierId}`)
  },

  setupDefaultTiers: async (data: SetupDefaultTiersRequest): Promise<void> => {
    await adminAPIClient.post('/lottery/tiers/setup-default', data)
  },

  bulkReplaceTiers: async (
    lotteryId: number,
    optionType: string,
    type: number,
    tiers: Array<{
      tierOrder: number
      minAmount: number
      maxAmount?: number | null
      multiply: number
      status: boolean
    }>
  ): Promise<void> => {
    await adminAPIClient.post('/lottery/tiers/bulk-replace', {
      lotteryId,
      optionType,
      type,
      tiers
    })
  },

  // Stock Management
  generateDailyStocks: async (date?: string): Promise<GenerateDailyStocksResult> => {
    const params = date ? { date } : {}
    const response = await adminAPIClient.post('/lottery/stock/generate-daily', null, { params })
    return response.data.data
  },
}

export default adminLotteryAPI
