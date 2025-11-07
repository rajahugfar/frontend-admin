import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

export interface ReferralStats {
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  totalCommission: number
  pendingCommission: number
  withdrawnCommission: number
  commissionByType: {
    casino: number
    slot: number
    lottery: number
    crypto: number
    sport: number
  }
}

export interface ReferralMember {
  id: number
  username: string
  phone: string
  registeredAt: string
  totalBet: number
  commission: number
  status: string
}

export interface CommissionRate {
  type: string
  rate: number
  maxDaily: number
  calculationType: 'turnover' | 'profit'
}

export interface ReferralResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const referralAPI = {
  // Get user's referral stats
  getStats: async (): Promise<ReferralResponse<ReferralStats>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referral/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch referral stats:', error)
      throw error
    }
  },

  // Get list of referred members
  getReferredMembers: async (page = 1, limit = 10): Promise<ReferralResponse<{ members: ReferralMember[]; total: number }>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referral/members`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch referred members:', error)
      throw error
    }
  },

  // Get commission rates
  getCommissionRates: async (): Promise<ReferralResponse<CommissionRate[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referral/rates`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch commission rates:', error)
      throw error
    }
  },

  // Request commission withdrawal
  requestWithdrawal: async (amount: number): Promise<ReferralResponse<any>> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/referral/withdraw`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to request withdrawal:', error)
      throw error
    }
  },

  // Get mock data for development
  getMockStats: (): ReferralResponse<ReferralStats> => {
    return {
      success: true,
      data: {
        referralCode: 'ABC123',
        totalReferrals: 25,
        activeReferrals: 18,
        totalCommission: 15420,
        pendingCommission: 2340,
        withdrawnCommission: 13080,
        commissionByType: {
          casino: 4200,
          slot: 5600,
          lottery: 3800,
          crypto: 1200,
          sport: 620
        }
      }
    }
  },

  getMockMembers: (): ReferralResponse<{ members: ReferralMember[]; total: number }> => {
    const members: ReferralMember[] = [
      {
        id: 1,
        username: 'user001',
        phone: '0981234567',
        registeredAt: '2025-10-15',
        totalBet: 50000,
        commission: 850,
        status: 'active'
      },
      {
        id: 2,
        username: 'user002',
        phone: '0982345678',
        registeredAt: '2025-10-20',
        totalBet: 35000,
        commission: 620,
        status: 'active'
      },
      {
        id: 3,
        username: 'user003',
        phone: '0983456789',
        registeredAt: '2025-10-25',
        totalBet: 28000,
        commission: 490,
        status: 'active'
      }
    ]

    return {
      success: true,
      data: {
        members,
        total: members.length
      }
    }
  },

  getMockRates: (): ReferralResponse<CommissionRate[]> => {
    return {
      success: true,
      data: [
        { type: 'casino', rate: 0.3, maxDaily: 5000, calculationType: 'turnover' },
        { type: 'slot', rate: 0.5, maxDaily: 5000, calculationType: 'turnover' },
        { type: 'lottery', rate: 3.0, maxDaily: 5000, calculationType: 'turnover' },
        { type: 'crypto', rate: 0.3, maxDaily: 5000, calculationType: 'turnover' },
        { type: 'sport', rate: 1.0, maxDaily: 2000, calculationType: 'profit' }
      ]
    }
  }
}
