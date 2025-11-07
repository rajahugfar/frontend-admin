import React, { useState, useEffect } from 'react'
import { adminReportAPI } from '../../api/adminAPI'

interface Review {
  id: string
  memberId: string
  memberUsername?: string
  rating: number
  comment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isDisplayed: boolean
  approvedBy?: string
  approvedByUsername?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedByUsername?: string
  rejectedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

interface ReviewListResponse {
  reviews: Review[]
  total: number
  limit: number
  offset: number
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)

  // Approve modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isDisplayed, setIsDisplayed] = useState(false)

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [statusFilter, offset])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const data = await adminReportAPI.getReviews({
        status: statusFilter || undefined,
        limit,
        offset,
      })
      setReviews(data.reviews)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      alert('ไม่สามารถโหลดข้อมูลรีวิวได้')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (review: Review) => {
    setSelectedReview(review)
    setIsDisplayed(false)
    setApproveModalOpen(true)
  }

  const handleRejectClick = (review: Review) => {
    setSelectedReview(review)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleApproveSubmit = async () => {
    if (!selectedReview) return

    try {
      await adminReportAPI.approveReview(selectedReview.id, isDisplayed)
      alert('อนุมัติรีวิวสำเร็จ')
      setApproveModalOpen(false)
      setSelectedReview(null)
      fetchReviews()
    } catch (error) {
      console.error('Failed to approve review:', error)
      alert('ไม่สามารถอนุมัติรีวิวได้')
    }
  }

  const handleRejectSubmit = async () => {
    if (!selectedReview) return

    if (!rejectionReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ')
      return
    }

    try {
      await adminReportAPI.rejectReview(selectedReview.id, rejectionReason)
      alert('ปฏิเสธรีวิวสำเร็จ')
      setRejectModalOpen(false)
      setSelectedReview(null)
      setRejectionReason('')
      fetchReviews()
    } catch (error) {
      console.error('Failed to reject review:', error)
      alert('ไม่สามารถปฏิเสธรีวิวได้')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    const labels = {
      PENDING: 'รอดำเนินการ',
      APPROVED: 'อนุมัติแล้ว',
      REJECTED: 'ปฏิเสธแล้ว',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">จัดการรีวิว</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setOffset(0)
              }}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="REJECTED">ปฏิเสธแล้ว</option>
            </select>
          </div>

          <div className="flex-1" />

          <div className="text-sm text-gray-600">
            ทั้งหมด {total} รายการ
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">กำลังโหลด...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          ไม่พบข้อมูลรีวิว
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สมาชิก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  คะแนน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ความคิดเห็น
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  แสดงบนเว็บ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.memberUsername || review.memberId.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {review.comment}
                    </div>
                    {review.rejectionReason && (
                      <div className="text-sm text-red-600 mt-1">
                        เหตุผล: {review.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(review.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.isDisplayed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {review.isDisplayed ? 'แสดง' : 'ไม่แสดง'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {review.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveClick(review)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleRejectClick(review)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : review.status === 'APPROVED' ? (
                      <div className="text-xs text-gray-500">
                        โดย {review.approvedByUsername || 'Admin'}
                        <br />
                        {review.approvedAt && formatDate(review.approvedAt)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        โดย {review.rejectedByUsername || 'Admin'}
                        <br />
                        {review.rejectedAt && formatDate(review.rejectedAt)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2">
            หน้า {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">อนุมัติรีวิว</h2>

            <div className="mb-4">
              <div className="mb-2">
                <strong>สมาชิก:</strong> {selectedReview.memberUsername || selectedReview.memberId.slice(0, 8)}
              </div>
              <div className="mb-2">
                <strong>คะแนน:</strong> {renderStars(selectedReview.rating)}
              </div>
              <div className="mb-4">
                <strong>ความคิดเห็น:</strong>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedReview.comment}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDisplayed}
                  onChange={(e) => setIsDisplayed(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">แสดงรีวิวนี้บนหน้าเว็บไซต์</span>
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setApproveModalOpen(false)
                  setSelectedReview(null)
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApproveSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">ปฏิเสธรีวิว</h2>

            <div className="mb-4">
              <div className="mb-2">
                <strong>สมาชิก:</strong> {selectedReview.memberUsername || selectedReview.memberId.slice(0, 8)}
              </div>
              <div className="mb-2">
                <strong>คะแนน:</strong> {renderStars(selectedReview.rating)}
              </div>
              <div className="mb-4">
                <strong>ความคิดเห็น:</strong>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedReview.comment}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เหตุผลในการปฏิเสธ *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุเหตุผล..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectModalOpen(false)
                  setSelectedReview(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewManagement
