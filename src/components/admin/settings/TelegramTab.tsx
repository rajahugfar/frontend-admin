import React, { useState, useEffect } from 'react';
import { FiSave, FiSend, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface TelegramSettings {
  siteTelegramBotToken: string;
  siteTelegramChatId: string;
  siteTelegramChatIdDeposit: string;
  siteTelegramChatIdWithdraw: string;
  siteTelegramEnable: boolean;
}

const TelegramTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<TelegramSettings>({
    siteTelegramBotToken: '',
    siteTelegramChatId: '',
    siteTelegramChatIdDeposit: '',
    siteTelegramChatIdWithdraw: '',
    siteTelegramEnable: false,
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
          siteTelegramBotToken: grouped.telegram?.site_telegram_bot_token || '',
          siteTelegramChatId: grouped.telegram?.site_telegram_chat_id || '',
          siteTelegramChatIdDeposit: grouped.telegram?.site_telegram_chat_id_deposit || '',
          siteTelegramChatIdWithdraw: grouped.telegram?.site_telegram_chat_id_withdraw || '',
          siteTelegramEnable: grouped.telegram?.site_telegram_enable || false,
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
        site_telegram_bot_token: settings.siteTelegramBotToken,
        site_telegram_chat_id: settings.siteTelegramChatId,
        site_telegram_chat_id_deposit: settings.siteTelegramChatIdDeposit,
        site_telegram_chat_id_withdraw: settings.siteTelegramChatIdWithdraw,
        site_telegram_enable: settings.siteTelegramEnable ? 'true' : 'false',
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
          <p className="font-medium mb-1">วิธีการสร้าง Telegram Bot:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-200">
            <li>ค้นหา <code className="bg-blue-900/30 px-1 rounded">@BotFather</code> ใน Telegram</li>
            <li>ส่งคำสั่ง <code className="bg-blue-900/30 px-1 rounded">/newbot</code></li>
            <li>ตั้งชื่อ Bot และ Username</li>
            <li>คัดลอก Bot Token มาวางด้านล่าง</li>
            <li>เพิ่ม Bot เข้ากลุ่มที่ต้องการรับการแจ้งเตือน</li>
            <li>ดู Chat ID ได้จาก <a href="https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">getUpdates API</a></li>
          </ol>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-admin-card rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-6 h-6 text-gold-500" />
            <div>
              <h3 className="text-lg font-bold text-gold-500">เปิดใช้งาน Telegram</h3>
              <p className="text-sm text-brown-300">เปิด/ปิดการแจ้งเตือนผ่าน Telegram</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.siteTelegramEnable}
              onChange={(e) => setSettings({ ...settings, siteTelegramEnable: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-brown-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold-500"></div>
          </label>
        </div>
      </div>

      {/* Bot Token */}
      <div className="bg-admin-card rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiSend className="w-5 h-5 text-gold-500" />
          <h2 className="text-xl font-bold text-gold-500">Telegram Bot Token</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-brown-100 mb-2">Bot Token</label>
            <input
              type="text"
              value={settings.siteTelegramBotToken}
              onChange={(e) => setSettings({ ...settings, siteTelegramBotToken: e.target.value })}
              className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            />
            <p className="text-xs text-brown-400 mt-1">Token ที่ได้จาก @BotFather</p>
          </div>
        </div>
      </div>

      {/* Chat IDs */}
      <div className="grid grid-cols-1 gap-6">
        {/* Admin Chat ID */}
        <div className="bg-admin-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiSend className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-purple-400">Chat ID (Admin)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Chat ID สำหรับแจ้งเตือนทั่วไป</label>
              <input
                type="text"
                value={settings.siteTelegramChatId}
                onChange={(e) => setSettings({ ...settings, siteTelegramChatId: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
                placeholder="-1001234567890"
              />
              <p className="text-xs text-brown-400 mt-1">ใช้สำหรับแจ้งเตือนทั่วไป เช่น สมัครสมาชิกใหม่</p>
            </div>
          </div>
        </div>

        {/* Deposit Chat ID */}
        <div className="bg-admin-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiSend className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-green-400">Chat ID (Deposit)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Chat ID สำหรับแจ้งเตือนฝากเงิน</label>
              <input
                type="text"
                value={settings.siteTelegramChatIdDeposit}
                onChange={(e) => setSettings({ ...settings, siteTelegramChatIdDeposit: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
                placeholder="-1001234567890"
              />
              <p className="text-xs text-brown-400 mt-1">ใช้สำหรับแจ้งเตือนเมื่อมีรายการฝากเงินใหม่</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Chat ID */}
        <div className="bg-admin-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiSend className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-red-400">Chat ID (Withdrawal)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Chat ID สำหรับแจ้งเตือนถอนเงิน</label>
              <input
                type="text"
                value={settings.siteTelegramChatIdWithdraw}
                onChange={(e) => setSettings({ ...settings, siteTelegramChatIdWithdraw: e.target.value })}
                className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-2 text-brown-100 focus:border-gold-500 focus:outline-none font-mono text-sm"
                placeholder="-1001234567890"
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

export default TelegramTab;
