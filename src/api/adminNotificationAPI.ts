import apiClient from './client'

// Types
export interface Notification {
  id: string
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'CASHBACK' | 'SYSTEM'
  title: string
  message: string
  referenceType?: string
  referenceId?: string
  adminId?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationParams {
  limit?: number
  offset?: number
}

// Admin Notification APIs
export const adminNotificationAPI = {
  // Get notifications
  getNotifications: async (params?: NotificationParams): Promise<Notification[]> => {
    const response = await apiClient.get('/admin/notifications', { params })
    return response.data.data
  },

  // Get unread notifications
  getUnreadNotifications: async (limit = 20): Promise<Notification[]> => {
    const response = await apiClient.get('/admin/notifications/unread', {
      params: { limit },
    })
    return response.data.data
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/admin/notifications/unread/count')
    return response.data.data.count
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/admin/notifications/${id}/read`)
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/admin/notifications/read-all')
  },
}

export default adminNotificationAPI
