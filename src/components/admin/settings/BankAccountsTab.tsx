import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCreditCard, FiToggleLeft, FiToggleRight, FiStar, FiRefreshCw } from 'react-icons/fi';
import { adminAPIClient } from '@/api/adminAPI';
import toast from 'react-hot-toast';

interface BankAccount {
  id: string;
  bankType: 'SCB' | 'KBANK' | 'TRUEWALLET';
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
  dailyLimit: number;
  currentUsage: number;
  priority: number;
  apiUsername?: string;
  apiPassword?: string;
  deviceId?: string;
  phoneNumber?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BankAccountsTab: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bankType: 'SCB' as 'SCB' | 'KBANK' | 'TRUEWALLET',
    accountNumber: '',
    accountName: '',
    bankCode: '',
    bankName: '',
    dailyLimit: 1000000,
    apiUsername: '',
    apiPassword: '',
    deviceId: '',
    phoneNumber: '',
    priority: 0
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await adminAPIClient.get('/bank-accounts');
      if (response.data.success && response.data.data) {
        // API returns { data: { bankAccounts: [...], total: N } }
        const bankAccounts = response.data.data.bankAccounts || [];
        setAccounts(Array.isArray(bankAccounts) ? bankAccounts : []);
      } else {
        setAccounts([]);
      }
    } catch (error: any) {
      console.error('Failed to load bank accounts:', error);
      toast.error('ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        bankType: formData.bankType,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        bankCode: formData.bankCode,
        bankName: formData.bankName,
        dailyLimit: formData.dailyLimit,
        priority: formData.priority
      };

      if (formData.apiUsername) payload.apiUsername = formData.apiUsername;
      if (formData.apiPassword) payload.apiPassword = formData.apiPassword;
      if (formData.deviceId) payload.deviceId = formData.deviceId;
      if (formData.phoneNumber) payload.phoneNumber = formData.phoneNumber;

      if (editingAccount) {
        await adminAPIClient.patch(`/bank-accounts/${editingAccount.id}`, payload);
        toast.success('แก้ไขบัญชีธนาคารเรียบร้อย');
      } else {
        await adminAPIClient.post('/bank-accounts', payload);
        toast.success('เพิ่มบัญชีธนาคารเรียบร้อย');
      }

      resetForm();
      loadBankAccounts();
    } catch (error: any) {
      console.error('Failed to save bank account:', error);
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบบัญชีธนาคารนี้ใช่หรือไม่?')) return;

    try {
      await adminAPIClient.delete(`/bank-accounts/${id}`);
      toast.success('ลบบัญชีธนาคารเรียบร้อย');
      loadBankAccounts();
    } catch (error: any) {
      toast.error('ไม่สามารถลบบัญชีธนาคารได้');
    }
  };

  const toggleStatus = async (account: BankAccount) => {
    try {
      if (account.status === 'ACTIVE') {
        await adminAPIClient.post(`/bank-accounts/${account.id}/deactivate`);
        toast.success('ปิดการใช้งานบัญชีธนาคารแล้ว');
      } else {
        await adminAPIClient.post(`/bank-accounts/${account.id}/activate`);
        toast.success('เปิดการใช้งานบัญชีธนาคารแล้ว');
      }
      loadBankAccounts();
    } catch (error: any) {
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      await adminAPIClient.post(`/bank-accounts/${id}/set-default`);
      toast.success('ตั้งเป็นบัญชีหลักแล้ว');
      loadBankAccounts();
    } catch (error: any) {
      toast.error('ไม่สามารถตั้งเป็นบัญชีหลักได้');
    }
  };

  const resetUsage = async (id: string) => {
    try {
      await adminAPIClient.post(`/bank-accounts/${id}/reset-usage`);
      toast.success('รีเซ็ตยอดใช้งานแล้ว');
      loadBankAccounts();
    } catch (error: any) {
      toast.error('ไม่สามารถรีเซ็ตยอดใช้งานได้');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bankType: account.bankType,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      bankCode: account.bankCode,
      bankName: account.bankName,
      dailyLimit: account.dailyLimit,
      apiUsername: account.apiUsername || '',
      apiPassword: account.apiPassword || '',
      deviceId: account.deviceId || '',
      phoneNumber: account.phoneNumber || '',
      priority: account.priority
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      bankType: 'SCB',
      accountNumber: '',
      accountName: '',
      bankCode: '',
      bankName: '',
      dailyLimit: 1000000,
      apiUsername: '',
      apiPassword: '',
      deviceId: '',
      phoneNumber: '',
      priority: 0
    });
    setEditingAccount(null);
    setShowAddModal(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 });
  };

  const getBankColor = (bankType: string) => {
    switch (bankType) {
      case 'SCB': return 'from-purple-500 to-purple-600';
      case 'KBANK': return 'from-green-500 to-green-600';
      case 'TRUEWALLET': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiRefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gold-500">จัดการบัญชีธนาคาร</h2>
          <p className="text-brown-300 text-sm mt-1">บัญชีสำหรับรับฝาก-ถอนเงิน</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-brown-900 rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <FiPlus className="w-5 h-5" />
          เพิ่มบัญชี
        </button>
      </div>

      {/* Bank Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-admin-card rounded-lg border border-admin-border p-6 hover:border-gold-500/50 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`px-3 py-1.5 bg-gradient-to-r ${getBankColor(account.bankType)} rounded-lg`}>
                <span className="text-white font-bold text-sm">{account.bankType}</span>
              </div>
              <div className="flex gap-1">
                {account.isDefault && (
                  <span className="text-gold-500" title="บัญชีหลัก">
                    <FiStar className="w-5 h-5 fill-current" />
                  </span>
                )}
                <button
                  onClick={() => toggleStatus(account)}
                  className={`p-1.5 rounded transition-all ${
                    account.status === 'ACTIVE'
                      ? 'text-success hover:bg-success/20'
                      : 'text-gray-500 hover:bg-gray-500/20'
                  }`}
                  title={account.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                >
                  {account.status === 'ACTIVE' ? (
                    <FiToggleRight className="w-6 h-6" />
                  ) : (
                    <FiToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-brown-400">เลขบัญชี</p>
                <p className="text-white font-mono font-bold">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-brown-400">ชื่อบัญชี</p>
                <p className="text-brown-100">{account.accountName}</p>
              </div>
              <div>
                <p className="text-xs text-brown-400">ธนาคาร</p>
                <p className="text-brown-100">{account.bankName}</p>
              </div>
            </div>

            {/* Usage */}
            <div className="bg-admin-bg rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-brown-400">ยอดใช้งานวันนี้</span>
                <button
                  onClick={() => resetUsage(account.id)}
                  className="text-xs text-info hover:text-info/80"
                >
                  รีเซ็ต
                </button>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-brown-100">
                  {formatCurrency(account.currentUsage)}
                </span>
                <span className="text-xs text-brown-400">
                  / {formatCurrency(account.dailyLimit)}
                </span>
              </div>
              <div className="w-full bg-brown-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-gold-500 to-gold-600 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min((account.currentUsage / account.dailyLimit) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(account)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-info/20 text-info rounded-lg hover:bg-info/30 transition-all"
              >
                <FiEdit2 className="w-4 h-4" />
                แก้ไข
              </button>
              {!account.isDefault && (
                <button
                  onClick={() => setAsDefault(account.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold-500/20 text-gold-500 rounded-lg hover:bg-gold-500/30 transition-all"
                >
                  <FiStar className="w-4 h-4" />
                  ตั้งเป็นหลัก
                </button>
              )}
              <button
                onClick={() => handleDelete(account.id)}
                className="px-3 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-all"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FiCreditCard className="w-16 h-16 text-brown-600 mx-auto mb-4" />
            <p className="text-brown-400">ยังไม่มีบัญชีธนาคาร</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card rounded-xl border border-admin-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-admin-card border-b border-admin-border p-6">
              <h3 className="text-xl font-bold text-gold-500">
                {editingAccount ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Bank Type */}
              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  ประเภทธนาคาร *
                </label>
                <select
                  value={formData.bankType}
                  onChange={(e) => setFormData({ ...formData, bankType: e.target.value as any })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  <option value="SCB">SCB - ไทยพาณิชย์</option>
                  <option value="KBANK">KBANK - กสิกรไทย</option>
                  <option value="TRUEWALLET">TrueWallet</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  เลขบัญชี *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-brown-200 mb-2">
                  ชื่อบัญชี *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>

              {/* Bank Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    รหัสธนาคาร *
                  </label>
                  <input
                    type="text"
                    value={formData.bankCode}
                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ชื่อธนาคาร *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
              </div>

              {/* Daily Limit & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    วงเงินต่อวัน (บาท) *
                  </label>
                  <input
                    type="number"
                    value={formData.dailyLimit}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-200 mb-2">
                    ลำดับความสำคัญ
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* API Credentials (Optional) */}
              <div className="border-t border-admin-border pt-4">
                <h4 className="text-sm font-medium text-brown-200 mb-3">ข้อมูล API (ถ้ามี)</h4>

                {formData.bankType !== 'TRUEWALLET' ? (
                  <>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Username"
                        value={formData.apiUsername}
                        onChange={(e) => setFormData({ ...formData, apiUsername: e.target.value })}
                        className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={formData.apiPassword}
                        onChange={(e) => setFormData({ ...formData, apiPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                      <input
                        type="text"
                        placeholder="Device ID"
                        value={formData.deviceId}
                        onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                        className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="เบอร์โทรศัพท์"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-admin-bg border border-admin-border text-brown-100 rounded-lg hover:bg-admin-hover transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-brown-900 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  {editingAccount ? 'บันทึก' : 'เพิ่มบัญชี'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountsTab;
