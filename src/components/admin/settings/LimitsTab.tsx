import React, { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';
import { LimitSettings } from '../../../types/settings';

const LimitsTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<LimitSettings>({
    statusWithdraw: true,
    turnOver: 1,
    perdayWithdraw: 3,
    maxWithdraw: 50000,
    maxAutoWithdraw: 20000,
    statusPincodeWithdraw: false,
    notifyAdminWithdraw: '',
    forceAllWithdrawals: false,
    statusKbankWithdraw: false,
    cashbackEnable: false,
    cashbackPercent: 5,
    cashbackTimeStart: 0,
    cashbackTimeEnd: 23,
    cashbackTurnover: false,
    ambAuthToken: '',
    ambAuthTokenSeamless: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data.success && response.data.data) {
        const grouped = response.data.data;
        // Map grouped settings to flat structure
        setSettings({
          statusWithdraw: grouped.withdrawal?.status_withdraw || true,
          turnOver: grouped.withdrawal?.site_turn_over || 1,
          perdayWithdraw: grouped.withdrawal?.site_perday_withdraw || 3,
          maxWithdraw: grouped.withdrawal?.site_max_withdraw || 50000,
          maxAutoWithdraw: grouped.withdrawal?.site_max_auto_withdraw || 20000,
          statusPincodeWithdraw: grouped.withdrawal?.site_status_pincode_withdraw || false,
          notifyAdminWithdraw: grouped.notification?.site_notify_admin_withdraw || '',
          forceAllWithdrawals: grouped.withdrawal?.site_force_all_withdrawals || false,
          statusKbankWithdraw: grouped.withdrawal?.site_status_kbank_withdraw || false,
          cashbackEnable: grouped.cashback?.site_cashback_enable || false,
          cashbackPercent: grouped.cashback?.site_cashback_percent || 5,
          cashbackTimeStart: grouped.cashback?.site_cashback_time_start || 0,
          cashbackTimeEnd: grouped.cashback?.site_cashback_time_end || 23,
          cashbackTurnover: grouped.cashback?.site_cashback_turnover || false,
          ambAuthToken: grouped.integration?.site_amb_auth_token || '',
          ambAuthTokenSeamless: grouped.integration?.site_amb_auth_token_seamless || '',
        });
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Convert to key-value format for API
      const updates = {
        status_withdraw: settings.statusWithdraw ? 'true' : 'false',
        site_turn_over: settings.turnOver.toString(),
        site_perday_withdraw: settings.perdayWithdraw.toString(),
        site_max_withdraw: settings.maxWithdraw.toString(),
        site_max_auto_withdraw: settings.maxAutoWithdraw.toString(),
        site_status_pincode_withdraw: settings.statusPincodeWithdraw ? 'true' : 'false',
        site_notify_admin_withdraw: settings.notifyAdminWithdraw,
        site_force_all_withdrawals: settings.forceAllWithdrawals ? 'true' : 'false',
        site_status_kbank_withdraw: settings.statusKbankWithdraw ? 'true' : 'false',
        site_cashback_enable: settings.cashbackEnable ? 'true' : 'false',
        site_cashback_percent: settings.cashbackPercent.toString(),
        site_cashback_time_start: settings.cashbackTimeStart.toString(),
        site_cashback_time_end: settings.cashbackTimeEnd.toString(),
        site_cashback_turnover: settings.cashbackTurnover ? 'true' : 'false',
        site_amb_auth_token: settings.ambAuthToken,
        site_amb_auth_token_seamless: settings.ambAuthTokenSeamless,
      };
      
      const response = await apiClient.put('/settings', updates);
      if (response.data.success) {
        toast.success('บันทึกข้อมูลสำเร็จ');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">ตั้งค่ารายการถอน</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="statusWithdraw"
                checked={settings.statusWithdraw}
                onChange={(e) => setSettings({ ...settings, statusWithdraw: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="statusWithdraw" className="text-brown-100">เปิด/ปิดการถอนเงิน</label>
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Turn Over</label>
              <input
                type="number"
                step="0.1"
                value={settings.turnOver}
                onChange={(e) => setSettings({ ...settings, turnOver: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">จำนวนครั้งถอนต่อวัน</label>
              <input
                type="number"
                value={settings.perdayWithdraw}
                onChange={(e) => setSettings({ ...settings, perdayWithdraw: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">ถอนเงินสูงสุดต่อครั้ง</label>
              <input
                type="number"
                value={settings.maxWithdraw}
                onChange={(e) => setSettings({ ...settings, maxWithdraw: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">ถอนเงินสูงสุดต่อครั้ง (AUTO)</label>
              <input
                type="number"
                value={settings.maxAutoWithdraw}
                onChange={(e) => setSettings({ ...settings, maxAutoWithdraw: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="statusPincodeWithdraw"
                checked={settings.statusPincodeWithdraw}
                onChange={(e) => setSettings({ ...settings, statusPincodeWithdraw: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="statusPincodeWithdraw" className="text-brown-100">ยืนยันรหัสรายการถอน</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="forceAllWithdrawals"
                checked={settings.forceAllWithdrawals}
                onChange={(e) => setSettings({ ...settings, forceAllWithdrawals: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="forceAllWithdrawals" className="text-brown-100">บังคับถอนทั้งหมด</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="statusKbankWithdraw"
                checked={settings.statusKbankWithdraw}
                onChange={(e) => setSettings({ ...settings, statusKbankWithdraw: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="statusKbankWithdraw" className="text-brown-100">บังคับถอนเป็น KBANK</label>
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Line Notify แจ้งเตือนถอนเงิน</label>
              <input
                type="text"
                value={settings.notifyAdminWithdraw}
                onChange={(e) => setSettings({ ...settings, notifyAdminWithdraw: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cashback Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">ตั้งค่าคืนยอดเสีย</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="cashbackEnable"
                checked={settings.cashbackEnable}
                onChange={(e) => setSettings({ ...settings, cashbackEnable: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="cashbackEnable" className="text-brown-100">เปิด/ปิด คืนยอดเสีย</label>
            </div>

            <div>
              <label className="block text-brown-100 mb-2">คืนยอดเสีย %</label>
              <input
                type="number"
                step="0.1"
                value={settings.cashbackPercent}
                onChange={(e) => setSettings({ ...settings, cashbackPercent: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">เวลาเริ่มต้น (ชั่วโมง)</label>
              <select
                value={settings.cashbackTimeStart}
                onChange={(e) => setSettings({ ...settings, cashbackTimeStart: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-brown-100 mb-2">เวลาสิ้นสุด (ชั่วโมง)</label>
              <select
                value={settings.cashbackTimeEnd}
                onChange={(e) => setSettings({ ...settings, cashbackTimeEnd: Number(e.target.value) })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="cashbackTurnover"
                checked={settings.cashbackTurnover}
                onChange={(e) => setSettings({ ...settings, cashbackTurnover: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="cashbackTurnover" className="text-brown-100">ถอน Cashback แบบติดโปร</label>
            </div>
          </div>
        </div>

        {/* AMB Token Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">AMB TOKEN</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Auth Token AMB Transfer</label>
              <input
                type="text"
                value={settings.ambAuthToken}
                onChange={(e) => setSettings({ ...settings, ambAuthToken: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Auth Token AMB Seamless</label>
              <input
                type="text"
                value={settings.ambAuthTokenSeamless}
                onChange={(e) => setSettings({ ...settings, ambAuthTokenSeamless: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-admin-dark px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <FiSave className="w-5 h-5" />
          {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    </div>
  );
};

export default LimitsTab;
