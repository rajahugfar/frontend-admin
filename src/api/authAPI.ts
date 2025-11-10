import apiClient from './client'

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  admin: {
    id: string
    username: string
    role: string
    fullname?: string
    email?: string
  }
  token: string
  selector: string
  expiresAt?: string
}

export const authAPI = {
  // Admin Login
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post('/login', credentials)
    const data = response.data.data

    // Save selector to localStorage for subsequent requests
    localStorage.setItem('admin_selector', data.selector)
    localStorage.setItem('admin_token', data.token)

    return data
  },

  // Admin Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/logout')
    localStorage.removeItem('admin_selector')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin-storage')
  },

  // Get current admin profile
  getProfile: async () => {
    const response = await apiClient.get('/profile')
    return response.data
  },
}
