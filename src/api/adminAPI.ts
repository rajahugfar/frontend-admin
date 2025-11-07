import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

// Admin API Client (separate from member API)
export const adminAPIClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}/admin`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for admin session cookies
})

// Request interceptor - Add admin selector from localStorage (admin ใช้ selector ไม่ใช่ token)
adminAPIClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const adminSelector = localStorage.getItem('admin_selector')
    if (adminSelector && config.headers) {
      config.headers.Authorization = `Bearer ${adminSelector}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
adminAPIClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message: string }>) => {
    // If error is 401 (Unauthorized), clear session and redirect to login
    if (error.response?.status === 401) {
      // Clear all admin session data
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_selector')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin-storage') // Clear Zustand persist storage

      // Show toast notification
      toast.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')

      // Force redirect to login page (replace to prevent back button)
      setTimeout(() => {
        window.location.replace('/admin/login')
      }, 500)

      return Promise.reject(error)
    }

    // Handle other errors
    const message = error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'

    // Don't show toast for specific error codes (let component handle it)
    const silentErrorCodes = [400, 404, 422]
    if (!silentErrorCodes.includes(error.response?.status || 0)) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

// ============================================
// Admin Auth APIs
// ============================================

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  admin: {
    id: string
    username: string
    role: string
    name: string
    email?: string
  }
  token: string
  selector: string
  expiresAt?: string
}

export const adminAuthAPI = {
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await adminAPIClient.post('/login', data)
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await adminAPIClient.post('/logout')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_selector')
    localStorage.removeItem('admin_user')
  },

  getCurrentAdmin: async () => {
    const response = await adminAPIClient.get('/me')
    return response.data.data
  },
}

// ============================================
// Admin Dashboard APIs
// ============================================

export const adminDashboardAPI = {
  getStats: async (period?: 'today' | 'week' | 'month') => {
    const response = await adminAPIClient.get('/dashboard/stats', {
      params: { period },
    })
    return response.data.data
  },

  getRecentTransactions: async (limit = 10) => {
    const response = await adminAPIClient.get('/dashboard/transactions/recent', {
      params: { limit },
    })
    return response.data.data
  },
}

// ============================================
// Credit Management APIs
// ============================================

export interface AddCreditRequest {
  memberId: string
  amount: number
  adjustmentType: string
  remark: string
  slipUrl?: string
}

export interface DeductCreditRequest {
  memberId: string
  amount: number
  adjustmentType: string
  remark: string
}

export const adminCreditAPI = {
  addCredit: async (data: AddCreditRequest) => {
    const response = await adminAPIClient.post('/credit/add', data)
    return response.data.data
  },

  deductCredit: async (data: DeductCreditRequest) => {
    const response = await adminAPIClient.post('/credit/deduct', data)
    return response.data.data
  },

  getMemberCreditHistory: async (memberId: string, page = 1, pageSize = 20) => {
    const response = await adminAPIClient.get(`/credit/members/${memberId}/history`, {
      params: { page, pageSize },
    })
    return response.data.data
  },

  getCreditStats: async (startDate?: string, endDate?: string) => {
    const response = await adminAPIClient.get('/credit/stats', {
      params: { startDate, endDate },
    })
    return response.data.data
  },
}

// ============================================
// Deposit Approval APIs
// ============================================

