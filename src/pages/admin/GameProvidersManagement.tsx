import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaGamepad, FaPlus, FaEdit, FaTrash, FaStar, FaTimes } from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import type { GameProvider, GameCategory } from '@/types/siteContent'

const GameProvidersManagement = () => {
  const [providers, setProviders] = useState<GameProvider[]>([])
  const [categories, setCategories] = useState<GameCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<GameProvider | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterFeatured, setFilterFeatured] = useState<string>('all')

  const [formData, setFormData] = useState<Partial<GameProvider>>({
    code: '',
    name: '',
    description: '',
    logo_image_id: '',
    thumbnail_image_id: '',
    category_id: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [providersRes, categoriesRes] = await Promise.all([
        siteContentAPI.admin.getGameProviders(),
        siteContentAPI.getGameCategories(),
      ])
      setProviders(providersRes.data.data)
      setCategories(categoriesRes.data.data)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (provider?: GameProvider) => {
    if (provider) {
      setEditingProvider(provider)
      setFormData({
        code: provider.code,
        name: provider.name,
        description: provider.description,
        logo_image_id: provider.logo_image_id,
        thumbnail_image_id: provider.thumbnail_image_id,
        category_id: provider.category_id,
        is_active: provider.is_active,
        is_featured: provider.is_featured,
        sort_order: provider.sort_order,
      })
    } else {
      setEditingProvider(null)
      setFormData({
        code: '',
        name: '',
        description: '',
        logo_image_id: '',
        thumbnail_image_id: '',
        category_id: '',
        is_active: true,
        is_featured: false,
        sort_order: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProvider(null)
    setFormData({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      if (editingProvider) {
        await siteContentAPI.admin.updateGameProvider(editingProvider.id, formData)
        toast.success('อัปเดตค่ายเกมสำเร็จ')
      } else {
        await siteContentAPI.admin.createGameProvider(formData)
        toast.success('สร้างค่ายเกมสำเร็จ')
      }
      handleCloseModal()
      loadData()
    } catch (error: any) {
      console.error('Submit failed:', error)
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบค่ายเกม "${name}" ใช่หรือไม่?`)) return

    try {
      await siteContentAPI.admin.deleteGameProvider(id)
      toast.success('ลบค่ายเกมสำเร็จ')
      loadData()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('ไม่สามารถลบค่ายเกมได้')
    }
  }

  const toggleFeatured = async (provider: GameProvider) => {
    try {
      await siteContentAPI.admin.updateGameProvider(provider.id, {
        is_featured: !provider.is_featured,
      })
      toast.success(provider.is_featured ? 'ยกเลิกค่ายเด่นแล้ว' : 'ตั้งเป็นค่ายเด่นแล้ว')
      loadData()
    } catch (error) {
      console.error('Toggle featured failed:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  // Filter providers
  const filteredProviders = providers.filter((provider) => {
    const matchesCategory = filterCategory === 'all' || provider.category_id === filterCategory
    const matchesFeatured = filterFeatured === 'all' ||
      (filterFeatured === 'featured' && provider.is_featured) ||
      (filterFeatured === 'not-featured' && !provider.is_featured)
    return matchesCategory && matchesFeatured
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
            <FaGamepad className="text-primary-500" />
            จัดการค่ายเกม
          </h1>
          <p className="text-gray-400 mt-1">
            ค่ายเกมทั้งหมด {providers.length} ค่าย
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus />
          เพิ่มค่ายเกม
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input w-full"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ค่ายเด่น</label>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="input w-full"
            >
              <option value="all">ทั้งหมด</option>
              <option value="featured">ค่ายเด่น</option>
              <option value="not-featured">ค่ายปกติ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="card p-12 text-center">
          <FaGamepad className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">ไม่พบค่ายเกม</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="card p-4 relative">
              {/* Featured Badge */}
              {provider.is_featured && (
                <div className="absolute top-2 right-2 z-10">
                  <FaStar className="text-yellow-400 text-xl" title="ค่ายเด่น" />
                </div>
              )}

              {/* Logo */}
              <div className="relative aspect-square mb-3 rounded overflow-hidden bg-gray-800 flex items-center justify-center">
                {provider.logo_image ? (
                  <img
                    src={provider.logo_image.file_url}
                    alt={provider.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <FaGamepad className="text-4xl text-gray-600" />
                )}
                {!provider.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      ปิดใช้งาน
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1 mb-3">
                <h3 className="font-semibold text-sm truncate" title={provider.name}>
                  {provider.name}
                </h3>
                <p className="text-xs text-gray-400 truncate" title={provider.code}>
                  {provider.code}
                </p>
                {provider.category && (
                  <p className="text-xs text-gray-500">
                    {provider.category.name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleFeatured(provider)}
                  className={`btn btn-sm w-full ${
                    provider.is_featured ? 'btn-warning' : 'btn-outline'
                  }`}
                  title={provider.is_featured ? 'ยกเลิกค่ายเด่น' : 'ตั้งเป็นค่ายเด่น'}
                >
                  <FaStar className={provider.is_featured ? 'text-yellow-400' : ''} />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(provider)}
                    className="btn btn-sm btn-outline flex-1"
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id, provider.name)}
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
                {editingProvider ? 'แก้ไขค่ายเกม' : 'เพิ่มค่ายเกม'}
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
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="input w-full"
                    placeholder="pgslot, pragmatic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ชื่อค่ายเกม *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="PG Slot"
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
                    className="input w-full h-20 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ID รูปโลโก้
                  </label>
                  <input
                    type="text"
                    value={formData.logo_image_id || ''}
                    onChange={(e) => setFormData({ ...formData, logo_image_id: e.target.value })}
                    className="input w-full"
                    placeholder="UUID ของรูปโลโก้"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ID รูป Thumbnail
                  </label>
                  <input
                    type="text"
                    value={formData.thumbnail_image_id || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail_image_id: e.target.value })}
                    className="input w-full"
                    placeholder="UUID ของรูป thumbnail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    หมวดหมู่
                  </label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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

                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="checkbox"
                    />
                    <span className="text-sm">เปิดใช้งาน</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="checkbox"
                    />
                    <span className="text-sm flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      ตั้งเป็นค่ายเด่น (แสดงในหน้าแรก)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingProvider ? 'บันทึก' : 'สร้าง'}
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

export default GameProvidersManagement
