import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Admin } from '@/types/admin'
import { adminAuthAPI, AdminLoginRequest } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface AdminState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (credentials: AdminLoginRequest) => Promise<void>
  logout: () => Promise<void>
  getCurrentAdmin: () => Promise<void>
  setAdmin: (admin: Admin | null) => void
  setToken: (token: string | null) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: AdminLoginRequest) => {
        try {
          set({ isLoading: true })

          const response = await adminAuthAPI.login(credentials)

          // Backend already sends selector in "selector:token" format
          const sessionToken = response.selector

          // Save selector to localStorage (admin ใช้ selector ไม่ใช่ token)
          localStorage.setItem('admin_selector', sessionToken)
          localStorage.setItem('admin_token', response.token) // เก็บ token ไว้ด้วยถ้ามีที่ใช้
          localStorage.setItem('admin_user', JSON.stringify(response.admin))

          set({
            admin: response.admin as Admin,
            token: sessionToken,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`ยินดีต้อนรับ ${response.admin.name || response.admin.username}`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'เข้าสู่ระบบล้มเหลว'
          toast.error(message)
          throw error
        }
      },

      logout: async () => {
        try {
          await adminAuthAPI.logout()
        } catch (error) {
          // Ignore errors during logout
        } finally {
          // Clear state
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_selector')
          localStorage.removeItem('admin_user')

          set({
            admin: null,
            token: null,
            isAuthenticated: false,
          })

          toast.success('ออกจากระบบสำเร็จ')
        }
      },

      getCurrentAdmin: async () => {
        try {
          set({ isLoading: true })
          const admin = await adminAuthAPI.getCurrentAdmin()
          set({
            admin: admin as Admin,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            admin: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_selector')
          localStorage.removeItem('admin_user')
        }
      },

      setAdmin: (admin: Admin | null) => {
        set({ admin, isAuthenticated: !!admin })
      },

      setToken: (token: string | null) => {
        set({ token })
        if (token) {
          localStorage.setItem('admin_selector', token)
        } else {
          localStorage.removeItem('admin_selector')
        }
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
