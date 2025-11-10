import React, { useState, useEffect } from 'react';
import { FiSave, FiImage, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';
import { SystemSettings } from '../../../types/settings';
import ImageUploadModal from '../ImageUploadModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SystemTab: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTarget, setImageTarget] = useState<'logo' | 'banner1' | 'banner2' | 'banner3' | 'qrcode'>('logo');
  const [twoFAStatus, setTwoFAStatus] = useState<{ enabled: boolean; verified_at: string | null; backup_codes_count: number } | null>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: '',
    siteLogo: '',
    siteLine: '',
    siteLineQrcode: '',
    siteNotifyAdmin: '',
    siteAlert: false,
    siteAlertDescription: '',
    siteAdmin2faEnable: false,
    siteAdmin2faMethod: 'totp',
    siteStatusPincode: false,
    siteNotifyAdminPincode: '',
    siteBanner1: '',
    siteBanner2: '',
    siteBanner3: '',
    siteAffStep: 1,
    siteAffPercent: 0,
    siteAffType: 1,
    siteAffMinWithdraw: 100,
    siteAffPromotion: false,
  });

  useEffect(() => {
    loadSettings();
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await apiClient.get('/2fa/status');
      if (response.data.success) {
        setTwoFAStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data.success && response.data.data) {
        const grouped = response.data.data;
        // Map grouped settings to flat structure
        setSettings({
          siteName: grouped.general?.site_name || '',
          siteLogo: grouped.general?.site_logo || '',
          siteLine: grouped.contact?.site_line || '',
          siteLineQrcode: grouped.contact?.site_line_qrcode || '',
          siteNotifyAdmin: grouped.notification?.site_notify_admin || '',
          siteAlert: grouped.general?.site_alert || false,
          siteAlertDescription: grouped.general?.site_alert_description || '',
          siteAdmin2faEnable: grouped.security?.site_admin_2fa_enable || false,
          siteAdmin2faMethod: grouped.security?.site_admin_2fa_method || 'totp',
          siteStatusPincode: grouped.security?.site_status_pincode || false,
          siteNotifyAdminPincode: grouped.notification?.site_notify_admin_pincode || '',
          siteBanner1: grouped.banner?.site_banner1 || '',
          siteBanner2: grouped.banner?.site_banner2 || '',
          siteBanner3: grouped.banner?.site_banner3 || '',
          siteAffStep: grouped.referral?.site_aff_step || 3,
          siteAffPercent: grouped.referral?.site_aff_percent || '',
          siteAffType: grouped.referral?.site_aff_type || 'turnover',
          siteAffMinWithdraw: grouped.referral?.site_aff_min_withdraw || 100,
          siteAffPromotion: grouped.referral?.site_aff_promotion || false,
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
        site_name: settings.siteName,
        site_logo: settings.siteLogo,
        site_line: settings.siteLine,
        site_line_qrcode: settings.siteLineQrcode,
        site_notify_admin: settings.siteNotifyAdmin,
        site_alert: settings.siteAlert ? 'true' : 'false',
        site_alert_description: settings.siteAlertDescription,
        site_admin_2fa_enable: settings.siteAdmin2faEnable ? 'true' : 'false',
        site_admin_2fa_method: settings.siteAdmin2faMethod,
        site_status_pincode: settings.siteStatusPincode ? 'true' : 'false',
        site_notify_admin_pincode: settings.siteNotifyAdminPincode,
        site_banner1: settings.siteBanner1,
        site_banner2: settings.siteBanner2,
        site_banner3: settings.siteBanner3,
        site_aff_step: settings.siteAffStep.toString(),
        site_aff_percent: settings.siteAffPercent,
        site_aff_type: settings.siteAffType,
        site_aff_min_withdraw: settings.siteAffMinWithdraw.toString(),
        site_aff_promotion: settings.siteAffPromotion ? 'true' : 'false',
      };
      
      const response = await apiClient.put('/settings', updates);
      if (response.data.success) {
        toast.success('บันทึกข้อมูลสำเร็จ');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">ตั้งค่าเว็บเบื้องต้น</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">ชื่อเว็บ</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="input"
                placeholder="ชื่อเว็บไซต์"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Logo</label>
              <button
                type="button"
                onClick={() => {
                  setImageTarget('logo');
                  setShowImageModal(true);
                }}
                className="w-full px-4 py-3 border-2 border-dashed border-brown-700 rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
              >
                <FiImage />
                <span>{settings.siteLogo ? 'เปลี่ยน Logo' : 'เลือก Logo'}</span>
              </button>
              {settings.siteLogo && (
                <div className="mt-2">
                  <img
                    src={settings.siteLogo.startsWith('http') ? settings.siteLogo : `${API_URL}${settings.siteLogo}`}
                    alt="Logo"
                    className="h-16 object-contain bg-white/5 rounded p-2"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-brown-100 mb-2">ลิ้งค์ไลน์</label>
              <input
                type="text"
                value={settings.siteLine}
                onChange={(e) => setSettings({ ...settings, siteLine: e.target.value })}
                className="input"
                placeholder="https://line.me/..."
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">QR Code ไลน์</label>
              <button
                type="button"
                onClick={() => {
                  setImageTarget('qrcode');
                  setShowImageModal(true);
                }}
                className="w-full px-4 py-3 border-2 border-dashed border-brown-700 rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
              >
                <FiImage />
                <span>{settings.siteLineQrcode ? 'เปลี่ยน QR Code' : 'เลือก QR Code'}</span>
              </button>
              {settings.siteLineQrcode && (
                <div className="mt-2">
                  <img
                    src={settings.siteLineQrcode.startsWith('http') ? settings.siteLineQrcode : `${API_URL}${settings.siteLineQrcode}`}
                    alt="Line QR Code"
                    className="w-32 h-32 object-contain bg-white/5 rounded p-2"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-brown-100 mb-2">แจ้งเตือนหน้า Member</label>
              <textarea
                value={settings.siteAlertDescription}
                onChange={(e) => setSettings({ ...settings, siteAlertDescription: e.target.value })}
                className="input"
                rows={3}
                placeholder="ข้อความแจ้งเตือน"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="siteAlert"
                checked={settings.siteAlert}
                onChange={(e) => setSettings({ ...settings, siteAlert: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="siteAlert" className="text-brown-100">เปิดใช้งานแจ้งเตือนหน้า Member</label>
            </div>
          </div>
        </div>

        {/* Banner Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">ตั้งค่า Banner</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">Banner ช่องที่ 1</label>
              <button
                type="button"
                onClick={() => {
                  setImageTarget('banner1');
                  setShowImageModal(true);
                }}
                className="w-full px-4 py-3 border-2 border-dashed border-brown-700 rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
              >
                <FiImage />
                <span>{settings.siteBanner1 ? 'เปลี่ยน Banner 1' : 'เลือก Banner 1'}</span>
              </button>
              {settings.siteBanner1 && (
                <div className="mt-2">
                  <img
                    src={settings.siteBanner1.startsWith('http') ? settings.siteBanner1 : `${API_URL}${settings.siteBanner1}`}
                    alt="Banner 1"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Banner ช่องที่ 2</label>
              <button
                type="button"
                onClick={() => {
                  setImageTarget('banner2');
                  setShowImageModal(true);
                }}
                className="w-full px-4 py-3 border-2 border-dashed border-brown-700 rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
              >
                <FiImage />
                <span>{settings.siteBanner2 ? 'เปลี่ยน Banner 2' : 'เลือก Banner 2'}</span>
              </button>
              {settings.siteBanner2 && (
                <div className="mt-2">
                  <img
                    src={settings.siteBanner2.startsWith('http') ? settings.siteBanner2 : `${API_URL}${settings.siteBanner2}`}
                    alt="Banner 2"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Banner ช่องที่ 3</label>
              <button
                type="button"
                onClick={() => {
                  setImageTarget('banner3');
                  setShowImageModal(true);
                }}
                className="w-full px-4 py-3 border-2 border-dashed border-brown-700 rounded-lg hover:border-gold-500 transition-colors flex items-center justify-center gap-2 text-brown-400 hover:text-gold-500"
              >
                <FiImage />
                <span>{settings.siteBanner3 ? 'เปลี่ยน Banner 3' : 'เลือก Banner 3'}</span>
              </button>
              {settings.siteBanner3 && (
                <div className="mt-2">
                  <img
                    src={settings.siteBanner3.startsWith('http') ? settings.siteBanner3 : `${API_URL}${settings.siteBanner3}`}
                    alt="Banner 3"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">ตั้งค่าความปลอดภัย</h2>
          
          <div className="space-y-4">
            {/* 2FA for Admin */}
            <div className="bg-admin-dark/50 rounded-lg p-4 border border-brown-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiShield className="w-6 h-6 text-gold-400" />
                  <h3 className="text-lg font-semibold text-gold-400">2FA สำหรับ Admin</h3>
                </div>
                {twoFAStatus?.enabled && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>เปิดใช้งานแล้ว</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {twoFAStatus?.enabled ? (
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-200 text-sm mb-2">
                        ✓ บัญชีของคุณได้รับการปกป้องด้วย 2FA แล้ว
                      </p>
                      {twoFAStatus.verified_at && (
                        <p className="text-green-300 text-xs">
                          เปิดใช้งานเมื่อ: {new Date(twoFAStatus.verified_at).toLocaleString('th-TH')}
                        </p>
                      )}
                      {twoFAStatus.backup_codes_count > 0 && (
                        <p className="text-green-300 text-xs">
                          รหัสสำรองคงเหลือ: {twoFAStatus.backup_codes_count} รหัส
                        </p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('คุณต้องการปิดการใช้งาน 2FA หรือไม่?')) {
                          // TODO: Implement disable 2FA
                          toast('ฟีเจอร์นี้กำลังพัฒนา');
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      ปิดการใช้งาน 2FA
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm">
                        ⚠️ เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วย Two-Factor Authentication
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="admin2faEnable"
                        checked={settings.siteAdmin2faEnable}
                        onChange={(e) => setSettings({ ...settings, siteAdmin2faEnable: e.target.checked })}
                        className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
                      />
                      <label htmlFor="admin2faEnable" className="text-brown-100">เปิดใช้งาน 2FA ในระบบ</label>
                    </div>

                    {settings.siteAdmin2faEnable && (
                      <>
                        <div>
                          <label className="block text-brown-100 mb-2">วิธีการยืนยันตัวตน</label>
                          <select
                            value={settings.siteAdmin2faMethod}
                            onChange={(e) => setSettings({ ...settings, siteAdmin2faMethod: e.target.value })}
                            className="input"
                          >
                            <option value="totp">TOTP (Google Authenticator)</option>
                            <option value="email">Email OTP</option>
                          </select>
                          <p className="text-xs text-brown-400 mt-1">
                            {settings.siteAdmin2faMethod === 'totp' 
                              ? 'ใช้ Google Authenticator หรือ Authy สำหรับสร้าง OTP'
                              : 'ส่งรหัส OTP ไปยังอีเมลของ Admin'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate('/admin/setup-2fa')}
                          className="w-full px-4 py-3 bg-gold-500 hover:bg-gold-600 text-admin-dark rounded-lg font-medium transition-colors"
                        >
                          ตั้งค่า 2FA สำหรับบัญชีของคุณ
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pincode for Member */}
            <div className="bg-admin-dark/50 rounded-lg p-4 border border-brown-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Pincode สำหรับสมาชิก</h3>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="statusPincode"
                  checked={settings.siteStatusPincode}
                  onChange={(e) => setSettings({ ...settings, siteStatusPincode: e.target.checked })}
                  className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="statusPincode" className="text-brown-100">เปิดใช้งาน Pincode ฝาก-ถอน</label>
              </div>
            </div>

            <div>
              <label className="block text-brown-100 mb-2">Line Notify Token (Pincode)</label>
              <input
                type="text"
                value={settings.siteNotifyAdminPincode}
                onChange={(e) => setSettings({ ...settings, siteNotifyAdminPincode: e.target.value })}
                className="input"
                placeholder="Line Token สำหรับแจ้งเตือน Pincode"
              />
            </div>
          </div>
        </div>

        {/* Referral Settings */}
        <div className="bg-admin-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-500 mb-4">ตั้งค่าชวนเพื่อน</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-brown-100 mb-2">จำนวนชั้น</label>
              <input
                type="number"
                value={settings.siteAffStep}
                onChange={(e) => setSettings({ ...settings, siteAffStep: parseInt(e.target.value) || 1 })}
                className="input"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">เปอร์เซ็นต์</label>
              <input
                type="number"
                value={settings.siteAffPercent}
                onChange={(e) => setSettings({ ...settings, siteAffPercent: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="0.5"
              />
            </div>

            <div>
              <label className="block text-brown-100 mb-2">ประเภทการคำนวณ</label>
              <select
                value={settings.siteAffType}
                onChange={(e) => setSettings({ ...settings, siteAffType: parseInt(e.target.value) })}
                className="input"
              >
                <option value={1}>Turnover</option>
                <option value={2}>Win/Loss</option>
              </select>
            </div>

            <div>
              <label className="block text-brown-100 mb-2">ถอนขั้นต่ำ</label>
              <input
                type="number"
                value={settings.siteAffMinWithdraw}
                onChange={(e) => setSettings({ ...settings, siteAffMinWithdraw: parseFloat(e.target.value) || 100 })}
                className="input"
                placeholder="100"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="affPromotion"
                checked={settings.siteAffPromotion}
                onChange={(e) => setSettings({ ...settings, siteAffPromotion: e.target.checked })}
                className="w-5 h-5 rounded border-brown-700 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="affPromotion" className="text-brown-100">ถอนค่าแนะนำแบบติดโปร</label>
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

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelect={(image) => {
          const imageUrl = image.url;
          switch (imageTarget) {
            case 'logo':
              setSettings({ ...settings, siteLogo: imageUrl });
              break;
            case 'banner1':
              setSettings({ ...settings, siteBanner1: imageUrl });
              break;
            case 'banner2':
              setSettings({ ...settings, siteBanner2: imageUrl });
              break;
            case 'banner3':
              setSettings({ ...settings, siteBanner3: imageUrl });
              break;
            case 'qrcode':
              setSettings({ ...settings, siteLineQrcode: imageUrl });
              break;
          }
          setShowImageModal(false);
        }}
        currentImage={
          imageTarget === 'logo' ? settings.siteLogo :
          imageTarget === 'banner1' ? settings.siteBanner1 :
          imageTarget === 'banner2' ? settings.siteBanner2 :
          imageTarget === 'banner3' ? settings.siteBanner3 :
          settings.siteLineQrcode
        }
      />
    </div>
  );
};

export default SystemTab;