export const adminDepositAPI = {
  getDeposits: async (filters: {
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/deposits', { params: filters })
    return response.data.data
  },

  getPendingDeposits: async (page = 1, pageSize = 20) => {
    const response = await adminAPIClient.get('/deposits/pending', {
      params: { page, pageSize },
    })
    return response.data.data
  },

  getDepositDetails: async (depositId: string) => {
    const response = await adminAPIClient.get(`/deposits/${depositId}`)
    return response.data.data
  },

  approveDeposit: async (depositId: string, data: { remark?: string; bonusAmount?: number }) => {
    const response = await adminAPIClient.post(`/deposits/${depositId}/approve`, data)
    return response.data.data
  },

  rejectDeposit: async (depositId: string, data: { reason: string; remark?: string }) => {
    const response = await adminAPIClient.post(`/deposits/${depositId}/reject`, data)
    return response.data.data
  },

  bulkApproveDeposits: async (depositIds: string[], pinCode?: string) => {
    const response = await adminAPIClient.post('/deposits/bulk-approve', {
      depositIds,
      pinCode,
    })
    return response.data.data
  },

  getDepositHistory: async (filters: {
    page?: number
    pageSize?: number
    status?: string
    startDate?: string
    endDate?: string
    memberId?: string
  }) => {
    const response = await adminAPIClient.get('/deposits/history', { params: filters })
    return response.data.data
  },
}

// ============================================
// Withdrawal Approval APIs
// ============================================

export const adminWithdrawalAPI = {
  getWithdrawals: async (filters: {
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/withdrawals', { params: filters })
    return response.data.data
  },

  getPendingWithdrawals: async (page = 1, pageSize = 20) => {
    const response = await adminAPIClient.get('/withdrawals/pending', {
      params: { page, pageSize },
    })
    return response.data.data
  },

  getWithdrawalDetails: async (withdrawalId: string) => {
    const response = await adminAPIClient.get(`/withdrawals/${withdrawalId}`)
    return response.data.data
  },

  approveWithdrawal: async (
    withdrawalId: string,
    data: {
      paymentMethod?: string // "auto" or "manual"
      gateway?: string // Gateway name if auto (bitpayz, scb_auto, autopeer)
      slipUrl?: string // Slip URL if manual
      remark?: string
      actualAmount?: number
    }
  ) => {
    const response = await adminAPIClient.post(`/withdrawals/${withdrawalId}/approve`, data)
    return response.data.data
  },

  rejectWithdrawal: async (withdrawalId: string, data: { reason: string; remark?: string }) => {
    const response = await adminAPIClient.post(`/withdrawals/${withdrawalId}/reject`, data)
    return response.data.data
  },

  bulkApproveWithdrawals: async (
    withdrawalIds: string[],
    data: {
      paymentMethod: string // "auto" or "manual"
      gateway?: string // Gateway name if auto
      pinCode?: string
    }
  ) => {
    const response = await adminAPIClient.post('/withdrawals/bulk-approve', {
      withdrawalIds,
      ...data,
    })
    return response.data.data
  },

  getWithdrawalHistory: async (filters: {
    page?: number
    pageSize?: number
    status?: string
    startDate?: string
    endDate?: string
    memberId?: string
  }) => {
    const response = await adminAPIClient.get('/withdrawals/history', { params: filters })
    return response.data.data
  },
}

// ============================================
// Member Management APIs
// ============================================

export const adminMemberAPI = {
  listMembers: async (filters: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const params: Record<string, any> = {}

    if (filters.page) params.page = filters.page
    if (filters.pageSize) params.pageSize = filters.pageSize
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.sortBy) params.sortBy = filters.sortBy
    if (filters.sortOrder) params.sortOrder = filters.sortOrder

    const response = await adminAPIClient.get('/members', { params })
    return response.data.data
  },

  getMemberDetails: async (memberId: string) => {
    const response = await adminAPIClient.get(`/members/${memberId}`)
    return response.data.data
  },

  createMember: async (data: {
    phone: string
    password: string
    fullname?: string
    bankName?: string
    bankAccount?: string
    lineId?: string
  }) => {
    const response = await adminAPIClient.post('/members', data)
    return response.data.data
  },

  updateMember: async (
    memberId: string,
    data: {
      fullname?: string
      bankName?: string
      bankAccount?: string
      lineId?: string
    }
  ) => {
    const response = await adminAPIClient.put(`/members/${memberId}`, data)
    return response.data.data
  },

  updateMemberStatus: async (memberId: string, status: 'active' | 'inactive' | 'banned') => {
    const response = await adminAPIClient.put(`/members/${memberId}/status`, { status })
    return response.data.data
  },

  resetMemberPassword: async (memberId: string, newPassword: string) => {
    const response = await adminAPIClient.post(`/members/${memberId}/reset-password`, { newPassword })
    return response.data.data
  },

  getMemberTransactions: async (memberId: string, page = 1, pageSize = 20) => {
    const response = await adminAPIClient.get(`/members/${memberId}/transactions`, {
      params: { page, pageSize },
    })
    return response.data.data
  },

  getMemberGameHistory: async (
    memberId: string,
    options?: {
      startDate?: string
      endDate?: string
      productId?: string
      limit?: number
      offset?: number
    }
  ) => {
    const response = await adminAPIClient.get(`/members/${memberId}/game-history`, {
      params: options,
    })
    return response.data.data
  },
}

// ============================================
// Promotion Management APIs
// ============================================

export const adminPromotionAPI = {
  listPromotions: async (page = 1, pageSize = 20) => {
    const response = await adminAPIClient.get('/promotions', {
      params: { page, pageSize },
    })
    return response.data.data
  },

  getPromotion: async (promotionId: string) => {
    const response = await adminAPIClient.get(`/promotions/${promotionId}`)
    return response.data.data
  },

  createPromotion: async (data: any) => {
    const response = await adminAPIClient.post('/promotions', data)
    return response.data.data
  },

  updatePromotion: async (promotionId: string, data: any) => {
    const response = await adminAPIClient.put(`/promotions/${promotionId}`, data)
    return response.data.data
  },

  deletePromotion: async (promotionId: string) => {
    await adminAPIClient.delete(`/promotions/${promotionId}`)
  },

  activatePromotion: async (promotionId: string) => {
    const response = await adminAPIClient.post(`/promotions/${promotionId}/activate`)
    return response.data.data
  },

  deactivatePromotion: async (promotionId: string) => {
    const response = await adminAPIClient.post(`/promotions/${promotionId}/deactivate`)
    return response.data.data
  },

  getPromotionStats: async (promotionId: string) => {
    const response = await adminAPIClient.get(`/promotions/${promotionId}/stats`)
    return response.data.data
  },

  getPromotionUsageList: async (promotionId: string, page = 1, pageSize = 20) => {
    const response = await adminAPIClient.get(`/promotions/${promotionId}/usage`, {
      params: { page, pageSize },
    })
    return response.data.data
  },
}

// ============================================
// Bank Account Management APIs
// ============================================

// ============================================
// Cashback Management APIs
// ============================================

export const adminCashbackAPI = {
  getCashbackList: async (filters: {
    page?: number
    pageSize?: number
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await adminAPIClient.get('/cashback', { params: filters })
    return response.data.data
  },

  approveCashback: async (cashbackId: string, data?: { pinCode?: string }) => {
    const response = await adminAPIClient.post(`/cashback/${cashbackId}/approve`, data || {})
    return response.data.data
  },

  cancelCashback: async (cashbackId: string) => {
    const response = await adminAPIClient.post(`/cashback/${cashbackId}/cancel`)
    return response.data.data
  },

  calculateCashback: async (data: {
    period: 'today' | 'yesterday' | 'custom'
    startDate?: string
    endDate?: string
  }) => {
    const response = await adminAPIClient.post('/cashback/calculate', data)
    return response.data.data
  },

  getCashbackSettings: async () => {
    const response = await adminAPIClient.get('/cashback/settings')
    return response.data.data
  },

  updateCashbackSettings: async (data: {
    enabled: boolean
    percentage: number
    maxAmount: number
    minLoss: number
  }) => {
    const response = await adminAPIClient.put('/cashback/settings', data)
    return response.data.data
  },
}

// ============================================
// Upload API
// ============================================

export const uploadAPI = {
  uploadSlip: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await adminAPIClient.post('/upload/slip', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },
}

// ============================================
// Bank Account Management APIs
// ============================================

export const adminBankAPI = {
  listBankAccounts: async () => {
    const response = await adminAPIClient.get('/bank-accounts')
    return response.data.data
  },

  getBankAccount: async (bankAccountId: string) => {
    const response = await adminAPIClient.get(`/bank-accounts/${bankAccountId}`)
    return response.data.data
  },

  createBankAccount: async (data: any) => {
    const response = await adminAPIClient.post('/bank-accounts', data)
    return response.data.data
  },

  updateBankAccount: async (bankAccountId: string, data: any) => {
    const response = await adminAPIClient.put(`/bank-accounts/${bankAccountId}`, data)
    return response.data.data
  },

  deleteBankAccount: async (bankAccountId: string) => {
    await adminAPIClient.delete(`/bank-accounts/${bankAccountId}`)
  },

  activateBankAccount: async (bankAccountId: string) => {
    const response = await adminAPIClient.post(`/bank-accounts/${bankAccountId}/activate`)
    return response.data.data
  },

  deactivateBankAccount: async (bankAccountId: string) => {
    const response = await adminAPIClient.post(`/bank-accounts/${bankAccountId}/deactivate`)
    return response.data.data
  },

  setDefaultBankAccount: async (bankAccountId: string) => {
    const response = await adminAPIClient.post(`/bank-accounts/${bankAccountId}/set-default`)
    return response.data.data
  },

  resetBankAccountUsage: async (bankAccountId: string) => {
    const response = await adminAPIClient.post(`/bank-accounts/${bankAccountId}/reset-usage`)
    return response.data.data
  },

  resetAllBankAccountsUsage: async () => {
    const response = await adminAPIClient.post('/bank-accounts/reset-all-usage')
    return response.data.data
  },

  getBankAccountStats: async (startDate?: string, endDate?: string) => {
    const response = await adminAPIClient.get('/bank-accounts/stats', {
      params: { startDate, endDate },
    })
    return response.data.data
  },
}

// ============================================
// Transfer Management APIs
// ============================================

export const adminTransferAPI = {
  // Transfer Log
  getTransferLogs: async (params: {
    search?: string
    type?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/transfers/logs', { params })
    return response.data.data
  },

  // Pending Transfer (เครดิตหาย โยกเกมส์)
  getPendingTransfers: async (params: {
    search?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/transfers', { params })
    return response.data.data
  },

  reconcileTransfer: async (transferId: string, remark: string) => {
    const response = await adminAPIClient.post(`/pending/transfers/${transferId}/reconcile`, {
      remark,
    })
    return response.data
  },

  refundTransfer: async (transferId: string, amount: number, reason: string) => {
    const response = await adminAPIClient.post(`/pending/transfers/${transferId}/refund`, {
      amount,
      reason,
    })
    return response.data
  },

  // Pending SCB (จับคู่รายการฝาก SCB)
  getSCBStatements: async (params: {
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/scb', { params })
    return response.data.data
  },

  getPendingDepositsForSCB: async (params: {
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/scb/deposits', { params })
    return response.data.data
  },

  matchSCBDeposit: async (data: { statementId: string; depositId: string }) => {
    const response = await adminAPIClient.post('/pending/scb/match', data)
    return response.data
  },

  unmatchSCBDeposit: async (statementId: string) => {
    const response = await adminAPIClient.post(`/pending/scb/${statementId}/unmatch`)
    return response.data
  },

  // Pending TrueWallet (จับคู่รายการฝาก TrueWallet)
  getTrueWalletStatements: async (params: {
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/truewallet', { params })
    return response.data.data
  },

  getPendingDepositsForTrueWallet: async (params: {
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/truewallet/deposits', { params })
    return response.data.data
  },

  matchTrueWalletDeposit: async (data: { statementId: string; depositId: string }) => {
    const response = await adminAPIClient.post('/pending/truewallet/match', data)
    return response.data
  },

  unmatchTrueWalletDeposit: async (statementId: string) => {
    const response = await adminAPIClient.post(`/pending/truewallet/${statementId}/unmatch`)
    return response.data
  },

  // Pending KBANK (จับคู่รายการฝาก KBANK)
  getKBANKStatements: async (params: {
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/kbank', { params })
    return response.data.data
  },

  getPendingDepositsForKBANK: async (params: {
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/pending/kbank/deposits', { params })
    return response.data.data
  },

  matchKBANKDeposit: async (data: { statementId: string; depositId: string }) => {
    const response = await adminAPIClient.post('/pending/kbank/match', data)
    return response.data
  },

  unmatchKBANKDeposit: async (statementId: string) => {
    const response = await adminAPIClient.post(`/pending/kbank/${statementId}/unmatch`)
    return response.data
  },
}

// ============================================
// Report APIs
// ============================================

export const adminReportAPI = {
  // Profit Report
  getProfitReport: async (params: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }) => {
    const response = await adminAPIClient.get('/reports/profit', { params })
    return response.data.data
  },

  getProfitSummary: async (params: {
    startDate?: string
    endDate?: string
  }) => {
    const response = await adminAPIClient.get('/reports/profit/summary', { params })
    return response.data.data
  },

  getBankSCBReport: async (params: {
    startDate?: string
    endDate?: string
  }) => {
    const response = await adminAPIClient.get('/reports/bank-scb', { params })
    return response.data.data
  },

  getPincodeReport: async (params: {
    startDate?: string
    endDate?: string
    adminId?: string
    action?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/reports/pincode', { params })
    return response.data.data
  },

  getReviews: async (params: {
    status?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/reports/reviews', { params })
    return response.data.data
  },

  approveReview: async (reviewId: string, isDisplayed: boolean) => {
    const response = await adminAPIClient.post(`/reports/reviews/${reviewId}/approve`, {
      isDisplayed,
    })
    return response.data
  },

  rejectReview: async (reviewId: string, reason: string) => {
    const response = await adminAPIClient.post(`/reports/reviews/${reviewId}/reject`, {
      reason,
    })
    return response.data
  },
}

// ============================================
// Staff Management APIs
// ============================================

export const adminStaffAPI = {
  getAllStaff: async (params: { limit?: number; offset?: number }) => {
    const response = await adminAPIClient.get('/system/staff', { params })
    return response.data.data
  },

  getStaffByID: async (id: string) => {
    const response = await adminAPIClient.get(`/system/staff/${id}`)
    return response.data.data
  },

  createStaff: async (data: {
    username: string
    password: string
    fullname: string
    role: string
  }) => {
    const response = await adminAPIClient.post('/system/staff', data)
    return response.data.data
  },

  updateStaff: async (
    id: string,
    data: {
      username?: string
      fullname?: string
      role?: string
    }
  ) => {
    const response = await adminAPIClient.put(`/system/staff/${id}`, data)
    return response.data.data
  },

  updateStaffStatus: async (id: string, data: { isActive: boolean }) => {
    const response = await adminAPIClient.put(`/system/staff/${id}/status`, data)
    return response.data
  },

  deleteStaff: async (id: string) => {
    const response = await adminAPIClient.delete(`/system/staff/${id}`)
    return response.data
  },

  resetPassword: async (id: string, data: { newPassword: string }) => {
    const response = await adminAPIClient.post(`/system/staff/${id}/reset-password`, data)
    return response.data
  },
}

// ============================================
// System APIs
// ============================================

export const adminSystemAPI = {
  getAdminLogs: async (params: {
    adminId?: string
    action?: string
    resourceType?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const response = await adminAPIClient.get('/system/logs', { params })
    return response.data.data
  },
}

// ============================================
// Game Management APIs
// ============================================

export const adminGameAPI = {
  getAllGames: async (params: { limit?: number; offset?: number }) => {
    const response = await adminAPIClient.get('/system/games', { params })
    return response.data.data
  },

  getGameByID: async (id: string) => {
    const response = await adminAPIClient.get(`/system/games/${id}`)
    return response.data.data
  },

  updateGame: async (
    id: string,
    data: {
      gameName?: string
      gameNameTh?: string
      imageUrl?: string
      thumbnailUrl?: string
      isActive?: boolean
      isFeatured?: boolean
      displayOrder?: number
    }
  ) => {
    const response = await adminAPIClient.put(`/system/games/${id}`, data)
    return response.data.data
  },

  toggleGameStatus: async (id: string) => {
    const response = await adminAPIClient.post(`/system/games/${id}/toggle`)
    return response.data.data
  },
}

export default adminAPIClient
