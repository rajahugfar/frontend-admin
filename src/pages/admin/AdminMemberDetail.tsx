import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiCreditCard, FiDollarSign,
  FiTrendingUp, FiTrendingDown, FiClock, FiEdit, FiLock,
  FiUnlock, FiRefreshCw, FiPlusCircle,
  FiMinusCircle, FiFileText, FiActivity, FiList
} from 'react-icons/fi';
import { adminAPIClient } from '@/api/adminAPI';
import toast from 'react-hot-toast';
import AddCreditModal from '@/components/admin/modals/AddCreditModal';
import DeductCreditModal from '@/components/admin/modals/DeductCreditModal';

interface Member {
  id: string;
  phone: string;
  fullname: string;
  bankCode: string;
  bankNumber: string;
  line: string | null;
  ref: string | null;
  referralCode: string;
  credit: number;
  creditRefLose: number;
  creditGame: number;
  turnover: number;
  turnoverNeed: number;
  status: string;
  statusStock: number;
  productId: string | null;
  gameUsername: string;
  lastLogin: string | null;
  lastIp: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberData {
  member: Member;
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  recentDeposits: any[];
  recentWithdrawals: any[];
  recentTransactions: any[];
}

const AdminMemberDetail: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [showDeductCreditModal, setShowDeductCreditModal] = useState(false);

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      const response = await adminAPIClient.get(`/members/${memberId}`);
      if (response.data.status === 'success' && response.data.data) {
        setData(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load member data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสมาชิกได้');
    } finally {
      setLoading(false);
    }
  };

