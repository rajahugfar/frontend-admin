import { adminAPIClient } from './adminAPI'

// Types
export interface WithdrawalWithMember {
  id: string
  memberId: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  bankCode: string
  bankNumber: string
  bankName: string
  autoApproved: boolean
  memberPhone: string
  memberFullname: string
  memberCredit: number
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  remark?: string
}

export interface PendingWithdrawalsResponse {
  withdrawals: WithdrawalWithMember[]
  total: number
  page: number
  pageSize: number
}

export interface WithdrawalDetailsResponse {
  withdrawal: WithdrawalWithMember
  member: any
  recentWithdrawals: WithdrawalWithMember[]
  recentDeposits: any[]
  totalWithdrawals: number
  totalWithdrawalAmount: number
}

export interface ApproveWithdrawalRequest {
  paymentMethod?: 'manual' | 'auto'
  gateway?: string
  slipUrl?: string
  pinCode?: string
  remark?: string
}

export interface RejectWithdrawalRequest {
  reason: string
  pinCode?: string
}

export interface BulkApproveRequest {
  withdrawalIds: string[]
  paymentMethod?: 'manual' | 'auto'
  gateway?: string
  pinCode?: string
}

export interface AutoWithdrawalSettings {
  id: string
  enabled: boolean
  maxAutoAmount: number
  minMemberDeposits: number
  minAccountAgeDays: number
  requireBankVerification: boolean
  notifyAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateAutoWithdrawalSettingsRequest {
  enabled: boolean
  maxAutoAmount: number
  minMemberDeposits: number
  minAccountAgeDays: number
  requireBankVerification: boolean
  notifyAdmin: boolean
}

// Admin Withdrawal APIs
export const adminWithdrawalAPI = {
  // Get pending withdrawals
  getPendingWithdrawals: async (limit = 20, offset = 0): Promise<PendingWithdrawalsResponse> => {
    const response = await adminAPIClient.get('/withdrawals/pending', {
      params: { limit, offset },
    })
    return response.data
  },

  getWithdrawalDetails: async (id: string): Promise<WithdrawalDetailsResponse> => {
    const response = await adminAPIClient.get(`/withdrawals/${id}`)
    return response.data
  },

  approveWithdrawal: async (id: string, data: ApproveWithdrawalRequest) => {
    return adminAPIClient.post(`/withdrawals/${id}/approve`, data)
  },

  rejectWithdrawal: async (id: string, data: RejectWithdrawalRequest) => {
    return adminAPIClient.post(`/withdrawals/${id}/reject`, data)
  },

  cancelWithdrawal: async (id: string) => {
    return adminAPIClient.post(`/withdrawals/${id}/cancel`)
  },

  // Bulk operations
  bulkApprove: async (ids: string[], data: ApproveWithdrawalRequest) => {
    const response = await adminAPIClient.post('/withdrawals/bulk-approve', {
      ids,
      ...data,
    })
    return response.data
  },

  bulkReject: async (ids: string[], reason: string) => {
    const response = await adminAPIClient.post('/withdrawals/bulk-reject', {
      ids,
      reason,
    })
    return response.data
  },

  getAllWithdrawals: async (page = 1, pageSize = 20, status?: string) => {
    const response = await adminAPIClient.get('/withdrawals', {
      params: { page, pageSize, status },
    })
    return response.data
  },

  // Update auto-approval settings
  updateAutoSettings: async (data: UpdateAutoWithdrawalSettingsRequest): Promise<AutoWithdrawalSettings> => {
    const response = await adminAPIClient.put('/withdrawals/auto-settings', data)
    return response.data.data
  },
}

export default adminWithdrawalAPI
