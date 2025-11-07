import { apiClient } from './client'
import type {
  SiteImage,
  PromotionBanner,
  GameCategory,
  GameProvider,
  SiteSetting,
  SiteSettingsMap,
  BulkUpdateSettingsRequest,
} from '../types/siteContent'

export const siteContentAPI = {
  // ==================== Public APIs ====================

  /**
   * Get active promotions for display
   */
  getPromotions: (location: 'home' | 'member' = 'home') =>
    apiClient.get<{ data: PromotionBanner[] }>(`/public/promotions?location=${location}`),

  /**
   * Get all active game categories
   */
  getGameCategories: () =>
    apiClient.get<{ data: GameCategory[] }>('/public/game-categories'),

  /**
   * Get game providers
   * @param featured - If true, only return featured providers
   */
  getGameProviders: (featured?: boolean) =>
    apiClient.get<{ data: GameProvider[] }>(
      `/public/game-providers${featured ? '?featured=true' : ''}`
    ),

  /**
   * Get all public site settings
   */
  getSiteSettings: () =>
    apiClient.get<{ data: SiteSettingsMap }>('/public/settings'),

  // ==================== Admin APIs ====================

  admin: {
    // ---------- Site Images ----------

    /**
     * Get all site images
     */
    getSiteImages: (params?: { category_id?: string; is_active?: boolean }) =>
      apiClient.get<{ data: SiteImage[] }>('/admin/site-images', { params }),

    /**
     * Get site image by ID
     */
    getSiteImageByID: (id: string) =>
      apiClient.get<{ data: SiteImage }>(`/admin/site-images/${id}`),

    /**
     * Upload new image
     */
    uploadImage: (formData: FormData) =>
      apiClient.post<{ data: SiteImage }>('/admin/site-images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),

    /**
     * Update image metadata
     */
    updateImage: (id: string, data: Partial<SiteImage>) =>
      apiClient.put<{ data: SiteImage }>(`/admin/site-images/${id}`, data),

    /**
     * Delete image
     */
    deleteImage: (id: string) =>
      apiClient.delete(`/admin/site-images/${id}`),

    // ---------- Promotion Banners ----------

    /**
     * Get all promotion banners
     */
    getPromotionBanners: (location?: string) =>
      apiClient.get<{ data: PromotionBanner[] }>(
        `/admin/promotion-banners${location ? `?location=${location}` : ''}`
      ),

    /**
     * Get promotion banner by ID
     */
    getPromotionBannerByID: (id: string) =>
      apiClient.get<{ data: PromotionBanner }>(`/admin/promotion-banners/${id}`),

    /**
     * Create new promotion banner
     */
    createPromotionBanner: (data: Partial<PromotionBanner>) =>
      apiClient.post<{ data: PromotionBanner }>('/admin/promotion-banners', data),

    /**
     * Update promotion banner
     */
    updatePromotionBanner: (id: string, data: Partial<PromotionBanner>) =>
      apiClient.put<{ data: PromotionBanner }>(`/admin/promotion-banners/${id}`, data),

    /**
     * Delete promotion banner
     */
    deletePromotionBanner: (id: string) =>
      apiClient.delete(`/admin/promotion-banners/${id}`),

    // ---------- Game Categories ----------

    /**
     * Get all game categories (admin)
     */
    getGameCategories: (isActive?: boolean) =>
      apiClient.get<{ data: GameCategory[] }>(
        `/admin/game-categories${isActive !== undefined ? `?is_active=${isActive}` : ''}`
      ),

    /**
     * Get game category by ID
     */
    getGameCategoryByID: (id: string) =>
      apiClient.get<{ data: GameCategory }>(`/admin/game-categories/${id}`),

    /**
     * Create new game category
     */
    createGameCategory: (data: Partial<GameCategory>) =>
      apiClient.post<{ data: GameCategory }>('/admin/game-categories', data),

    /**
     * Update game category
     */
    updateGameCategory: (id: string, data: Partial<GameCategory>) =>
      apiClient.put<{ data: GameCategory }>(`/admin/game-categories/${id}`, data),

    /**
     * Delete game category
     */
    deleteGameCategory: (id: string) =>
      apiClient.delete(`/admin/game-categories/${id}`),

    // ---------- Game Providers ----------

    /**
     * Get all game providers (admin)
     */
    getGameProviders: (params?: { category_id?: string; is_active?: boolean; is_featured?: boolean }) =>
      apiClient.get<{ data: GameProvider[] }>('/admin/game-providers', { params }),

    /**
     * Get game provider by ID
     */
    getGameProviderByID: (id: string) =>
      apiClient.get<{ data: GameProvider }>(`/admin/game-providers/${id}`),

    /**
     * Create new game provider
     */
    createGameProvider: (data: Partial<GameProvider>) =>
      apiClient.post<{ data: GameProvider }>('/admin/game-providers', data),

    /**
     * Update game provider
     */
    updateGameProvider: (id: string, data: Partial<GameProvider>) =>
      apiClient.put<{ data: GameProvider }>(`/admin/game-providers/${id}`, data),

    /**
     * Delete game provider
     */
    deleteGameProvider: (id: string) =>
      apiClient.delete(`/admin/game-providers/${id}`),

    // ---------- Site Settings ----------

    /**
     * Get all site settings
     */
    getSiteSettings: (groupName?: string) =>
      apiClient.get<{ data: SiteSetting[] }>(
        `/admin/site-settings${groupName ? `?group_name=${groupName}` : ''}`
      ),

    /**
     * Get site setting by key
     */
    getSiteSettingByKey: (key: string) =>
      apiClient.get<{ data: SiteSetting }>(`/admin/site-settings/${key}`),

    /**
     * Update multiple site settings at once
     */
    updateSiteSettings: (request: BulkUpdateSettingsRequest) =>
      apiClient.post<{ message: string }>('/admin/site-settings/bulk-update', request),
  },
}

export default siteContentAPI