  const getBankName = (code: string) => {
    const banks: Record<string, string> = {
      'KBANK': 'กสิกรไทย',
      'SCB': 'ไทยพาณิชย์',
      'BBL': 'กรุงเทพ',
      'KTB': 'กรุงไทย',
      'BAY': 'กรุงศรี',
      'TMB': 'ทหารไทยธนชาต',
      'TRUEWALLET': 'TrueMoney Wallet'
    };
    return banks[code] || code;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg text-green-300 font-semibold text-sm">
            ใช้งานปกติ
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-400/30 rounded-lg text-red-300 font-semibold text-sm">
            ระงับการใช้งาน
          </span>
        );
      case 'BANNED':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-400/30 rounded-lg text-gray-300 font-semibold text-sm">
            แบน
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(amount);
  };

  const handleToggleStatus = async () => {
    if (!data) return;

    const newStatus = data.member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmText = newStatus === 'ACTIVE' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';

    if (!confirm(`ยืนยันการ${confirmText}บัญชีนี้?`)) return;

    try {
      await adminAPIClient.put(`/members/${memberId}/status`, { status: newStatus });
      toast.success(`${confirmText}สำเร็จ`);
      loadMemberData();
    } catch (error) {
      toast.error(`ไม่สามารถ${confirmText}ได้`);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('ยืนยันการรีเซ็ตรหัสผ่าน?')) return;

    try {
      await adminAPIClient.post(`/members/${memberId}/reset-password`);
      toast.success('รีเซ็ตรหัสผ่านสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถรีเซ็ตรหัสผ่านได้');
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
          <FiUser />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-dark via-admin-darker to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl text-white mb-2">ไม่พบข้อมูลสมาชิก</h2>
          <button
            onClick={() => navigate('/admin/members')}
            className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-brown-900 font-bold rounded-lg hover:shadow-lg hover:shadow-gold-500/50 transition-all"
          >
            กลับรายชื่อสมาชิก
          </button>
        </div>
      </div>
    );
  }

  const { member } = data;

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
              onClick={() => navigate('/admin/members')}
              className="flex items-center gap-2 text-gray-300 hover:text-gold-400 transition-colors mb-4"
            >
              <FiArrowLeft className="text-xl" />
              <span>กลับ</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
                  ข้อมูลสมาชิก
                </h1>
                <p className="text-gray-400 mt-1">รหัสสมาชิก: {member.id}</p>
              </div>
              {getStatusBadge(member.status)}
            </div>
          </motion.div>

          {/* Member Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-admin-card via-admin-darker to-admin-card backdrop-blur-xl rounded-2xl border border-gold-500/30 overflow-hidden mb-6 shadow-2xl shadow-gold-500/20"
          >
            <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-3 px-6 border-b border-gold-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brown-900">
                  <FiUser className="text-xl" />
                  <span className="text-lg font-bold">ข้อมูลส่วนตัว</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleStatus}
                    className="px-3 py-1.5 bg-brown-900/20 hover:bg-brown-900/40 rounded-lg text-brown-900 font-medium text-sm transition-all flex items-center gap-1"
                  >
                    {member.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />}
                    {member.status === 'ACTIVE' ? 'ระงับ' : 'เปิดใช้'}
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="px-3 py-1.5 bg-brown-900/20 hover:bg-brown-900/40 rounded-lg text-brown-900 font-medium text-sm transition-all flex items-center gap-1"
                  >
                    <FiRefreshCw />
                    รีเซ็ตรหัสผ่าน
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-gold-400 font-bold mb-3 flex items-center gap-2">
                  <FiPhone /> ข้อมูลติดต่อ
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">เบอร์โทรศัพท์</p>
                    <p className="text-white font-bold">{member.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">ชื่อ-นามสกุล</p>
                    <p className="text-gray-300">{member.fullname || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">LINE ID</p>
                    <p className="text-gray-300">{member.line || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">รหัสแนะนำ</p>
                    <p className="text-gold-400 font-bold">{member.referralCode}</p>
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              <div className="space-y-4">
                <h3 className="text-info font-bold mb-3 flex items-center gap-2">
                  <FiCreditCard /> ข้อมูลบัญชี
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">ธนาคาร</p>
                    <p className="text-white font-bold">{getBankName(member.bankCode)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">เลขบัญชี</p>
                    <p className="text-gray-300">{member.bankNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Username เกม</p>
                    <p className="text-gray-300">{member.gameUsername}</p>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="space-y-4">
                <h3 className="text-gray-400 font-bold mb-3 flex items-center gap-2">
                  <FiClock /> ข้อมูลระบบ
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">สมัครสมาชิกเมื่อ</p>
                    <p className="text-gray-300 text-sm">{formatDate(member.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">แก้ไขล่าสุด</p>
                    <p className="text-gray-300 text-sm">{formatDate(member.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">เข้าสู่ระบบล่าสุด</p>
                    <p className="text-gray-300 text-sm">{formatDate(member.lastLogin)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">IP ล่าสุด</p>
                    <p className="text-gray-300 text-sm">{member.lastIp || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Credit */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-gold-500/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiDollarSign className="text-3xl text-gold-400" />
                <button className="p-2 bg-gold-500/20 hover:bg-gold-500/30 rounded-lg transition-all">
                  <FiEdit className="text-gold-400" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-1">เครดิตปัจจุบัน</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(member.credit)}</p>
              <p className="text-gray-500 text-xs mt-1">บาท</p>
            </div>

            {/* Game Credit */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-info/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiActivity className="text-3xl text-info" />
              </div>
              <p className="text-gray-400 text-sm mb-1">เครดิตในเกม</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(member.creditGame)}</p>
              <p className="text-gray-500 text-xs mt-1">บาท</p>
            </div>

            {/* Total Deposits */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-success/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiTrendingUp className="text-3xl text-success" />
              </div>
              <p className="text-gray-400 text-sm mb-1">ฝากทั้งหมด</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(data.totalDeposits)}</p>
              <p className="text-gray-500 text-xs mt-1">{data.depositCount} ครั้ง</p>
            </div>

            {/* Total Withdrawals */}
            <div className="bg-gradient-to-br from-admin-card to-admin-darker rounded-xl border border-danger/30 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <FiTrendingDown className="text-3xl text-danger" />
              </div>
              <p className="text-gray-400 text-sm mb-1">ถอนทั้งหมด</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(data.totalWithdrawals)}</p>
              <p className="text-gray-500 text-xs mt-1">{data.withdrawalCount} ครั้ง</p>
            </div>
          </motion.div>

          {/* Turnover Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-admin-card via-admin-darker to-admin-card backdrop-blur-xl rounded-2xl border border-gold-500/30 overflow-hidden mb-6 shadow-2xl shadow-gold-500/20"
          >
            <div className="bg-gradient-to-r from-info via-info/80 to-info py-3 px-6 border-b border-info/30">
              <div className="flex items-center gap-2 text-white">
                <FiActivity className="text-xl" />
                <span className="text-lg font-bold">เทิร์นโอเวอร์</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">เทิร์นโอเวอร์ปัจจุบัน</p>
                  <p className="text-white font-bold text-3xl">{formatCurrency(member.turnover)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">เทิร์นโอเวอร์ที่ต้องทำ</p>
                  <p className="text-warning font-bold text-3xl">{formatCurrency(member.turnoverNeed)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">เทิร์นโอเวอร์คงเหลือ</p>
                  <p className={`font-bold text-3xl ${member.turnoverNeed - member.turnover > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(Math.max(0, member.turnoverNeed - member.turnover))}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">ความคืบหน้า</span>
                  <span className="text-gold-400 font-bold">
                    {member.turnoverNeed > 0 ? ((member.turnover / member.turnoverNeed) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-admin-darker rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${member.turnoverNeed > 0 ? Math.min(100, (member.turnover / member.turnoverNeed) * 100) : 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-admin-card via-admin-darker to-admin-card backdrop-blur-xl rounded-2xl border border-gold-500/30 overflow-hidden shadow-2xl shadow-gold-500/20"
          >
            <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-3 px-6 border-b border-gold-400/30">
              <div className="flex items-center gap-2 text-brown-900">
                <FiFileText className="text-xl" />
                <span className="text-lg font-bold">จัดการบัญชี</span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setShowAddCreditModal(true)}
                className="p-4 bg-gradient-to-br from-success/20 to-success/10 border border-success/30 rounded-xl hover:shadow-lg hover:shadow-success/20 transition-all group"
              >
                <FiPlusCircle className="text-2xl text-success mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-success font-medium text-sm">เพิ่มเครดิต</p>
              </button>

              <button
                onClick={() => setShowDeductCreditModal(true)}
                className="p-4 bg-gradient-to-br from-danger/20 to-danger/10 border border-danger/30 rounded-xl hover:shadow-lg hover:shadow-danger/20 transition-all group"
              >
                <FiMinusCircle className="text-2xl text-danger mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-danger font-medium text-sm">ลดเครดิต</p>
              </button>

              <button
                onClick={() => navigate(`/admin/members/${member.id}/transactions`)}
                className="p-4 bg-gradient-to-br from-info/20 to-info/10 border border-info/30 rounded-xl hover:shadow-lg hover:shadow-info/20 transition-all group"
              >
                <FiFileText className="text-2xl text-info mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-info font-medium text-sm">ประวัติธุรกรรม</p>
              </button>

              <button
                onClick={() => navigate(`/admin/members/${member.id}/poys`)}
                className="p-4 bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all group"
              >
                <FiList className="text-2xl text-gold-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-gold-400 font-medium text-sm">โพยหวย</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AddCreditModal
        isOpen={showAddCreditModal}
        member={data?.member}
        onClose={() => setShowAddCreditModal(false)}
        onSuccess={() => {
          setShowAddCreditModal(false);
          loadMemberData();
        }}
      />

      <DeductCreditModal
        isOpen={showDeductCreditModal}
        member={data?.member}
        onClose={() => setShowDeductCreditModal(false)}
        onSuccess={() => {
          setShowDeductCreditModal(false);
          loadMemberData();
        }}
      />
    </div>
  );
};

export default AdminMemberDetail;
