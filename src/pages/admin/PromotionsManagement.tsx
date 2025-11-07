import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaGift, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import type { PromotionBanner } from '@/types/siteContent'

const PromotionsManagement = () => {
  const [banners, setBanners] = useState<PromotionBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<PromotionBanner | null>(null)

  const [formData, setFormData] = useState<Partial<PromotionBanner>>({
    title: '',
    description: '',
    image_id: '',
    link_url: '',
    display_location: 'home',
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
        image_id: banner.image_id,
        link_url: banner.link_url,
        display_location: banner.display_location,
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
        image_id: '',
        link_url: '',
        display_location: 'home',
        is_active: true,
        sort_order: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setFormData({})
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
    } catch (error: any) {
      console.error('Submit failed:', error)
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`ต้องการลบโปรโมชั่น "${title}" ใช่หรือไม่?`)) return

    try {
      await siteContentAPI.admin.deletePromotionBanner(id)
      toast.success('ลบโปรโมชั่นสำเร็จ')
      loadBanners()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('ไม่สามารถลบโปรโมชั่นได้')
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
            <FaGift className="text-primary-500" />
            จัดการโปรโมชั่น
          </h1>
          <p className="text-gray-400 mt-1">
            โปรโมชั่นทั้งหมด {banners.length} รายการ
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus />
          สร้างโปรโมชั่น
        </button>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="card p-12 text-center">
          <FaGift className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">ยังไม่มีโปรโมชั่น</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary mt-4"
          >
            สร้างโปรโมชั่นแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="card overflow-hidden">
              {/* Image */}
              {banner.image && (
                <div className="relative aspect-video bg-gray-800">
                  <img
                    src={banner.image.file_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {!banner.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded">
                        ปิดใช้งาน
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      banner.display_location === 'home' ? 'bg-blue-500' :
                      banner.display_location === 'member' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {banner.display_location === 'home' ? 'Landing' :
                       banner.display_location === 'member' ? 'Member' : 'Both'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4">
                {/* Info */}
                <h3 className="text-lg font-bold mb-2">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {banner.description}
                  </p>
                )}

                {/* Dates */}
                {(banner.start_date || banner.end_date) && (
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    {banner.start_date && (
                      <div>เริ่ม: {new Date(banner.start_date).toLocaleDateString('th-TH')}</div>
                    )}
                    {banner.end_date && (
                      <div>สิ้นสุด: {new Date(banner.end_date).toLocaleDateString('th-TH')}</div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`btn btn-sm flex-1 ${banner.is_active ? 'btn-outline' : 'btn-success'}`}
                    title={banner.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  >
                    {banner.is_active ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="btn btn-sm btn-outline flex-1"
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="btn btn-sm btn-error flex-1"
                    title="ลบ"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingBanner ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่น'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    ชื่อโปรโมชั่น *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full h-24 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ID รูปภาพ
                  </label>
                  <input
                    type="text"
                    value={formData.image_id || ''}
                    onChange={(e) => setFormData({ ...formData, image_id: e.target.value })}
                    className="input w-full"
                    placeholder="UUID ของรูปภาพ"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    ดู ID จากหน้าจัดการรูปภาพ
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ลิงก์ปลายทาง
                  </label>
                  <input
                    type="text"
                    value={formData.link_url || ''}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="input w-full"
                    placeholder="/promotions/detail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ตำแหน่งแสดง
                  </label>
                  <select
                    value={formData.display_location || 'home'}
                    onChange={(e) => setFormData({ ...formData, display_location: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="home">Landing Page</option>
                    <option value="member">Member Page</option>
                    <option value="both">ทั้งสองหน้า</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ลำดับการแสดง
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="input w-full"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    วันเริ่มต้น
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    วันสิ้นสุด
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="checkbox"
                    />
                    <span className="text-sm">เปิดใช้งาน</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingBanner ? 'บันทึก' : 'สร้าง'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline flex-1"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromotionsManagement
