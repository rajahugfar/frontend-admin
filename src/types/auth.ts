export interface User {
  id: string
  phone: string
  fullname: string | null
  bankCode: string | null
  bankNumber: string | null
  credit: number
  creditGame: number
  ambUsername: string | null
  status: string
  createdAt: string
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegisterData {
  phone: string
  password: string
  fullname: string
  bankCode: string
  bankNumber: string
  line?: string
  ref?: string
  promotionId?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}
