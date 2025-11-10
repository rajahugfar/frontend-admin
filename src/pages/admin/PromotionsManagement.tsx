import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaGift, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaTimes, FaImage } from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import type { PromotionBanner } from '@/types/siteContent'
import ImageUploadModal from '@/components/admin/ImageUploadModal'
import ConfirmModal from '@/components/admin/ConfirmModal'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const PromotionsManagement = () => {
  const [banners, setBanners] = useState<PromotionBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)
  const [editingBanner, setEditingBanner] = useState<PromotionBanner | null>(null)

  const [formData, setFormData] = useState<Partial<PromotionBanner>>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    display_location: 'home',
    banner_type: 'large', // 'small' or 'large'
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const response = await siteContentAPI.admin.getPromotionBanners()
      setBanners(response.data.data)
    } catch (error) {
      console.error('Failed to load banners:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (banner?: PromotionBanner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        description: banner.description,
        image_url: banner.image_url,
        link_url: banner.link_url,
        display_location: banner.display_location,
        banner_type: banner.banner_type || 'large',
        is_active: banner.is_active,
        sort_order: banner.sort_order,
        start_date: banner.start_date,
        end_date: banner.end_date,
      })
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        display_location: 'home',
        banner_type: 'large',
        is_active: true,
        sort_order: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    // Keep current editing state and form values to avoid losing details on close
    setShowModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast.error('กรุณากรอกชื่อโปรโมชั่น')
      return
    }

    try {
      if (editingBanner) {
        await siteContentAPI.admin.updatePromotionBanner(editingBanner.id, formData)
        toast.success('อัปเดตโปรโมชั่นสำเร็จ')
      } else {
        await siteContentAPI.admin.createPromotionBanner(formData)
        toast.success('สร้างโปรโมชั่นสำเร็จ')
      }
      handleCloseModal()
      loadBanners()
    } catch (err: unknown) {
      console.error('Submit failed:', err)
      const message = typeof err === 'object' && err !== null && 'message' in err ? String((err as any).message) : 'เกิดข้อผิดพลาด'
      toast.error(message)
    }
  }

  const handleDeleteClick = (id: string) => {
    setBannerToDelete(id)
    setShowConfirmModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return

    try {
      await siteContentAPI.admin.deletePromotionBanner(bannerToDelete)
      toast.success('ลบแบนเนอร์สำเร็จ')
      loadBanners()
    } catch (error) {
      console.error('Failed to delete banner:', error)
      toast.error('ไม่สามารถลบแบนเนอร์ได้')
    } finally {
      setBannerToDelete(null)
    }
  }

  const toggleActive = async (banner: PromotionBanner) => {
    try {
      await siteContentAPI.admin.updatePromotionBanner(banner.id, {
        is_active: !banner.is_active,
      })
      toast.success(banner.is_active ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว')
      loadBanners()
    } catch (error) {
      console.error('Toggle failed:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-admin-bg">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-500/10 rounded-lg flex items-center justify-center">
              <FaGift className="w-5 h-5 text-gold-500" />
            </div>
            จัดการแบนเนอร์โปรโมชั่น
          </h1>
          <p className="text-brown-300 text-sm ml-13">
            แบนเนอร์ทั้งหมด {banners.length} รายการ (สำหรับหน้า Landing และ Member)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <FaPlus />
          สร้างโปรโมชั่น
        </button>
      </div>

      {/* Banners List (Grouped Tables) */}
      {banners.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-12 text-center">
          <FaGift className="text-6xl text-brown-500 mx-auto mb-4" />
          <p className="text-brown-400">ยังไม่มีแบนเนอร์</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            สร้างแบนเนอร์แรก
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {(() => {
            const small = banners.filter(b => (b.banner_type || 'large') === 'small')
            const large = banners.filter(b => (b.banner_type || 'large') === 'large')
            const Table = ({ items, title }: { items: PromotionBanner[]; title: string }) => (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gold-500">{title}</h2>
                  <span className="text-brown-400 text-sm">{items.length} รายการ</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-admin-border">
                  <table className="min-w-full text-sm text-brown-200">
                    <thead className="bg-admin-hover text-brown-300">
                      <tr>
                        <th className="px-4 py-3 text-left">Preview</th>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Sort</th>
                        <th className="px-4 py-3 text-center">Active</th>
                        <th className="px-4 py-3 text-left">Dates</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(banner => (
                        <tr key={banner.id} className="border-t border-admin-border hover:bg-admin-hover/60">
                          <td className="px-4 py-3">
                            {banner.image_url ? (
                              <img 
                                src={(() => {
                                  const url = banner.image_url
                                  if (url.startsWith('http')) return url
                                  if (url.startsWith('/uploads/')) return `${API_URL}${url}`
                                  return `${API_URL}/uploads/promotions/${url}`
                                })()}
                                alt={banner.title} 
                                className="h-10 w-auto rounded"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            ) : (
                              <div className="h-10 w-16 bg-admin-bg rounded" />
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-brown-100">{banner.title}</td>
                          <td className="px-4 py-3 max-w-[280px]"><span className="line-clamp-2 text-brown-400">{banner.description}</span></td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${banner.display_location === 'home' ? 'bg-blue-500/20 text-blue-300' : banner.display_location === 'member' ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'}`}>
                              {banner.display_location === 'home' ? 'Landing' : banner.display_location === 'member' ? 'Member' : 'Both'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${banner.banner_type === 'small' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              {banner.banner_type === 'small' ? 'แบนเนอร์เล็ก' : 'แบนเนอร์ใหญ่'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{banner.sort_order}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleActive(banner)}
                              className={`px-2 py-1 rounded ${banner.is_active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}
                              title={banner.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                            >
                              {banner.is_active ? <FaEye /> : <FaEyeSlash />}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-brown-400">
                            <div className="space-y-0.5">
                              {banner.start_date && (<div>เริ่ม: {new Date(banner.start_date).toLocaleDateString('th-TH')}</div>)}
                              {banner.end_date && (<div>สิ้นสุด: {new Date(banner.end_date).toLocaleDateString('th-TH')}</div>)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenModal(banner)}
                                className="px-3 py-2 bg-info/20 text-info hover:bg-info/30 rounded-lg transition-all"
                                title="แก้ไข"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(banner.id)}
                                className="p-2 text-error hover:bg-error/10 rounded transition-colors"
                                title="ลบ"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
            return (
              <>
                <Table items={small} title="แบนเนอร์เล็ก (Small)" />
                <Table items={large} title="แบนเนอร์ใหญ่ (Large)" />
              </>
            )
          })()}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gold-500">
                {editingBanner ? 'แก้ไขแบนเนอร์' : 'สร้างแบนเนอร์'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-brown-400 hover:text-brown-100 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ชื่อแบนเนอร์ *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500 h-24 resize-none"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    รูปโปรโมชั่น
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-admin-border rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
                  >
                    <FaImage />
                    <span>{formData.image_url ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</span>
                  </button>
                  {formData.image_url && (
                    <div className="mt-2 relative">
                      <img
                        src={(() => {
                          const url = formData.image_url
                          if (url.startsWith('http')) return url
                          if (url.startsWith('/uploads/')) return `${API_URL}${url}`
                          return `${API_URL}/uploads/promotions/${url}`
                        })()}
                        alt="Preview"
                        className="w-full rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `${API_URL}/uploads/promotions/promo-1.jpg`
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 p-2 bg-error/80 text-white rounded-lg hover:bg-error transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ลิงก์ปลายทาง
                  </label>
                  <input
                    type="text"
                    value={formData.link_url || ''}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="/promotions/detail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ตำแหน่งแสดง
                  </label>
                  <select
                    value={formData.display_location || 'home'}
                    onChange={(e) => setFormData({ ...formData, display_location: e.target.value as 'home' | 'member' | 'both' })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="home">Landing Page</option>
                    <option value="member">Member Page</option>
                    <option value="both">ทั้งสองหน้า</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ประเภทแบนเนอร์
                  </label>
                  <select
                    value={formData.banner_type || 'large'}
                    onChange={(e) => setFormData({ ...formData, banner_type: e.target.value as 'small' | 'large' })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="small">แบนเนอร์เล็ก (แถวบน)</option>
                    <option value="large">แบนเนอร์ใหญ่ (แถวล่าง Slide)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ลำดับการแสดง
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    วันเริ่มต้น
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    วันสิ้นสุด
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                    />
                    <span className="text-sm text-brown-200">เปิดใช้งาน</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                  {editingBanner ? 'บันทึก' : 'สร้าง'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-admin-hover text-brown-200 hover:bg-admin-border rounded-lg transition-all font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelect={(image) => {
          setFormData({ ...formData, image_url: image.url })
          setShowImageModal(false)
        }}
        currentImage={formData.image_url}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setBannerToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบแบนเนอร์"
        message="คุณต้องการลบแบนเนอร์นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบแบนเนอร์"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  )
}

export default PromotionsManagement
