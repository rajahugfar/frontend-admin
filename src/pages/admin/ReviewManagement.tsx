import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaTimes
} from 'react-icons/fa'
import { adminReportAPI } from '@/api/adminAPI'
import ConfirmModal from '@/components/admin/ConfirmModal'

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

const ReviewManagement = () => {
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
      toast.error('ไม่สามารถโหลดข้อมูลรีวิวได้')
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
      toast.success('อนุมัติรีวิวสำเร็จ')
      setApproveModalOpen(false)
      setSelectedReview(null)
      fetchReviews()
    } catch (error) {
      console.error('Failed to approve review:', error)
      toast.error('ไม่สามารถอนุมัติรีวิวได้')
    }
  }

  const handleRejectSubmit = async () => {
    if (!selectedReview) return

    if (!rejectionReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ')
      return
    }

    try {
      await adminReportAPI.rejectReview(selectedReview.id, rejectionReason)
      toast.success('ปฏิเสธรีวิวสำเร็จ')
      setRejectModalOpen(false)
      setSelectedReview(null)
      setRejectionReason('')
      fetchReviews()
    } catch (error) {
      console.error('Failed to reject review:', error)
      toast.error('ไม่สามารถปฏิเสธรีวิวได้')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <FaStar key={star} className="text-warning" />
          ) : (
            <FaRegStar key={star} className="text-brown-500" />
          )
        ))}
        <span className="ml-2 text-sm text-brown-400">({rating}/5)</span>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-warning/20', text: 'text-warning', label: 'รอดำเนินการ' },
      APPROVED: { bg: 'bg-success/20', text: 'text-success', label: 'อนุมัติแล้ว' },
      REJECTED: { bg: 'bg-error/20', text: 'text-error', label: 'ปฏิเสธแล้ว' },
    }
    const badge = badges[status as keyof typeof badges]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brown-100 flex items-center gap-3">
          <FaStar className="text-gold-500" />
          จัดการรีวิว
        </h1>
        <p className="text-brown-400 mt-1">
          อนุมัติและจัดการรีวิวจากสมาชิก
        </p>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FaFilter className="text-gold-500" />
            <div>
              <label className="block text-sm font-medium text-brown-200 mb-2">
                สถานะ
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setOffset(0)
                }}
                className="px-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="PENDING">รอดำเนินการ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="REJECTED">ปฏิเสธแล้ว</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-brown-400">
            ทั้งหมด {total} รายการ
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-lg p-12 text-center">
          <FaStar className="text-6xl text-brown-600 mx-auto mb-4" />
          <p className="text-brown-400">ไม่พบข้อมูลรีวิว</p>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    คะแนน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    ความคิดเห็น
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                    แสดงบนเว็บ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brown-300 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-brown-300 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-brown-500" />
                        <span className="text-sm font-medium text-brown-200">
                          {review.memberUsername || review.memberId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-brown-200 max-w-md">
                        {review.comment}
                      </div>
                      {review.rejectionReason && (
                        <div className="text-sm text-error mt-1">
                          เหตุผล: {review.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {review.isDisplayed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                          <FaEye />
                          แสดง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-brown-500/20 text-brown-400">
                          <FaEyeSlash />
                          ไม่แสดง
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-400">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-brown-500" />
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {review.status === 'PENDING' ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleApproveClick(review)}
                            className="px-3 py-1.5 bg-success/20 text-success hover:bg-success/30 rounded-lg transition-colors font-medium text-sm"
                          >
                            <FaCheckCircle className="inline mr-1" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleRejectClick(review)}
                            className="px-3 py-1.5 bg-error/20 text-error hover:bg-error/30 rounded-lg transition-colors font-medium text-sm"
                          >
                            <FaTimesCircle className="inline mr-1" />
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : review.status === 'APPROVED' ? (
                        <div className="text-xs text-brown-400">
                          โดย {review.approvedByUsername || 'Admin'}
                          <br />
                          {review.approvedAt && formatDate(review.approvedAt)}
                        </div>
                      ) : (
                        <div className="text-xs text-brown-400">
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

      {/* Approve Modal */}
      {approveModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brown-100">อนุมัติรีวิว</h2>
              <button
                onClick={() => {
                  setApproveModalOpen(false)
                  setSelectedReview(null)
                }}
                className="text-brown-400 hover:text-brown-200 p-2 hover:bg-admin-hover rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-brown-400">สมาชิก</label>
                <div className="mt-1 text-brown-100">
                  {selectedReview.memberUsername || selectedReview.memberId.slice(0, 8)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brown-400">คะแนน</label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-brown-400">ความคิดเห็น</label>
                <div className="mt-1 p-3 bg-admin-bg rounded-lg text-brown-200">
                  {selectedReview.comment}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-admin-bg rounded-lg hover:bg-admin-hover transition-colors">
                <input
                  type="checkbox"
                  checked={isDisplayed}
                  onChange={(e) => setIsDisplayed(e.target.checked)}
                  className="w-4 h-4 text-gold-500 bg-admin-bg border-admin-border rounded focus:ring-gold-500"
                />
                <span className="text-sm text-brown-200">แสดงรีวิวนี้บนหน้าเว็บไซต์</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setApproveModalOpen(false)
                  setSelectedReview(null)
                }}
                className="flex-1 px-4 py-3 bg-admin-hover text-brown-200 hover:bg-admin-border rounded-lg transition-all font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApproveSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brown-100">ปฏิเสธรีวิว</h2>
              <button
                onClick={() => {
                  setRejectModalOpen(false)
                  setSelectedReview(null)
                  setRejectionReason('')
                }}
                className="text-brown-400 hover:text-brown-200 p-2 hover:bg-admin-hover rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-brown-400">สมาชิก</label>
                <div className="mt-1 text-brown-100">
                  {selectedReview.memberUsername || selectedReview.memberId.slice(0, 8)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brown-400">คะแนน</label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-brown-400">ความคิดเห็น</label>
                <div className="mt-1 p-3 bg-admin-bg rounded-lg text-brown-200">
                  {selectedReview.comment}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-brown-200 mb-2">
                เหตุผลในการปฏิเสธ *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                placeholder="ระบุเหตุผล..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false)
                  setSelectedReview(null)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-3 bg-admin-hover text-brown-200 hover:bg-admin-border rounded-lg transition-all font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-error to-error/80 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
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
