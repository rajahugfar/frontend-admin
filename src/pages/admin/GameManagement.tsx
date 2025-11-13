import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaGamepad, FaEdit, FaTrash, FaStar, FaTimes, FaImage, FaTh, FaList, FaGripVertical } from 'react-icons/fa'
import { adminGameAPI } from '@/api/adminAPI'
import ConfirmModal from '@/components/admin/ConfirmModal'
import ImageUploadModal from '@/components/admin/ImageUploadModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type ViewMode = 'grid' | 'list'

interface Game {
  id: string
  gameCode: string
  gameName: string
  gameNameTh?: string
  gameType: string
  provider: string
  imageUrl?: string
  thumbnailUrl?: string
  isActive: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

interface GameListResponse {
  games: Game[]
  total: number
  limit: number
  offset: number
}

const GameManagement = () => {
  const [games, setGames] = useState<Game[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [limit] = useState(100)
  const [offset, setOffset] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showThumbnailModal, setShowThumbnailModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [gameToDelete, setGameToDelete] = useState<{ id: string; name: string } | null>(null)

  // Filters
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterFeatured, setFilterFeatured] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [editForm, setEditForm] = useState({
    gameName: '',
    gameNameTh: '',
    imageUrl: '',
    thumbnailUrl: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
  })

  useEffect(() => {
    fetchGames()
  }, [offset])

  const fetchGames = async () => {
    setLoading(true)
    try {
      const data = await adminGameAPI.getAllGames({ limit, offset })
      setGames(data.games || [])
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch games:', error)
      toast.error('ไม่สามารถโหลดข้อมูลเกมได้')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (game?: Game) => {
    if (game) {
      setSelectedGame(game)
      setEditForm({
        gameName: game.gameName,
        gameNameTh: game.gameNameTh || '',
        imageUrl: game.imageUrl || '',
        thumbnailUrl: game.thumbnailUrl || '',
        isActive: game.isActive,
        isFeatured: game.isFeatured,
        displayOrder: game.displayOrder,
      })
    } else {
      setSelectedGame(null)
      setEditForm({
        gameName: '',
        gameNameTh: '',
        imageUrl: '',
        thumbnailUrl: '',
        isActive: true,
        isFeatured: false,
        displayOrder: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedGame(null)
    setEditForm({
      gameName: '',
      gameNameTh: '',
      imageUrl: '',
      thumbnailUrl: '',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGame || !editForm.gameName) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      await adminGameAPI.updateGame(selectedGame.id, editForm)
      toast.success('อัปเดตเกมสำเร็จ')
      handleCloseModal()
      fetchGames()
    } catch (err: unknown) {
      console.error('Submit failed:', err)
      const message = typeof err === 'object' && err !== null && 'response' in err
        ? String((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'เกิดข้อผิดพลาด')
        : 'เกิดข้อผิดพลาด'
      toast.error(message)
    }
  }

  const handleToggleStatus = async (game: Game) => {
    try {
      await adminGameAPI.toggleGameStatus(game.id)
      toast.success(game.isActive ? 'ปิดการใช้งานเกมแล้ว' : 'เปิดการใช้งานเกมแล้ว')
      fetchGames()
    } catch (error) {
      console.error('Toggle status failed:', error)
      toast.error('ไม่สามารถเปลี่ยนสถานะเกมได้')
    }
  }

  const handleDeleteClick = (id: string, name: string) => {
    setGameToDelete({ id, name })
    setShowConfirmModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!gameToDelete) return

    try {
      // Note: You may need to implement deleteGame API endpoint
      toast.error('ฟังก์ชันลบเกมยังไม่พร้อมใช้งาน')
      // await adminGameAPI.deleteGame(gameToDelete.id)
      // toast.success('ลบเกมสำเร็จ')
      // fetchGames()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('ไม่สามารถลบเกมได้')
    } finally {
      setGameToDelete(null)
    }
  }

  const toggleFeatured = async (game: Game) => {
    try {
      await adminGameAPI.updateGame(game.id, {
        isFeatured: !game.isFeatured,
      })
      toast.success(game.isFeatured ? 'ยกเลิกเกมแนะนำแล้ว' : 'ตั้งเป็นเกมแนะนำแล้ว')
      fetchGames()
    } catch (error) {
      console.error('Toggle featured failed:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const items = [...filteredGames]
    const draggedItem = items[draggedIndex]
    items.splice(draggedIndex, 1)
    items.splice(index, 0, draggedItem)

    // Update games with new order
    const reordered = items.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }))

    setGames(reordered)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      // Update displayOrder for all games
      await Promise.all(
        filteredGames.map((game, index) =>
          adminGameAPI.updateGame(game.id, {
            displayOrder: index
          })
        )
      )
      toast.success('จัดเรียงลำดับสำเร็จ')
      fetchGames()
    } catch (error) {
      console.error('Reorder failed:', error)
      toast.error('ไม่สามารถจัดเรียงลำดับได้')
      fetchGames() // Reload to reset
    } finally {
      setDraggedIndex(null)
    }
  }

  // Filter games
  const filteredGames = games.filter((game) => {
    const matchesProvider = filterProvider === 'all' || game.provider === filterProvider
    const matchesType = filterType === 'all' || game.gameType === filterType
    const matchesFeatured = filterFeatured === 'all' ||
      (filterFeatured === 'featured' && game.isFeatured) ||
      (filterFeatured === 'not-featured' && !game.isFeatured)
    const matchesSearch = searchQuery === '' ||
      game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.gameCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.gameNameTh && game.gameNameTh.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesProvider && matchesType && matchesFeatured && matchesSearch
  })

  const getGameTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      SLOT: 'bg-purple-500/20 text-purple-400',
      CASINO: 'bg-red-500/20 text-red-400',
      SPORT: 'bg-blue-500/20 text-blue-400',
      FISHING: 'bg-green-500/20 text-green-400',
      OTHER: 'bg-gray-500/20 text-gray-400',
    }
    return badges[type] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-admin-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-admin-bg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brown-100 flex items-center gap-3">
            <FaGamepad className="text-gold-500" />
            จัดการเกม
          </h1>
          <p className="text-brown-400 mt-1">
            เกมทั้งหมด {total} เกม (แสดง {filteredGames.length} เกม)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-admin-card border border-admin-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gold-500 text-white'
                  : 'text-brown-400 hover:text-gold-500'
              }`}
              title="Grid View"
            >
              <FaTh size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-gold-500 text-white'
                  : 'text-brown-400 hover:text-gold-500'
              }`}
              title="List View"
            >
              <FaList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">ค้นหา</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ชื่อเกม, รหัสเกม..."
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">ผู้ให้บริการ</label>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">ทั้งหมด</option>
              {[...new Set(games.map(g => g.provider))].sort().map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">ประเภท</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">ทั้งหมด</option>
              {[...new Set(games.map(g => g.gameType))].sort().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-200 mb-2">เกมแนะนำ</label>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="featured">เกมแนะนำ</option>
              <option value="not-featured">เกมปกติ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Display */}
      {filteredGames.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-lg p-12 text-center">
          <FaGamepad className="text-6xl text-brown-600 mx-auto mb-4" />
          <p className="text-brown-400">ไม่พบเกม</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredGames.map((game, index) => (
            <div
              key={game.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-admin-card border border-admin-border rounded-lg p-4 relative hover:border-gold-500/50 transition-colors cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              {/* Featured Badge */}
              {game.isFeatured && (
                <div className="absolute top-2 right-2 z-10">
                  <FaStar className="text-yellow-400 text-xl" title="เกมแนะนำ" />
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square mb-3 rounded overflow-hidden bg-admin-bg flex items-center justify-center">
                {game.thumbnailUrl || game.imageUrl ? (
                  <img
                    src={game.thumbnailUrl || game.imageUrl}
                    alt={game.gameName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                    }}
                  />
                ) : (
                  <FaGamepad className="text-4xl text-brown-600" />
                )}
                {!game.isActive && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="bg-error text-white px-2 py-1 rounded text-xs font-semibold">
                      ปิดใช้งาน
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1 mb-3">
                <h3 className="font-semibold text-sm text-brown-100 truncate" title={game.gameName}>
                  {game.gameName}
                </h3>
                {game.gameNameTh && (
                  <p className="text-xs text-brown-400 truncate" title={game.gameNameTh}>
                    {game.gameNameTh}
                  </p>
                )}
                <p className="text-xs text-brown-500 truncate" title={game.gameCode}>
                  {game.gameCode}
                </p>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${getGameTypeBadge(game.gameType)}`}>
                    {game.gameType}
                  </span>
                </div>
                <p className="text-xs text-brown-500">
                  {game.provider}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleFeatured(game)}
                  className={`w-full px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    game.isFeatured
                      ? 'bg-warning/20 text-warning hover:bg-warning/30'
                      : 'bg-admin-hover text-brown-300 hover:bg-admin-border'
                  }`}
                  title={game.isFeatured ? 'ยกเลิกเกมแนะนำ' : 'ตั้งเป็นเกมแนะนำ'}
                >
                  <FaStar className={game.isFeatured ? 'text-yellow-400' : ''} />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(game)}
                    className="flex-1 px-3 py-2 bg-info/20 text-info hover:bg-info/30 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(game)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      game.isActive
                        ? 'bg-error/20 text-error hover:bg-error/30'
                        : 'bg-success/20 text-success hover:bg-success/30'
                    }`}
                    title={game.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                  >
                    {game.isActive ? <FaTimes /> : <FaStar />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredGames.map((game, index) => (
            <div
              key={game.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-admin-card border border-admin-border rounded-lg p-4 hover:border-gold-500/50 transition-colors cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="text-brown-600 cursor-grab active:cursor-grabbing">
                  <FaGripVertical size={20} />
                </div>

                {/* Image */}
                <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-admin-bg flex items-center justify-center">
                  {game.thumbnailUrl || game.imageUrl ? (
                    <img
                      src={game.thumbnailUrl || game.imageUrl}
                      alt={game.gameName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <FaGamepad className="text-2xl text-brown-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-brown-100">{game.gameName}</h3>
                    {game.isFeatured && (
                      <FaStar className="text-yellow-400" title="เกมแนะนำ" />
                    )}
                    {!game.isActive && (
                      <span className="bg-error text-white text-xs px-2 py-0.5 rounded">
                        ปิดใช้งาน
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs ${getGameTypeBadge(game.gameType)}`}>
                      {game.gameType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-brown-400">
                    <span>Code: {game.gameCode}</span>
                    <span>•</span>
                    <span>Provider: {game.provider}</span>
                    {game.gameNameTh && (
                      <>
                        <span>•</span>
                        <span>TH: {game.gameNameTh}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Order: {game.displayOrder}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(game)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      game.isFeatured
                        ? 'bg-warning/20 text-warning hover:bg-warning/30'
                        : 'bg-admin-hover text-brown-300 hover:bg-admin-border'
                    }`}
                    title={game.isFeatured ? 'ยกเลิกเกมแนะนำ' : 'ตั้งเป็นเกมแนะนำ'}
                  >
                    <FaStar />
                  </button>
                  <button
                    onClick={() => handleOpenModal(game)}
                    className="px-3 py-2 bg-info/20 text-info hover:bg-info/30 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(game)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      game.isActive
                        ? 'bg-error/20 text-error hover:bg-error/30'
                        : 'bg-success/20 text-success hover:bg-success/30'
                    }`}
                    title={game.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                  >
                    {game.isActive ? <FaTimes /> : <FaStar />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-admin-card border border-admin-border text-brown-200 rounded-lg disabled:opacity-50 hover:bg-admin-hover transition-colors"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2 text-brown-200">
            หน้า {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-admin-card border border-admin-border text-brown-200 rounded-lg disabled:opacity-50 hover:bg-admin-hover transition-colors"
          >
            ถัดไป
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && selectedGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brown-100">
                แก้ไขเกม: {selectedGame.gameName}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-brown-400 hover:text-brown-200 p-2 hover:bg-admin-hover rounded-lg transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ชื่อเกม (EN) *
                  </label>
                  <input
                    type="text"
                    value={editForm.gameName}
                    onChange={(e) => setEditForm({ ...editForm, gameName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ชื่อเกม (TH)
                  </label>
                  <input
                    type="text"
                    value={editForm.gameNameTh}
                    onChange={(e) => setEditForm({ ...editForm, gameNameTh: e.target.value })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    รูปภาพเกม
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-admin-border rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
                  >
                    <FaImage />
                    <span>{editForm.imageUrl ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</span>
                  </button>
                  {editForm.imageUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={editForm.imageUrl}
                        alt="Game"
                        className="w-full h-32 object-contain rounded-lg border border-admin-border bg-admin-bg p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full hover:bg-error/80"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    รูปภาพย่อ (Thumbnail)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowThumbnailModal(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-admin-border rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
                  >
                    <FaImage />
                    <span>{editForm.thumbnailUrl ? 'เปลี่ยนรูปภาพย่อ' : 'เลือกรูปภาพย่อ'}</span>
                  </button>
                  {editForm.thumbnailUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={editForm.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-32 object-contain rounded-lg border border-admin-border bg-admin-bg p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, thumbnailUrl: '' })}
                        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full hover:bg-error/80"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ลำดับการแสดง
                  </label>
                  <input
                    type="number"
                    value={editForm.displayOrder}
                    onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                    />
                    <span className="text-sm text-brown-200">เปิดใช้งาน</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isFeatured}
                      onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                    />
                    <span className="text-sm text-brown-200 flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      ตั้งเป็นเกมแนะนำ
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-admin-bg p-3 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2 text-brown-400">
                  <div>
                    <strong className="text-brown-200">รหัสเกม:</strong> {selectedGame.gameCode}
                  </div>
                  <div>
                    <strong className="text-brown-200">ประเภท:</strong> {selectedGame.gameType}
                  </div>
                  <div>
                    <strong className="text-brown-200">ผู้ให้บริการ:</strong> {selectedGame.provider}
                  </div>
                  <div>
                    <strong className="text-brown-200">สร้างเมื่อ:</strong>{' '}
                    {new Date(selectedGame.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  บันทึก
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
          setEditForm({ ...editForm, imageUrl: image.url })
          setShowImageModal(false)
        }}
        currentImage={editForm.imageUrl}
      />

      {/* Thumbnail Upload Modal */}
      <ImageUploadModal
        isOpen={showThumbnailModal}
        onClose={() => setShowThumbnailModal(false)}
        onSelect={(image) => {
          setEditForm({ ...editForm, thumbnailUrl: image.url })
          setShowThumbnailModal(false)
        }}
        currentImage={editForm.thumbnailUrl}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setGameToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบเกม"
        message={`คุณต้องการลบเกม "${gameToDelete?.name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบเกม"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  )
}

export default GameManagement
