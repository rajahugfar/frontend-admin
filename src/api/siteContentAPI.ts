import { apiClient, publicApiClient } from './client'
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
    publicApiClient.get<{ data: PromotionBanner[] }>(`/public/promotions?location=${location}`),

  /**
   * Get all active game categories
   */
  getGameCategories: () =>
    publicApiClient.get<{ data: GameCategory[] }>('/public/game-categories'),

  /**
   * Get game providers
   * @param featured - If true, only return featured providers
   */
  getGameProviders: (featured?: boolean) =>
    publicApiClient.get<{ data: GameProvider[] }>(
      `/public/game-providers${featured ? '?featured=true' : ''}`
    ),

  /**
   * Get all public site settings
   */
  getSiteSettings: () =>
    publicApiClient.get<{ data: SiteSettingsMap }>('/public/settings'),

  // ==================== Admin APIs ====================

  admin: {
    // ---------- Site Images ----------

    /**
     * Get all site images
     */
    getSiteImages: (params?: { category_id?: string; is_active?: boolean }) =>
      apiClient.get<{ data: SiteImage[] }>('/site-images', { params }),

    /**
     * Get site image by ID
     */
    getSiteImageByID: (id: string) =>
      apiClient.get<{ data: SiteImage }>(`/site-images/${id}`),

    /**
     * Upload new image
     */
    uploadImage: (formData: FormData) =>
      apiClient.post<{ data: SiteImage }>('/site-images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),

    /**
     * Update image metadata
     */
    updateImage: (id: string, data: Partial<SiteImage>) =>
      apiClient.put<{ data: SiteImage }>(`/site-images/${id}`, data),

    /**
     * Delete image
     */
    deleteImage: (id: string) =>
      apiClient.delete(`/site-images/${id}`),

    /**
     * Get image categories
     */
    getImageCategories: () =>
      apiClient.get<{ data: any[] }>('/site-images/categories'),

    // ---------- Promotion Banners ----------

    /**
     * Get all promotion banners
     */
    getPromotionBanners: (location?: string) =>
      apiClient.get<{ data: PromotionBanner[] }>(
        `/promotion-banners${location ? `?location=${location}` : ''}`
      ),

    /**
     * Get promotion banner by ID
     */
    getPromotionBannerByID: (id: string) =>
      apiClient.get<{ data: PromotionBanner }>(`/promotion-banners/${id}`),

    /**
     * Create new promotion banner
     */
    createPromotionBanner: (data: Partial<PromotionBanner>) =>
      apiClient.post<{ data: PromotionBanner }>('/promotion-banners', data),

    /**
     * Update promotion banner
     */
    updatePromotionBanner: (id: string, data: Partial<PromotionBanner>) =>
      apiClient.put<{ data: PromotionBanner }>(`/promotion-banners/${id}`, data),

    /**
     * Delete promotion banner
     */
    deletePromotionBanner: (id: string) =>
      apiClient.delete(`/promotion-banners/${id}`),

    // ---------- Game Categories ----------

    /**
     * Get all game categories (admin)
     */
    getGameCategories: (isActive?: boolean) =>
      apiClient.get<{ data: GameCategory[] }>(
        `/game-categories${isActive !== undefined ? `?is_active=${isActive}` : ''}`
      ),

    /**
     * Get game category by ID
     */
    getGameCategoryByID: (id: string) =>
      apiClient.get<{ data: GameCategory }>(`/game-categories/${id}`),

    /**
     * Create new game category
     */
    createGameCategory: (data: Partial<GameCategory>) =>
      apiClient.post<{ data: GameCategory }>('/game-categories', data),

    /**
     * Update game category
     */
    updateGameCategory: (id: string, data: Partial<GameCategory>) =>
      apiClient.put<{ data: GameCategory }>(`/game-categories/${id}`, data),

    /**
     * Delete game category
     */
    deleteGameCategory: (id: string) =>
      apiClient.delete(`/game-categories/${id}`),

    // ---------- Game Providers ----------

    /**
     * Get all game providers (admin)
     */
    getGameProviders: (params?: { category_id?: string; is_active?: boolean; is_featured?: boolean }) =>
      apiClient.get<{ data: GameProvider[] }>('/game-providers', { params }),

    /**
     * Get game provider by ID
     */
    getGameProviderByID: (id: string) =>
      apiClient.get<{ data: GameProvider }>(`/game-providers/${id}`),

    /**
     * Create new game provider
     */
    createGameProvider: (data: Partial<GameProvider>) =>
      apiClient.post<{ data: GameProvider }>('/game-providers', data),

    /**
     * Update game provider
     */
    updateGameProvider: (id: string, data: Partial<GameProvider>) =>
      apiClient.put<{ data: GameProvider }>(`/game-providers/${id}`, data),

    /**
     * Delete game provider
     */
    deleteGameProvider: (id: string) =>
      apiClient.delete(`/game-providers/${id}`),

    // ---------- Site Settings ----------

    /**
     * Get all site settings
     */
    getSiteSettings: (groupName?: string) =>
      apiClient.get<{ data: SiteSetting[] }>(
        `/site-settings${groupName ? `?group_name=${groupName}` : ''}`
      ),

    /**
     * Get site setting by key
     */
    getSiteSettingByKey: (key: string) =>
      apiClient.get<{ data: SiteSetting }>(`/site-settings/${key}`),

    /**
     * Update multiple site settings at once
     */
    updateSiteSettings: (request: BulkUpdateSettingsRequest) =>
      apiClient.post<{ message: string }>('/site-settings/bulk-update', request),
  },
}

export default siteContentAPI
