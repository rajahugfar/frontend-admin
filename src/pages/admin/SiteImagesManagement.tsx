import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
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
        // TODO: Add image categories API
        Promise.resolve({ data: { data: [] } }),
      ])
      setImages(imagesRes.data.data)
      setCategories(categoriesRes.data.data)
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaImage className="text-primary-500" />
            จัดการรูปภาพ
          </h1>
          <p className="text-gray-400 mt-1">
            รูปภาพทั้งหมด {images.length} รูป
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaUpload />
          อัปโหลดรูป
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อหรือ code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
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
        <div className="card p-12 text-center">
          <FaImage className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">ไม่พบรูปภาพ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="card p-3 group hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative aspect-square mb-2 rounded overflow-hidden bg-gray-800">
                <img
                  src={image.file_url}
                  alt={image.alt_text || image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {!image.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      ปิดใช้งาน
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <p className="font-semibold text-sm truncate" title={image.title}>
                  {image.title}
                </p>
                <p className="text-xs text-gray-400 truncate" title={image.code}>
                  {image.code}
                </p>
                {image.width && image.height && (
                  <p className="text-xs text-gray-500">
                    {image.width} × {image.height}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditingImage(image)}
                  className="btn btn-sm btn-outline flex-1 flex items-center justify-center gap-1"
                  title="แก้ไข"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id, image.title)}
                  className="btn btn-sm btn-error flex-1 flex items-center justify-center gap-1"
                  title="ลบ"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">อัปโหลดรูปภาพ</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
                <select
                  value={uploadForm.category_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
                  className="input w-full"
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
                <label className="block text-sm font-medium mb-2">Code</label>
                <input
                  type="text"
                  value={uploadForm.code}
                  onChange={(e) => setUploadForm({ ...uploadForm, code: e.target.value })}
                  placeholder="เช่น logo, btn-main-play"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ชื่อรูป</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="ชื่อรูปภาพ"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={uploadForm.alt_text}
                  onChange={(e) => setUploadForm({ ...uploadForm, alt_text: e.target.value })}
                  placeholder="คำอธิบายรูปภาพ"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เลือกไฟล์</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="input w-full"
                />
                <p className="text-xs text-gray-400 mt-1">
                  รองรับ JPEG, PNG, WebP, GIF (สูงสุด 10MB)
                </p>
              </div>

              {uploading && (
                <div className="text-center py-4">
                  <div className="spinner mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">กำลังอัปโหลด...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">แก้ไขรูปภาพ</h2>
              <button
                onClick={() => setEditingImage(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-video rounded overflow-hidden bg-gray-800">
                <img
                  src={editingImage.file_url}
                  alt={editingImage.alt_text || editingImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Code</label>
                <input
                  type="text"
                  value={editingImage.code}
                  onChange={(e) => setEditingImage({ ...editingImage, code: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ชื่อรูป</label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alt Text</label>
                <input
                  type="text"
                  value={editingImage.alt_text || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, alt_text: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingImage.is_active}
                  onChange={(e) => setEditingImage({ ...editingImage, is_active: e.target.checked })}
                  className="checkbox"
                />
                <label htmlFor="is_active" className="text-sm cursor-pointer">
                  เปิดใช้งาน
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdateImage}
                  className="btn btn-primary flex-1"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditingImage(null)}
                  className="btn btn-outline flex-1"
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
