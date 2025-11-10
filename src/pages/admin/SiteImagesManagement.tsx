import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { FaImage, FaUpload, FaTrash, FaEdit, FaSearch, FaTimes } from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import type { SiteImage, ImageCategory } from '@/types/siteContent'

const SiteImagesManagement = () => {
  const [images, setImages] = useState<SiteImage[]>([])
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    category_id: '',
    code: '',
    title: '',
    alt_text: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [imagesRes, categoriesRes] = await Promise.all([
        siteContentAPI.admin.getSiteImages(),
        siteContentAPI.admin.getImageCategories(),
      ])
      setImages(imagesRes.data.data || [])
      setCategories(categoriesRes.data.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP, GIF)')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 10MB')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('category_id', uploadForm.category_id || '00000000-0000-0000-0000-000000000000')
    formData.append('code', uploadForm.code || `img-${Date.now()}`)
    formData.append('title', uploadForm.title || file.name)
    if (uploadForm.alt_text) {
      formData.append('alt_text', uploadForm.alt_text)
    }

    try {
      await siteContentAPI.admin.uploadImage(formData)
      toast.success('อัปโหลดรูปภาพสำเร็จ')
      setShowUploadModal(false)
      setUploadForm({ category_id: '', code: '', title: '', alt_text: '' })
      loadData()
    } catch (error: any) {
      console.error('Upload failed:', error)
      toast.error(error.response?.data?.error || 'ไม่สามารถอัปโหลดรูปภาพได้')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUpdateImage = async () => {
    if (!editingImage) return

    try {
      await siteContentAPI.admin.updateImage(editingImage.id, {
        title: editingImage.title,
        alt_text: editingImage.alt_text,
        code: editingImage.code,
        is_active: editingImage.is_active,
      })
      toast.success('อัปเดตข้อมูลสำเร็จ')
      setEditingImage(null)
      loadData()
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('ไม่สามารถอัปเดตข้อมูลได้')
    }
  }

  const handleDeleteImage = async (id: string, title: string) => {
    if (!confirm(`ต้องการลบรูปภาพ "${title}" ใช่หรือไม่?`)) return

    try {
      await siteContentAPI.admin.deleteImage(id)
      toast.success('ลบรูปภาพสำเร็จ')
      loadData()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('ไม่สามารถลบรูปภาพได้')
    }
  }

  // Filter images
  const filteredImages = images.filter((image) => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || image.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-admin-bg">
        <div className="text-gold-500">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-admin-card to-brown-900 border-b border-admin-border shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-2">
                <FaImage />
                จัดการรูปภาพ
              </h1>
              <p className="text-brown-300">
                รูปภาพทั้งหมด {images.length} รูป
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-all flex items-center gap-2"
            >
              <FaUpload />
              อัปโหลดรูป
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อหรือ code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
            <FaImage className="text-6xl text-brown-600 mx-auto mb-4" />
            <p className="text-brown-400">ไม่พบรูปภาพ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="bg-admin-card border border-admin-border rounded-xl p-3 hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-square mb-2 rounded overflow-hidden bg-admin-bg">
                  <img
                    src={image.file_url}
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {!image.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-error text-white px-2 py-1 rounded text-xs">
                        ปิดใช้งาน
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <p className="font-semibold text-sm truncate text-brown-200" title={image.title}>
                    {image.title}
                  </p>
                  <p className="text-xs text-brown-400 truncate" title={image.code}>
                    {image.code}
                  </p>
                  {image.width && image.height && (
                    <p className="text-xs text-brown-500">
                      {image.width} × {image.height}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingImage(image)}
                    className="flex-1 px-2 py-1 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id, image.title)}
                    className="flex-1 px-2 py-1 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    title="ลบ"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-bold text-gold-500">อัปโหลดรูปภาพ</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-brown-400 hover:text-gold-500 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">หมวดหมู่</label>
                <select
                  value={uploadForm.category_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">Code</label>
                <input
                  type="text"
                  value={uploadForm.code}
                  onChange={(e) => setUploadForm({ ...uploadForm, code: e.target.value })}
                  placeholder="เช่น logo, btn-main-play"
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">ชื่อรูป</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="ชื่อรูปภาพ"
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={uploadForm.alt_text}
                  onChange={(e) => setUploadForm({ ...uploadForm, alt_text: e.target.value })}
                  placeholder="คำอธิบายรูปภาพ"
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">เลือกไฟล์</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white hover:file:bg-gold-600 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <p className="text-xs text-brown-400 mt-1">
                  รองรับ JPEG, PNG, WebP, GIF (สูงสุด 10MB)
                </p>
              </div>

              {uploading && (
                <div className="text-center py-4">
                  <div className="text-gold-500">กำลังอัปโหลด...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-bold text-gold-500">แก้ไขรูปภาพ</h2>
              <button
                onClick={() => setEditingImage(null)}
                className="text-brown-400 hover:text-gold-500 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-video rounded overflow-hidden bg-admin-bg border border-admin-border">
                <img
                  src={editingImage.file_url}
                  alt={editingImage.alt_text || editingImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">Code</label>
                <input
                  type="text"
                  value={editingImage.code}
                  onChange={(e) => setEditingImage({ ...editingImage, code: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">ชื่อรูป</label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-300 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={editingImage.alt_text || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, alt_text: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingImage.is_active}
                  onChange={(e) => setEditingImage({ ...editingImage, is_active: e.target.checked })}
                  className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                />
                <label htmlFor="is_active" className="text-sm text-brown-300 cursor-pointer">
                  เปิดใช้งาน
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdateImage}
                  className="flex-1 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-all"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditingImage(null)}
                  className="flex-1 px-4 py-2 bg-admin-bg hover:bg-admin-hover text-brown-300 border border-admin-border rounded-lg transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SiteImagesManagement
