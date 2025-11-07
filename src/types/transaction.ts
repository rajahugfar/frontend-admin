export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | 'adjustment'
  amount: number
  balanceBefore: number
  balanceAfter: number
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  description: string
  referenceId?: string
  createdAt: string
  updatedAt: string
}

export interface Deposit {
  id: string
  userId: string
  amount: number
  channel: 'bank_transfer' | 'promptpay' | 'truewallet' | 'crypto'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  referenceNumber?: string
  slipImage?: string
  bankAccount?: string
  notes?: string
  approvedAt?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  bankName: string
  bankAccount: string
  accountName: string
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled'
  rejectionReason?: string
  processedAt?: string
  processedBy?: string
  createdAt: string
  updatedAt: string
}

export interface BankAccount {
  id: string
  userId: string
  bankName: string
  accountNumber: string
  accountName: string
  isDefault: boolean
  createdAt: string
}

export interface DepositRequest {
  amount: number
  channel: string
  slipImage?: File
}

export interface WithdrawalRequest {
  amount: number
  bankAccountId: string
}
