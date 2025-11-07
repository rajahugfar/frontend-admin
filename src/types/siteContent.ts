export interface SiteImage {
  id: string
  category_id?: string
  code: string
  title: string
  description?: string
  file_path: string
  file_url: string
  file_size?: number
  width?: number
  height?: number
  mime_type: string
  alt_text?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  category?: ImageCategory
}

export interface ImageCategory {
  id: string
  code: string
  name: string
  description?: string
  sort_order: number
  is_active: boolean
}

export interface PromotionBanner {
  id: string
  title: string
  description?: string
  image_id?: string
  link_url?: string
  display_location: 'home' | 'member' | 'both'
  sort_order: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  image?: SiteImage
}

export interface GameCategory {
  id: string
  code: string
  name: string
  description?: string
  icon_image_id?: string
  button_image_id?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  icon_image?: SiteImage
  button_image?: SiteImage
}

export interface GameProvider {
  id: string
  code: string
  name: string
  description?: string
  logo_image_id?: string
  thumbnail_image_id?: string
  category_id?: string
  sort_order: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  logo_image?: SiteImage
  thumbnail_image?: SiteImage
  category?: GameCategory
}

export interface LandingSection {
  id: string
  code: string
  title?: string
  subtitle?: string
  section_type: 'hero' | 'grid' | 'carousel' | 'custom'
  background_image_id?: string
  sort_order: number
  is_active: boolean
  settings?: string
  created_at: string
  updated_at: string
  background_image?: SiteImage
  items?: LandingSectionItem[]
}

export interface LandingSectionItem {
  id: string
  section_id: string
  title?: string
  description?: string
  image_id?: string
  link_url?: string
  button_text?: string
  sort_order: number
  is_active: boolean
  settings?: string
  created_at: string
  updated_at: string
  image?: SiteImage
}

export interface SiteSetting {
  id: string
  setting_key: string
  setting_value?: string
  setting_type: 'text' | 'number' | 'boolean' | 'json' | 'image'
  description?: string
  group_name?: string
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface SiteSettingsMap {
  [key: string]: string
}

// Request/Response types
export interface UploadImageRequest {
  image: File
  category_id: string
  code: string
  title: string
  alt_text?: string
}

export interface BulkUpdateSettingsRequest {
  settings: Array<{
    setting_key: string
    setting_value: string
  }>
}
