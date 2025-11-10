import client from './client'

export interface Prize {
  id: number
  name: string
  type: string
  amount: number
  itemName?: string
  itemImage?: string
  color: string
  probability: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdatePrizeRequest {
  id: number
  name: string
  type: string
  amount: number
  itemName?: string
  itemImage?: string
  color: string
  probability: number
  enabled: boolean
}

export interface Settings {
  id: number
  maxSpinsPerDay: number
  enabled: boolean
  resetTime: string
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsRequest {
  maxSpinsPerDay: number
  enabled: boolean
  resetTime: string
}

export interface Stats {
  totalSpins: number
  todaySpins: number
  totalPrizeAmount: number
  todayPrizeAmount: number
  activeMembers: number
}

export interface SpinLog {
  id: number
  memberId: string
  prizeName: string
  prizeType: string
  amount: number
  spunAt: string
}

export interface SpinLogsResponse {
  logs: SpinLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const adminLuckyWheelAPI = {
  // Get all prizes
  getAllPrizes: async (): Promise<Prize[]> => {
    const response = await client.get('/lucky-wheel/prizes')
    return response.data.data
  },

  // Update single prize
  updatePrize: async (id: number, data: UpdatePrizeRequest): Promise<void> => {
    await client.put(`/lucky-wheel/prizes/${id}`, data)
  },

  // Update multiple prizes
  updatePrizes: async (prizes: UpdatePrizeRequest[]): Promise<void> => {
    await client.put('/lucky-wheel/prizes', { prizes })
  },

  // Get settings
  getSettings: async (): Promise<Settings> => {
    const response = await client.get('/lucky-wheel/settings')
    return response.data.data
  },

  // Update settings
  updateSettings: async (data: UpdateSettingsRequest): Promise<void> => {
    await client.put('/lucky-wheel/settings', data)
  },

  // Get statistics
  getStats: async (): Promise<Stats> => {
    const response = await client.get('/lucky-wheel/stats')
    return response.data.data
  },

  // Get spin logs
  getSpinLogs: async (page: number = 1, limit: number = 20): Promise<SpinLogsResponse> => {
    const response = await client.get(`/lucky-wheel/logs?page=${page}&limit=${limit}`)
    return response.data.data
  },
}
