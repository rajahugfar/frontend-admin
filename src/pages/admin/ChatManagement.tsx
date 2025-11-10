import React, { useState, useEffect, useRef } from 'react'
import { adminChatAPI, type ChatRoomWithDetails, type ChatMessage } from '@api/chatAPI'
import toast from 'react-hot-toast'
import { FaPaperPlane, FaUser, FaCircle, FaComments, FaImage, FaTimes, FaTrash } from 'react-icons/fa'
import { useAdminStore } from '@/store/adminStore'
import ImageModal from '@components/chat/ImageModal'

const ChatManagement = () => {
  const { admin } = useAdminStore()
  const [rooms, setRooms] = useState<ChatRoomWithDetails[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomWithDetails | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)

  // Load rooms on mount and periodically
  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  // Load messages when room is selected and poll for updates
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id)
      const interval = setInterval(() => loadMessages(selectedRoom.id), 2000) // Poll every 2 seconds
      return () => clearInterval(interval)
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadRooms = async () => {
    try {
      const response = await adminChatAPI.getRooms()
      console.log('Rooms response:', response.data)
      if (response.data.success) {
        setRooms(response.data.data)
      }
    } catch (error: any) {
      console.error('Failed to load chat rooms:', error)
      console.error('Error details:', error.response?.data)
      if (error.response?.status === 401) {
        toast.error('Session หมดอายุ กรุณา Login ใหม่')
      } else {
        console.error('Full error:', error)
      }
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const response = await adminChatAPI.getRoomMessages(roomId)
      console.log('Messages response:', response.data)
      if (response.data.success) {
        // API returns { success: true, data: { messages: [...], memberTyping: bool } }
        const messagesData = response.data.data.messages || response.data.data
        setMessages(Array.isArray(messagesData) ? messagesData : [])
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error)
      console.error('Error details:', error.response?.data)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแชทนี้?')) return

    try {
      await adminChatAPI.deleteRoom(roomId)
      toast.success('ลบแชทสำเร็จ')

      // Clear selected room if it was deleted
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null)
        setMessages([])
      }

      // Reload rooms
      await loadRooms()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ลบแชทไม่สำเร็จ')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!messageText.trim() && !selectedImage) || !selectedRoom || !admin) return

    setLoading(true)
    try {
      let imageUrl: string | undefined

      // Upload image if selected
      if (selectedImage) {
        const uploadResponse = await adminChatAPI.uploadImage(selectedImage)
        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.data.imageUrl
        }
      }

      await adminChatAPI.sendMessage(selectedRoom.id, messageText || '', imageUrl)
      setMessageText('')
      handleRemoveImage()
      // Reload messages immediately
      await loadMessages(selectedRoom.id)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session หมดอายุ กรุณา Login ใหม่')
      } else {
        toast.error(error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ')
      }
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-admin-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-4">
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FaComments />
              </div>
              จัดการแชท
            </h1>
          </div>

          <div className="flex h-[calc(100vh-200px)]">
            {/* Chat Rooms List */}
            <div className="w-80 border-r border-admin-border overflow-y-auto bg-admin-bg">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-brown-200 mb-3">
                  ห้องแชท ({rooms.length})
                </h2>

                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-brown-400">
                    <FaComments className="mx-auto text-4xl mb-2" />
                    <p>ยังไม่มีการสนทนา</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <div key={room.id} className="relative group">
                        <button
                          onClick={() => setSelectedRoom(room)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedRoom?.id === room.id
                              ? 'bg-gold-500/20 border-gold-500 border-2'
                              : 'bg-admin-card hover:bg-admin-hover border border-admin-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <FaUser className="text-brown-400" />
                              <span className="font-semibold text-brown-100">
                                {room.memberFullname || room.memberPhone}
                              </span>
                            </div>
                            {room.unreadCount > 0 && (
                              <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded-full">
                                {room.unreadCount}
                              </span>
                            )}
                          </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brown-400">{room.memberPhone}</span>
                          <div className="flex items-center gap-1">
                            <FaCircle className={`text-xs ${room.status === 'ACTIVE' ? 'text-success' : 'text-brown-500'}`} />
                            <span className="text-xs text-brown-400">
                              {room.lastMessageAt ? formatTime(room.lastMessageAt) : 'ไม่มีข้อความ'}
                            </span>
                          </div>
                        </div>
                      </button>
                      {/* Delete button - appears on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRoom(room.id)
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-error hover:bg-error/80 text-white p-2 rounded-lg"
                        title="ลบแชท"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-admin-card border-b border-admin-border px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-brown-100">
                          {selectedRoom.memberFullname || selectedRoom.memberPhone}
                        </h2>
                        <p className="text-sm text-brown-400">{selectedRoom.memberPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-admin-bg">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-brown-400">
                        <p>ยังไม่มีข้อความ</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const showDate = index === 0 ||
                            formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt)

                          return (
                            <React.Fragment key={message.id}>
                              {showDate && (
                                <div className="text-center my-4">
                                  <span className="bg-admin-hover text-brown-300 text-xs px-3 py-1 rounded-full">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`flex ${
                                  message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                                    message.senderType === 'ADMIN'
                                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white'
                                      : 'bg-admin-card text-brown-100 border border-admin-border'
                                  }`}
                                >
                                  {(message.imageUrl || message.image_url) && (
                                    <img
                                      src={`http://localhost:3000${message.imageUrl || message.image_url}`}
                                      alt="attachment"
                                      className="rounded-lg mb-2 max-w-full cursor-pointer"
                                      onClick={() => setModalImageUrl(message.imageUrl || message.image_url || '')}
                                    />
                                  )}
                                  {message.message && <p className="break-words">{message.message}</p>}
                                  <p
                                    className={`text-xs mt-1 ${
                                      message.senderType === 'ADMIN' ? 'text-white/80' : 'text-brown-400'
                                    }`}
                                  >
                                    {formatTime(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="bg-admin-card border-t border-admin-border p-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mb-3 relative inline-block">
                        <img src={imagePreview} alt="preview" className="max-h-32 rounded-lg border-2 border-gold-500" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 hover:bg-error/80"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-brown-400 hover:text-gold-500 hover:bg-gold-500/20 rounded-lg transition-all"
                        disabled={loading}
                      >
                        <FaImage size={24} />
                      </button>
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 px-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-brown-100 bg-admin-bg"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || (!messageText.trim() && !selectedImage)}
                        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <FaPaperPlane />
                        ส่ง
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-brown-400">
                  <div className="text-center">
                    <FaComments className="mx-auto text-6xl mb-4" />
                    <p className="text-lg">เลือกห้องแชทเพื่อเริ่มสนทนา</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      )}
    </div>
  )
}

export default ChatManagement
