import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiFileText, FiCalendar, FiClock, FiUser, FiX, FiAlertTriangle } from 'react-icons/fi';
import { adminAPIClient } from '@/api/adminAPI';
import { adminPoyAPI } from '@/api/adminPoyAPI';
import toast from 'react-hot-toast';

interface PoyItem {
  id: string;
  numberBet: string;
  betType: string;
  price: number;
  multiply: number;
  winAmount: number;
  isWin: boolean;
  createdAt: string;
}

interface PoyDetail {
  id: string;
  stockId: number;
  memberId: string;
  poyName: string;
  poyNumber: string;
  dateBuy: string;
  totalPrice: number;
  winPrice: number;
  status: number;
  items: PoyItem[];
  note?: string;
}

const AdminPoyDetail: React.FC = () => {
  const { poyId } = useParams<{ poyId: string }>();
  const navigate = useNavigate();
  const [poy, setPoy] = useState<PoyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadPoyDetail();
  }, [poyId]);

  const loadPoyDetail = async () => {
    try {
      setLoading(true);
      const response = await adminPoyAPI.getPoyDetail(poyId!);
      if (response.status === 'success' && response.data) {
        setPoy(response.data as any);

        // Load member info
        if ((response.data as any).memberId) {
          loadMemberInfo((response.data as any).memberId);
        }
      }
    } catch (error: any) {
      console.error('Failed to load poy detail:', error);
      toast.error('ไม่สามารถโหลดข้อมูลโพยได้');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberInfo = async (memberId: string) => {
    try {
      const response = await adminAPIClient.get(`/members/${memberId}`);
      if (response.data.status === 'success' && response.data.data && response.data.data.member) {
        setMemberInfo(response.data.data.member);
      }
    } catch (error) {
      console.error('Failed to load member info:', error);
    }
  };

  const getBetTypeName = (betType: string): string => {
    const types: Record<string, string> = {
      'teng_bon_3': '3 ตัวบน',
      'teng_lang_3': '3 ตัวล่าง',
      'teng_lang_nha_3': '3 ตัวหน้า',
      'tode_3': '3 ตัวโต๊ด',
      'teng_bon_2': '2 ตัวบน',
      'teng_lang_2': '2 ตัวล่าง',
      'teng_bon_1': 'วิ่งบน',
      'teng_lang_1': 'วิ่งล่าง',
      'tode_4': '4 ตัวโต๊ด',
      'teng_bon_4': '4 ตัวบน'
    };
    return types[betType] || betType;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-400/30 rounded-lg text-red-300 font-semibold text-sm">
            ยกเลิกแล้ว
          </span>
        );
      case 1:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-400/30 rounded-lg text-yellow-300 font-semibold text-sm">
            รอออกผล
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg text-green-300 font-semibold text-sm">
            ออกผลแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  const getItemStatus = (item: PoyItem, status: number) => {
    if (status === 0) {
      return { label: 'ยกเลิก', style: 'bg-red-500/20 text-red-300 border-red-400/30' };
    }
    if (status === 1) {
      return { label: 'รอออกผล', style: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' };
    }
    if (item.isWin) {
      return { label: 'ถูกรางวัล', style: 'bg-green-500/20 text-green-300 border-green-400/30' };
    }
    return { label: 'ไม่ถูกรางวัล', style: 'bg-gray-500/20 text-gray-400 border-gray-400/30' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelPoy = async () => {
    if (!cancelReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการยกเลิก');
      return;
    }

    if (cancelReason.trim().length < 5) {
      toast.error('กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร');
      return;
    }

    try {
      setCancelling(true);
      const response = await adminPoyAPI.cancelPoy(poyId!, { reason: cancelReason });
      toast.success(response.message || 'ยกเลิกโพยสำเร็จ');
      setShowCancelModal(false);
      setCancelReason('');
      loadPoyDetail();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'ไม่สามารถยกเลิกโพยได้';
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-5xl text-gold-400"
        >
          <FiFileText />
        </motion.div>
      </div>
    );
  };

  if (!poy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl text-white mb-2">ไม่พบข้อมูลโพย</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-brown-900 font-bold rounded-lg hover:shadow-lg hover:shadow-gold-500/50 transition-all"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-gold-400 transition-colors mb-4"
            >
              <FiArrowLeft className="text-xl" />
              <span>กลับ</span>
            </button>

            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
              รายละเอียดโพย (Admin)
            </h1>
          </motion.div>

          {/* Poy Header Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-admin-card via-admin-darker to-admin-card backdrop-blur-xl rounded-2xl border border-gold-500/30 overflow-hidden mb-6 shadow-2xl shadow-gold-500/20"
          >
            {/* Poy Number Banner */}
            <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-3 px-6 text-center border-b border-gold-400/30">
              <div className="flex items-center justify-center gap-2 text-brown-900">
                <FiFileText className="text-xl" />
                <span className="text-lg font-bold">โพยเลขที่ #{poy.poyNumber}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{poy.poyName}</span>
                  {getStatusBadge(poy.status)}
                </div>
                <div className="flex items-center justify-center md:justify-end gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="text-info" />
                    <span>{formatDate(poy.dateBuy)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="text-info" />
                    <span>{formatTime(poy.dateBuy)}</span>
                  </div>
                </div>
              </div>

              {/* Member Info & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Member Info */}
                {memberInfo && (
                  <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-sm rounded-xl p-4 border border-info/20">
                    <p className="text-info text-sm mb-2 flex items-center gap-1">
                      <FiUser /> ข้อมูลสมาชิก
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">เบอร์:</span>
                        <p className="text-white font-bold text-sm">{memberInfo.phone}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">ชื่อ:</span>
                        <p className="text-gray-300 text-sm">{memberInfo.fullname || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Price */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-4 border border-blue-400/20">
                  <p className="text-blue-300 text-sm mb-1 flex items-center gap-1">
                    <span>💰</span> ยอดแทง
                  </p>
                  <p className="text-white font-bold text-2xl">{poy.totalPrice.toFixed(2)}</p>
                  <p className="text-gray-500 text-xs">บาท</p>
                </div>

                {/* Win Amount */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-xl p-4 border border-green-400/20">
                  <p className="text-green-300 text-sm mb-1 flex items-center gap-1">
                    <span>🎁</span> ผลได้เสีย
                  </p>
                  <p className={`font-bold text-2xl ${poy.winPrice > 0 ? 'text-green-400' : 'text-white'}`}>
                    {poy.winPrice > 0 ? '+' : ''}{poy.winPrice.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs">บาท</p>
                </div>

                {/* Items Count */}
                <div className="bg-gradient-to-br from-gold-500/10 to-gold-600/5 backdrop-blur-sm rounded-xl p-4 border border-gold-400/20">
                  <p className="text-gold-300 text-sm mb-1 flex items-center gap-1">
                    <span>📋</span> จำนวนรายการ
                  </p>
                  <p className="text-white font-bold text-2xl">{poy.items.length}</p>
                  <p className="text-gray-500 text-xs">รายการ</p>
                </div>
              </div>

              {poy.note && (
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl">
                  <p className="text-indigo-300 text-xs mb-1">หมายเหตุ</p>
                  <p className="text-gray-300 text-sm">{poy.note}</p>
                </div>
              )}

              {/* Admin Actions */}
              {poy.status === 1 && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all font-medium"
                  >
                    ยกเลิกโพย
                  </button>
                  <button
                    onClick={() => navigate(`/admin/members/${poy.memberId}`)}
                    className="px-4 py-2 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg hover:shadow-info/50 transition-all font-medium"
                  >
                    ดูข้อมูลสมาชิก
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Items List - Grid 3 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
              <span>📋</span>
              รายการแทงทั้งหมด ({poy.items.length} รายการ)
            </h2>

            {/* Grid 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {poy.items.map((item, index) => {
                const status = getItemStatus(item, poy.status);
                const payout = item.price * item.multiply;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    className="bg-gradient-to-br from-admin-card via-admin-darker to-admin-card backdrop-blur-xl rounded-xl border border-gold-500/20 overflow-hidden hover:border-gold-400/40 transition-all shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gold-500/20 bg-black/20">
                      <span className="text-sm font-bold text-gold-400">#{index + 1}</span>
                      <span className={`px-2 py-0.5 rounded-lg border text-xs font-semibold ${status.style}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {/* Number and Type */}
                      <div className="text-center mb-3">
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-1">
                          {item.numberBet}
                        </p>
                        <p className="text-gray-400 text-xs">{getBetTypeName(item.betType)}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">ราคาจ่าย</span>
                          <span className="text-info font-semibold">{payout.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gold-500/20">
                          <span className="text-gray-400">ราคาแทง</span>
                          <span className="text-white font-semibold">{item.price.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">อัตราจ่าย</span>
                          <span className="text-gray-300">x {item.multiply}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gold-500/20">
                          <span className="text-gray-400">ผลได้เสีย</span>
                          <span className={`font-bold ${item.winAmount > 0 ? 'text-warning' : 'text-gray-300'}`}>
                            {item.winAmount > 0 ? '+' : ''}{item.winAmount.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cancel Poy Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !cancelling && setShowCancelModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gradient-to-br from-admin-card via-admin-darker to-admin-card rounded-2xl border border-red-500/50 shadow-2xl shadow-red-500/20 max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-4 px-6 border-b border-red-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <FiAlertTriangle className="text-2xl" />
                  <span className="text-lg font-bold">ยกเลิกโพย</span>
                </div>
                <button
                  onClick={() => !cancelling && setShowCancelModal(false)}
                  disabled={cancelling}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
                >
                  <FiX className="text-2xl text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Warning */}
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-300 text-sm text-center">
                    ⚠️ การยกเลิกโพยไม่สามารถย้อนกลับได้<br />
                    กรุณาระบุเหตุผลอย่างชัดเจน
                  </p>
                </div>

                {/* Poy Info */}
                <div className="mb-4 p-4 bg-admin-darker rounded-xl border border-gold-500/20">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">เลขที่โพย:</span>
                      <span className="text-gold-400 font-bold">{poy?.poyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ยอดแทง:</span>
                      <span className="text-white font-bold">{poy?.totalPrice.toFixed(2)} ฿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">จำนวนรายการ:</span>
                      <span className="text-info font-bold">{poy?.items.length} รายการ</span>
                    </div>
                  </div>
                </div>

                {/* Reason Input */}
                <div className="space-y-2">
                  <label className="block text-gold-400 font-medium">
                    เหตุผลในการยกเลิก <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="กรุณาระบุเหตุผล (อย่างน้อย 5 ตัวอักษร)..."
                    disabled={cancelling}
                    rows={4}
                    autoFocus
                    className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 disabled:opacity-50 resize-none transition-all"
                  />
                  <p className="text-gray-400 text-xs flex items-center justify-between">
                    <span>ความยาวอย่างน้อย 5 ตัวอักษร</span>
                    <span className={cancelReason.length >= 5 ? 'text-success' : 'text-gray-500'}>
                      {cancelReason.length}/5
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-admin-darker border border-gray-500/30 text-gray-300 rounded-xl hover:bg-admin-dark transition-all font-medium disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCancelPoy}
                  disabled={cancelling || cancelReason.trim().length < 5}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกโพย'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPoyDetail;
