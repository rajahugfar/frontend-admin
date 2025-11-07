import React, { useState, useEffect } from 'react'
import { adminGameAPI } from '../../api/adminAPI'

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

const GameManagement: React.FC = () => {
  const [games, setGames] = useState<Game[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
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
      alert('ไม่สามารถโหลดข้อมูลเกมได้')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (game: Game) => {
    if (!confirm(`ต้องการ${game.isActive ? 'ปิด' : 'เปิด'}เกม ${game.gameName} ?`)) {
      return
    }

    try {
      await adminGameAPI.toggleGameStatus(game.id)
      alert('เปลี่ยนสถานะเกมสำเร็จ')
      fetchGames()
    } catch (error) {
      console.error('Failed to toggle game status:', error)
      alert('ไม่สามารถเปลี่ยนสถานะเกมได้')
    }
  }

  const handleEditClick = (game: Game) => {
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
    setEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedGame) return

    try {
      await adminGameAPI.updateGame(selectedGame.id, editForm)
      alert('อัพเดทเกมสำเร็จ')
      setEditModalOpen(false)
      setSelectedGame(null)
      fetchGames()
    } catch (error) {
      console.error('Failed to update game:', error)
      alert('ไม่สามารถอัพเดทเกมได้')
    }
  }

  const getGameTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      SLOT: 'bg-purple-100 text-purple-800',
      CASINO: 'bg-red-100 text-red-800',
      SPORT: 'bg-blue-100 text-blue-800',
      FISHING: 'bg-green-100 text-green-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }
    return badges[type] || 'bg-gray-100 text-gray-800'
  }

  const getProviderBadge = (provider: string) => {
    const badges: Record<string, string> = {
      AMB: 'bg-yellow-100 text-yellow-800',
      SEXY: 'bg-pink-100 text-pink-800',
      SA: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }
    return badges[provider] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการเกมส์</h1>
        <div className="text-sm text-gray-600">
          ทั้งหมด {total} เกม
        </div>
      </div>

      {/* Games Table */}
      {loading ? (
        <div className="text-center py-8">กำลังโหลด...</div>
      ) : games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          ไม่พบข้อมูลเกม
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รูปภาพ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ชื่อเกม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รหัสเกม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ผู้ให้บริการ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ลำดับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    แนะนำ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {game.thumbnailUrl || game.imageUrl ? (
                        <img
                          src={game.thumbnailUrl || game.imageUrl}
                          alt={game.gameName}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {game.gameName}
                      </div>
                      {game.gameNameTh && (
                        <div className="text-sm text-gray-500">{game.gameNameTh}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {game.gameCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getGameTypeBadge(
                          game.gameType
                        )}`}
                      >
                        {game.gameType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderBadge(
                          game.provider
                        )}`}
                      >
                        {game.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.displayOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          game.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {game.isActive ? 'เปิด' : 'ปิด'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {game.isFeatured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ แนะนำ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(game)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleToggleStatus(game)}
                          className={`px-3 py-1 rounded ${
                            game.isActive
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {game.isActive ? 'ปิด' : 'เปิด'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2">
            หน้า {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            ถัดไป
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">แก้ไขเกม: {selectedGame.gameName}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเกม (EN) *
                </label>
                <input
                  type="text"
                  value={editForm.gameName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gameName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเกม (TH)
                </label>
                <input
                  type="text"
                  value={editForm.gameNameTh}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gameNameTh: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL รูปภาพ
                </label>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL รูปภาพย่อ
                </label>
                <input
                  type="text"
                  value={editForm.thumbnailUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, thumbnailUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลำดับการแสดง
                </label>
                <input
                  type="number"
                  value={editForm.displayOrder}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ตัวเลขน้อยกว่าจะแสดงก่อน
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">เปิดใช้งาน</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">แนะนำ (Featured)</span>
                </label>
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div>
                    <strong>รหัสเกม:</strong> {selectedGame.gameCode}
                  </div>
                  <div>
                    <strong>ประเภท:</strong> {selectedGame.gameType}
                  </div>
                  <div>
                    <strong>ผู้ให้บริการ:</strong> {selectedGame.provider}
                  </div>
                  <div>
                    <strong>สร้างเมื่อ:</strong>{' '}
                    {new Date(selectedGame.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setEditModalOpen(false)
                  setSelectedGame(null)
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameManagement
