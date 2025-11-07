// ============================================
// Admin Types
// ============================================

export interface Admin {
  id: string
  username: string
  role: 'superadmin' | 'admin' | 'operator'
  name: string
  email?: string
  isActive: boolean
  lastLoginAt?: string
  lastLoginIP?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  today: {
    totalDeposits: number
    totalWithdrawals: number
    totalMembers: number
    activeMembers: number
    pendingDeposits: number
    pendingWithdrawals: number
    profit: number
  }
  thisWeek: {
    totalDeposits: number
    totalWithdrawals: number
    newMembers: number
    profit: number
  }
  thisMonth: {
    totalDeposits: number
    totalWithdrawals: number
    newMembers: number
    profit: number
  }
}

export interface RecentTransaction {
  id: string
  memberId: string
  memberPhone: string
  memberFullname?: string
  type: 'deposit' | 'withdrawal' | 'credit_adjustment' | 'game_transfer'
  amount: number
  status: 'pending' | 'completed' | 'rejected' | 'cancelled'
  createdAt: string
}

// ============================================
// Credit Adjustment Types
// ============================================

export interface CreditAdjustment {
  id: string
  memberId: string
  adminId: string
  type: 'ADD' | 'DEDUCT'
  amount: number
  beforeBalance: number
  afterBalance: number
  remark: string
  createdAt: string
}

export interface CreditHistoryResponse {
  adjustments: CreditAdjustment[]
  total: number
  page: number
  pageSize: number
}

export interface CreditStats {
  totalAdded: number
  totalDeducted: number
  totalAdjustments: number
  netChange: number
}

// ============================================
// Deposit Types
// ============================================

export interface Deposit {
  id: string
  memberId: string
  amount: number
  bankAccountId?: string
  bankName?: string
  bankAccount?: string
  slipUrl?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  remark?: string
  bonusAmount?: number
  createdAt: string
  updatedAt: string
}

export interface DepositWithMember extends Deposit {
  memberPhone: string
  memberFullname?: string
  memberCredit: number
}

export interface DepositDetails {
  deposit: DepositWithMember
  memberInfo: {
    totalDepositsCount: number
    totalDepositAmount: number
    totalWithdrawalsCount: number
    totalWithdrawalAmount: number
  }
  recentDeposits: Deposit[]
  recentWithdrawals: Withdrawal[]
}

// ============================================
// Withdrawal Types
// ============================================

export interface Withdrawal {
  id: string
  memberId: string
  amount: number
  bankName: string
  bankAccount: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  remark?: string
  actualAmount?: number
  createdAt: string
  updatedAt: string
}

export interface WithdrawalWithMember extends Withdrawal {
  memberPhone: string
  memberFullname?: string
  memberCredit: number
}

export interface WithdrawalDetails {
  withdrawal: WithdrawalWithMember
  memberInfo: {
    totalDepositsCount: number
    totalDepositAmount: number
    totalWithdrawalsCount: number
    totalWithdrawalAmount: number
  }
  recentDeposits: Deposit[]
  recentWithdrawals: Withdrawal[]
}

// ============================================
// Member Management Types
// ============================================

export interface Member {
  id: string
  phone: string
  fullname?: string
  credit: number
  totalDeposit: number
  totalWithdrawal: number
  bankName?: string
  bankAccount?: string
  lineId?: string
  status: 'active' | 'inactive' | 'banned'
  lastLoginAt?: string
  lastLoginIP?: string
  createdAt: string
  updatedAt: string
}

export interface MemberDetails extends Member {
  stats: {
    totalDeposits: number
    totalWithdrawals: number
    totalBets: number
    totalWins: number
    totalLosses: number
    profitLoss: number
  }
  recentTransactions: RecentTransaction[]
}

export interface MemberListResponse {
  members: Member[]
  total: number
  page: number
  pageSize: number
}

// ============================================
// Promotion Types
// ============================================

export interface Promotion {
  id: string
  name: string
  description: string
  promotionType: 'deposit' | 'turnover' | 'loss_rebate' | 'special'
  depositRequirement?: number
  bonusType: 'percentage' | 'fixed'
  bonusValue: number
  maxBonus?: number
  turnoverMultiplier?: number
  isActive: boolean
  startDate?: string
  endDate?: string
  termsAndConditions?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface PromotionStats {
  totalUsage: number
  totalBonusGiven: number
  totalTurnoverCompleted: number
  averageBonusPerUser: number
}

export interface PromotionUsage {
  id: string
  memberId: string
  memberPhone: string
  memberFullname?: string
  promotionId: string
  promotionName: string
  bonusAmount: number
  turnoverRequirement: number
  turnoverCompleted: number
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  appliedAt: string
  completedAt?: string
}

// ============================================
// Bank Account Types
// ============================================

export interface BankAccount {
  id: string
  bankName: string
  bankCode?: string
  accountNumber: string
  accountName: string
  accountType: 'savings' | 'current'
  isActive: boolean
  isDefault: boolean
  dailyDepositLimit?: number
  dailyWithdrawalLimit?: number
  currentDailyDepositUsage: number
  currentDailyWithdrawalUsage: number
  lastResetAt: string
  createdAt: string
  updatedAt: string
}

export interface BankAccountStats {
  totalAccounts: number
  activeAccounts: number
  totalDailyDeposits: number
  totalDailyWithdrawals: number
  depositLimitUtilization: number
  withdrawalLimitUtilization: number
}

// ============================================
// Common Types
// ============================================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}
