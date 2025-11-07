import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminChatAPI, type ChatRoomWithDetails } from '@api/chatAPI'
import { FaComments, FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const AdminChatNotification = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<ChatRoomWithDetails[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unreadCount = rooms.reduce((sum, room) => sum + room.unreadCount, 0)

    // Show notification if there are new unread messages
    if (unreadCount > totalUnread && totalUnread > 0) {
      toast('มีข้อความใหม่จากลูกค้า', {
        icon: '💬',
        duration: 3000,
      })
    }

    setTotalUnread(unreadCount)
  }, [rooms])

  const loadRooms = async () => {
    try {
      const response = await adminChatAPI.getRooms()
      if (response.data.success) {
        setRooms(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
    }
  }

  const handleOpenChat = () => {
    navigate('/admin/chat')
    setShowNotification(false)
  }

  const unreadRooms = rooms.filter(room => room.unreadCount > 0)

  if (totalUnread === 0) {
    return null
  }

  return (
    <>
      {/* Notification Badge */}
      <button
        onClick={() => setShowNotification(!showNotification)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 z-50"
        title="แชท"
      >
        <FaComments className="text-2xl" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotification && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <FaComments />
              <span className="font-bold">ข้อความใหม่ ({totalUnread})</span>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Rooms List */}
          <div className="overflow-y-auto flex-1">
            {unreadRooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                ไม่มีข้อความใหม่
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {unreadRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={handleOpenChat}
                    className="w-full p-4 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {room.memberFullname || room.memberPhone}
                      </span>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {room.unreadCount}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{room.memberPhone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={handleOpenChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              เปิดแชททั้งหมด
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminChatNotification
