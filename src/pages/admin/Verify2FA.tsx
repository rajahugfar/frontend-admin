import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShield, FiArrowLeft } from 'react-icons/fi';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function Verify2FA() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Get admin_id from location state (passed from login)
  const adminId = location.state?.adminId;

  useEffect(() => {
    // If no adminId, redirect to login
    if (!adminId) {
      navigate('/admin/login');
    }
  }, [adminId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error('กรุณาใส่รหัสยืนยัน');
      return;
    }

    if (!useBackupCode && code.length !== 6) {
      toast.error('กรุณาใส่รหัส 6 หลัก');
      return;
    }

    try {
      setLoading(true);
      
      // Store adminId in localStorage temporarily for validation
      localStorage.setItem('temp_admin_id', adminId);
      
      const response = await apiClient.post('/2fa/validate', { code });

      if (response.data.success) {
        // Clear temp adminId
        localStorage.removeItem('temp_admin_id');
        
        // Complete login process
        toast.success('ยืนยันตัวตนสำเร็จ!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'รหัสไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-bg via-brown-900 to-admin-bg flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxOTYsMTY5LDk4LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      {/* 2FA Card */}
      <div className="relative w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 via-gold-600 to-brown-500 rounded-2xl blur-xl opacity-30 animate-pulse" />

        <div className="relative bg-admin-card border border-admin-border rounded-2xl shadow-2xl p-8">
          {/* Back Button */}
          <button
            onClick={handleBackToLogin}
            className="absolute top-4 left-4 p-2 text-brown-400 hover:text-gold-500 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full mb-4 shadow-lg">
              <FiShield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gold-500 mb-2">
              ยืนยันตัวตน
            </h1>
            <p className="text-brown-300 text-sm">
              {useBackupCode 
                ? 'ใส่รหัสสำรอง (Backup Code)'
                : 'ใส่รหัส 6 หลักจากแอป Authenticator'}
            </p>
          </div>

          {/* 2FA Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <input
                type="text"
                maxLength={useBackupCode ? 9 : 6}
                value={code}
                onChange={(e) => {
                  const value = useBackupCode 
                    ? e.target.value.toUpperCase()
                    : e.target.value.replace(/\D/g, '');
                  setCode(value);
                }}
                className="block w-full px-4 py-4 bg-admin-bg border border-admin-border rounded-lg text-center text-2xl font-mono text-gold-400 placeholder-brown-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all tracking-widest"
                placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !code}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังยืนยัน...
                </div>
              ) : (
                'ยืนยันตัวตน'
              )}
            </button>

            {/* Toggle Backup Code */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode('');
                }}
                className="text-sm text-brown-400 hover:text-gold-500 transition-colors"
              >
                {useBackupCode 
                  ? 'ใช้รหัสจากแอป Authenticator'
                  : 'ใช้รหัสสำรอง (Backup Code)'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-200">
              💡 <strong>เคล็ดลับ:</strong> รหัสจะเปลี่ยนทุก 30 วินาที 
              {useBackupCode && ' หรือใช้รหัสสำรองที่ได้รับตอนตั้งค่า 2FA'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
