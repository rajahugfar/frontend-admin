import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaImage, FaUpload, FaTrash, FaSearch, FaTimes, FaTh, FaList, FaFolder } from 'react-icons/fa'
import ConfirmModal from '@/components/admin/ConfirmModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

interface UploadedImage {
  id: string
  url: string
  filename?: string
  size?: number
  uploadedAt?: string
}

const SiteImagesManagement = () => {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string>('')

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    setLoading(true)
    try {
      const adminSelector = localStorage.getItem('admin_selector')
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/images?category=promotions`, {
        headers: {
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        const imagesData = Array.isArray(data.data) ? data.data : []
        setImages(imagesData)
      } else {
        setImages([])
      }
    } catch (error) {
      console.error('Error loading images:', error)
      toast.error('ไม่สามารถโหลดรูปภาพได้')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', 'promotions')

      const adminSelector = localStorage.getItem('admin_selector')
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSelector}`
        },
        credentials: 'include',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success('อัพโหลดรูปภาพสำเร็จ')
        setShowUploadModal(false)
        loadImages()
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('เกิดข้อผิดพลาดในการอัพโหลด')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteClick = (imageUrl: string) => {
    setImageToDelete(imageUrl)
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return

    try {
      const adminSelector = localStorage.getItem('admin_selector')
      const response = await fetch(`${API_URL}${API_BASE_PATH}/admin/images?url=${encodeURIComponent(imageToDelete)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSelector}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('ลบรูปภาพสำเร็จ')
        loadImages()
      } else {
        toast.error(data.message || 'ไม่สามารถลบรูปภาพได้')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('เกิดข้อผิดพลาดในการลบรูปภาพ')
    } finally {
      setImageToDelete('')
      setShowConfirmDelete(false)
    }
  }

  // Get unique folders from images
  const folders = ['all', ...new Set(images.map(img => {
    const parts = img.url.split('/')
    // Get folder name (e.g., /uploads/promotions/banners/ -> banners)
    return parts[parts.length - 2] || 'root'
  }))]

  // Filter images by folder and search term
  const filteredImages = images.filter(img => {
    // Filter by folder
    if (selectedFolder !== 'all') {
      const parts = img.url.split('/')
      const folder = parts[parts.length - 2] || 'root'
      if (folder !== selectedFolder) return false
    }

    // Filter by search term
    if (searchTerm) {
      const filename = img.filename?.toLowerCase() || ''
      return filename.includes(searchTerm.toLowerCase())
    }

    return true
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
                จัดการรูปภาพโปรโมชั่น
              </h1>
              <p className="text-brown-300">
                รูปภาพทั้งหมด {images.length} รูป
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-all flex items-center gap-2 font-medium"
            >
              <FaUpload />
              อัพโหลดรูป
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Toolbar */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อไฟล์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* Folder Filter */}
            <div className="flex items-center gap-2">
              <FaFolder className="text-brown-400" />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {folders.map(folder => (
                  <option key={folder} value={folder}>
                    {folder === 'all' ? 'ทั้งหมด' : folder}
                  </option>
                ))}
              </select>
              <span className="text-brown-500 text-sm">
                ({filteredImages.length} รูป)
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gold-500 text-brown-900'
                    : 'bg-admin-hover text-brown-400 hover:text-gold-500'
                }`}
                title="แสดงแบบ Grid"
              >
                <FaTh size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gold-500 text-brown-900'
                    : 'bg-admin-hover text-brown-400 hover:text-gold-500'
                }`}
                title="แสดงแบบ List"
              >
                <FaList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Images Display */}
        {filteredImages.length === 0 ? (
          <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
            <FaImage className="text-6xl text-brown-600 mx-auto mb-4" />
            <p className="text-brown-400 mb-4">
              {searchTerm || selectedFolder !== 'all' ? 'ไม่พบรูปภาพที่ค้นหา' : 'ยังไม่มีรูปภาพ'}
            </p>
            {!searchTerm && selectedFolder === 'all' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium"
              >
                อัพโหลดรูปแรก
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-admin-card border border-admin-border rounded-xl overflow-hidden hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square bg-admin-bg p-2">
                  <img
                    src={`${API_URL}${image.url}`}
                    alt={image.filename}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                  <button
                    onClick={() => handleDeleteClick(image.url)}
                    className="absolute top-3 left-3 bg-error/80 hover:bg-error text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                    title="ลบรูปภาพ"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <p className="font-semibold text-sm truncate text-brown-200" title={image.filename}>
                    {image.filename}
                  </p>
                  {image.size && (
                    <p className="text-xs text-brown-500">
                      {(image.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="flex items-center gap-4 p-3 rounded-lg border-2 border-admin-border bg-admin-card hover:border-gold-500/50 transition-all"
              >
                <div className="flex-shrink-0 w-24 h-16 bg-admin-hover rounded overflow-hidden">
                  <img
                    src={`${API_URL}${image.url}`}
                    alt={image.filename}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown-200 font-medium truncate">{image.filename}</p>
                  <p className="text-xs text-brown-500">
                    {image.size && `${(image.size / 1024).toFixed(1)} KB`}
                    {image.uploadedAt && ` • ${new Date(image.uploadedAt).toLocaleDateString('th-TH')}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(image.url)}
                  className="flex-shrink-0 bg-error/80 hover:bg-error text-white rounded-lg p-2 transition-colors"
                  title="ลบรูปภาพ"
                >
                  <FaTrash size={16} />
                </button>
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
              <h2 className="text-2xl font-display font-bold text-gold-500">อัพโหลดรูปภาพ</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-brown-400 hover:text-gold-500 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="text-center py-12">
              <div className="border-2 border-dashed border-admin-border rounded-xl p-12 hover:border-gold-500 transition-colors">
                <FaUpload className="mx-auto text-6xl text-brown-500 mb-4" />
                <p className="text-brown-300 mb-4">
                  คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-brown-500 text-sm mb-4">
                  รองรับ: JPG, PNG, GIF (ขนาดไม่เกิน 5MB)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brown-900"></div>
                      <span>กำลังอัพโหลด...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      <span>เลือกไฟล์</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false)
          setImageToDelete('')
        }}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบรูปภาพ"
        message="คุณต้องการลบรูปภาพนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบรูปภาพ"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  )
}

export default SiteImagesManagement
