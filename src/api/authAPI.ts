import apiClient from './client'
import type { LoginCredentials, RegisterData, AuthResponse, RefreshTokenResponse } from '@types/auth'

export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/member/login', credentials)
    const { accessToken, refreshToken, member } = response.data.data
    return {
      user: member,
      accessToken,
      refreshToken
    }
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/member/register', data)
    const { accessToken, refreshToken, member } = response.data.data
    return {
      user: member,
      accessToken,
      refreshToken
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/user/profile')
    return response.data
  },

  // Update profile
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/user/profile', data)
    return response.data
  },

  // Change password
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await apiClient.post('/user/change-password', data)
    return response.data
  },
}
