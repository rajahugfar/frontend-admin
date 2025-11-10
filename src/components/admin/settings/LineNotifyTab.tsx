import React, { useState, useEffect } from 'react';
import { FiSave, FiBell, FiAlertCircle } from 'react-icons/fi';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface LineNotifySettings {
  siteNotifyAdmin: string;
  siteNotifyAdminPincode: string;
  siteNotifyAdminWithdraw: string;
}

const LineNotifyTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<LineNotifySettings>({
    siteNotifyAdmin: '',
    siteNotifyAdminPincode: '',
    siteNotifyAdminWithdraw: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data.success && response.data.data) {
        const grouped = response.data.data;
        setSettings({
          siteNotifyAdmin: grouped.notification?.site_notify_admin || '',
          siteNotifyAdminPincode: grouped.notification?.site_notify_admin_pincode || '',
          siteNotifyAdminWithdraw: grouped.notification?.site_notify_admin_withdraw || '',
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
      const updates = {
        site_notify_admin: settings.siteNotifyAdmin,
        site_notify_admin_pincode: settings.siteNotifyAdminPincode,
        site_notify_admin_withdraw: settings.siteNotifyAdminWithdraw,
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
      {/* Info Alert */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-100">
          <p className="font-medium mb-1">วิธีการรับ Line Notify Token:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-200">
            <li>เข้า <a href="https://notify-bot.line.me/my/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://notify-bot.line.me/my/</a></li>
            <li>คลิก "Generate token"</li>
            <li>ตั้งชื่อและเลือกกลุ่มที่ต้องการรับการแจ้งเตือน</li>
            <li>คัดลอก Token มาวางในช่องด้านล่าง</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Admin Notify Token */}
        <div className="bg-admin-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-gold-500" />
            <h2 className="text-xl font-bold text-gold-500">Line Notify Token (Admin)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Token สำหรับแจ้งเตือนทั่วไป</label>
              <input
                type="text"
                value={settings.siteNotifyAdmin}
                onChange={(e) => setSettings({ ...settings, siteNotifyAdmin: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
                placeholder="ใส่ Line Notify Token"
              />
              <p className="text-xs text-brown-400 mt-1">ใช้สำหรับแจ้งเตือนทั่วไป เช่น สมัครสมาชิกใหม่, ฝากเงิน</p>
            </div>
          </div>
        </div>

        {/* Pincode Notify Token */}
        <div className="bg-admin-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-purple-400">Line Notify Token (Pincode)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Token สำหรับแจ้งเตือน Pincode</label>
              <input
                type="text"
                value={settings.siteNotifyAdminPincode}
                onChange={(e) => setSettings({ ...settings, siteNotifyAdminPincode: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
                placeholder="ใส่ Line Notify Token"
              />
              <p className="text-xs text-brown-400 mt-1">ใช้สำหรับแจ้งเตือนเมื่อมีการใช้ Pincode</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Notify Token */}
        <div className="bg-admin-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-red-400">Line Notify Token (Withdrawal)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Token สำหรับแจ้งเตือนการถอนเงิน</label>
              <input
                type="text"
                value={settings.siteNotifyAdminWithdraw}
                onChange={(e) => setSettings({ ...settings, siteNotifyAdminWithdraw: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
                placeholder="ใส่ Line Notify Token"
              />
              <p className="text-xs text-brown-400 mt-1">ใช้สำหรับแจ้งเตือนเมื่อมีรายการถอนเงินใหม่</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-admin-dark px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave className="w-5 h-5" />
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  );
};

export default LineNotifyTab;
