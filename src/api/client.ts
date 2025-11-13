import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

export const apiClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}/admin`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for admin_session cookie
})

// Public API client (no /admin prefix)
export const publicApiClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor - Add admin selector:token (backend expects both)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const adminSelector = localStorage.getItem('admin_selector')
    const adminToken = localStorage.getItem('admin_token')
    if (adminSelector && adminToken && config.headers) {
      // Backend expects "selector:token" format
      config.headers.Authorization = `Bearer ${adminSelector}:${adminToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
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
        window.location.replace('/login')
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

export default apiClient
