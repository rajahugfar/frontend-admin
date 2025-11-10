import { useState, useEffect } from 'react'
import { FiUpload, FiX, FiImage, FiCheck, FiGrid, FiList, FiFolder, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import ConfirmModal from './ConfirmModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (image: { id: string; url: string }) => void
  currentImage?: string
}

interface UploadedImage {
  id: string
  url: string
  filename?: string
  size?: number
  uploadedAt?: string
}

const ImageUploadModal = ({ isOpen, onClose, onSelect, currentImage }: ImageUploadModalProps) => {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '')
  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      loadImages()
      setSelectedImage(currentImage || '')
      setSelectedImageId('')
    }
  }, [isOpen, currentImage])

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
        setSelectedImage(data.data.url)
        setSelectedImageId(data.data.id)
        loadImages()
        setActiveTab('library')
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

  const handleSelect = () => {
    if (!selectedImage) {
      toast.error('กรุณาเลือกรูปภาพ')
      return
    }
    if (!selectedImageId) {
      const found = images.find(img => img.url === selectedImage)
      if (found) {
        onSelect({ id: found.id, url: found.url })
      } else {
        toast.error('ไม่พบรูปภาพที่เลือก')
        return
      }
    } else {
      onSelect({ id: selectedImageId, url: selectedImage })
    }
    onClose()
  }

  const handleDeleteClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the image when clicking delete
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
        if (selectedImage === imageToDelete) {
          setSelectedImage('')
          setSelectedImageId('')
        }
        loadImages()
      } else {
        toast.error(data.message || 'ไม่สามารถลบรูปภาพได้')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('เกิดข้อผิดพลาดในการลบรูปภาพ')
    } finally {
      setImageToDelete('')
    }
  }

  // Get unique folders from images
  const folders = ['all', ...new Set(images.map(img => {
    const parts = img.url.split('/')
    // Get folder name (e.g., /uploads/promotions/banners/ -> banners)
    return parts[parts.length - 2] || 'root'
  }))]

  // Filter images by folder
  const filteredImages = selectedFolder === 'all' 
    ? images 
    : images.filter(img => {
        const parts = img.url.split('/')
        const folder = parts[parts.length - 2] || 'root'
        return folder === selectedFolder
      })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border">
          <h2 className="text-2xl font-bold text-gold-500">เลือกรูปภาพโปรโมชั่น</h2>
          <button
            onClick={onClose}
            className="text-brown-400 hover:text-gold-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-admin-border">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'library'
                ? 'text-gold-500 border-b-2 border-gold-500'
                : 'text-brown-400 hover:text-gold-500'
            }`}
          >
            <FiImage className="inline mr-2" />
            คลังรูปภาพ
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-gold-500 border-b-2 border-gold-500'
                : 'text-brown-400 hover:text-gold-500'
            }`}
          >
            <FiUpload className="inline mr-2" />
            อัพโหลดรูปใหม่
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'upload' ? (
            /* Upload Tab */
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="border-2 border-dashed border-admin-border rounded-xl p-12 hover:border-gold-500 transition-colors">
                  <FiUpload className="mx-auto text-6xl text-brown-500 mb-4" />
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
                        <FiUpload />
                        <span>เลือกไฟล์</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* Library Tab */
            <div>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="spinner"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-20">
                  <FiImage className="mx-auto text-6xl text-brown-500 mb-4" />
                  <p className="text-brown-400">ยังไม่มีรูปภาพในคลัง</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-6 py-3 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium"
                  >
                    อัพโหลดรูปแรก
                  </button>
                </div>
              ) : (
                <div>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-admin-border">
                    {/* Folder Filter */}
                    <div className="flex items-center gap-2">
                      <FiFolder className="text-brown-400" />
                      <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="bg-admin-hover border border-admin-border text-brown-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
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
                        <FiGrid size={18} />
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
                        <FiList size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Images Display */}
                  {viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredImages.map((image) => (
                        <div
                          key={image.id}
                          onClick={() => {
                            setSelectedImage(image.url)
                            setSelectedImageId(image.id)
                          }}
                          className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === image.url
                              ? 'border-gold-500 ring-2 ring-gold-500/50'
                              : 'border-admin-border hover:border-gold-500/50'
                          }`}
                        >
                          <div className="bg-admin-hover p-2">
                            <img
                              src={`${API_URL}${image.url}`}
                              alt={image.filename}
                              className="w-full h-auto rounded"
                            />
                          </div>
                          {selectedImageId === image.id && (
                            <div className="absolute top-3 right-3 bg-gold-500 text-brown-900 rounded-full p-1">
                              <FiCheck size={16} />
                            </div>
                          )}
                          <button
                            onClick={(e) => handleDeleteClick(image.url, e)}
                            className="absolute top-3 left-3 bg-error/80 hover:bg-error text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                            title="ลบรูปภาพ"
                          >
                            <FiTrash2 size={14} />
                          </button>
                          <div className="p-2 bg-admin-card/95">
                            <p className="text-xs text-brown-300 truncate">{image.filename}</p>
                            <p className="text-xs text-brown-500">{(image.size / 1024).toFixed(1)} KB</p>
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
                          onClick={() => setSelectedImage(image.url)}
                          className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedImage === image.url
                              ? 'border-gold-500 bg-gold-500/10'
                              : 'border-admin-border hover:border-gold-500/50 bg-admin-hover'
                          }`}
                        >
                          <div className="flex-shrink-0 w-24 h-16 bg-admin-card rounded overflow-hidden">
                            <img
                              src={`${API_URL}${image.url}`}
                              alt={image.filename}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-brown-200 font-medium truncate">{image.filename}</p>
                            <p className="text-xs text-brown-500">
                              {(image.size / 1024).toFixed(1)} KB • {new Date(image.uploadedAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteClick(image.url, e)}
                            className="flex-shrink-0 bg-error/80 hover:bg-error text-white rounded-lg p-2 transition-colors"
                            title="ลบรูปภาพ"
                          >
                            <FiTrash2 size={16} />
                          </button>
                          {selectedImage === image.url && (
                            <div className="flex-shrink-0 bg-gold-500 text-brown-900 rounded-full p-2">
                              <FiCheck size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-admin-border">
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className="flex-1 px-6 py-3 bg-gold-500 text-brown-900 rounded-lg hover:bg-gold-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            เลือกรูปนี้
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-admin-hover text-brown-300 rounded-lg hover:bg-admin-border transition-colors font-medium"
          >
            ยกเลิก
          </button>
        </div>
      </div>

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

export default ImageUploadModal
