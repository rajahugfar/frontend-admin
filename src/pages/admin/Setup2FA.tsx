import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiCopy, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface Setup2FAResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

const Setup2FA = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCodeData, setQrCodeData] = useState<Setup2FAResponse | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<number[]>([]);

  useEffect(() => {
    setup2FA();
  }, []);

  const setup2FA = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/2fa/setup');
      
      if (response.data.success) {
        const data: Setup2FAResponse = response.data.data;
        setQrCodeData(data);
        
        // Generate QR Code image
        const qrImage = await QRCode.toDataURL(data.qr_code_url);
        setQrCodeImage(qrImage);
        
        setStep('verify');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถสร้าง 2FA ได้');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('กรุณาใส่รหัส 6 หลัก');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/2fa/verify', {
        code: verificationCode,
        secret: qrCodeData?.secret,
      });

      if (response.data.success) {
        toast.success('เปิดใช้งาน 2FA สำเร็จ!');
        setStep('complete');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'รหัสไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | number) => {
    navigator.clipboard.writeText(text);
    
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes([...copiedCodes, type]);
      setTimeout(() => {
        setCopiedCodes(copiedCodes.filter(c => c !== type));
      }, 2000);
    }
    
    toast.success('คัดลอกแล้ว!');
  };

  const handleComplete = () => {
    navigate('/admin/settings');
  };

  if (loading && step === 'setup') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-dark p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-500/20 rounded-full mb-4">
            <FiShield className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-3xl font-bold text-gold-500 mb-2">
            ตั้งค่า Two-Factor Authentication
          </h1>
          <p className="text-brown-300">
            เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วย 2FA
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'setup' ? 'text-gold-500' : 'text-green-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'setup' ? 'bg-gold-500/20' : 'bg-green-500/20'}`}>
                {step === 'setup' ? '1' : <FiCheck />}
              </div>
              <span className="font-medium">สร้าง QR Code</span>
            </div>
            
            <div className="w-16 h-0.5 bg-brown-700"></div>
            
            <div className={`flex items-center gap-2 ${step === 'verify' ? 'text-gold-500' : step === 'complete' ? 'text-green-500' : 'text-brown-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verify' ? 'bg-gold-500/20' : step === 'complete' ? 'bg-green-500/20' : 'bg-brown-700'}`}>
                {step === 'complete' ? <FiCheck /> : '2'}
              </div>
              <span className="font-medium">ยืนยัน OTP</span>
            </div>
            
            <div className="w-16 h-0.5 bg-brown-700"></div>
            
            <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-green-500' : 'text-brown-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-green-500/20' : 'bg-brown-700'}`}>
                {step === 'complete' ? <FiCheck /> : '3'}
              </div>
              <span className="font-medium">เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        {/* Step: Verify */}
        {step === 'verify' && qrCodeData && (
          <div className="bg-admin-card rounded-lg p-8 border border-brown-700">
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gold-500 mb-4">
                  1. Scan QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  {qrCodeImage && (
                    <img src={qrCodeImage} alt="QR Code" className="w-48 h-48" />
                  )}
                </div>
                <p className="text-sm text-brown-300">
                  ใช้แอป Google Authenticator หรือ Authy
                </p>
              </div>

              {/* Manual Entry */}
              <div>
                <h3 className="text-xl font-bold text-gold-500 mb-4">
                  2. หรือใส่รหัสด้วยตนเอง
                </h3>
                <div className="bg-admin-dark rounded-lg p-4 mb-4">
                  <p className="text-xs text-brown-400 mb-2">Secret Key:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-gold-400 font-mono text-sm break-all">
                      {qrCodeData.secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(qrCodeData.secret, 'secret')}
                      className="p-2 hover:bg-brown-700 rounded transition-colors"
                    >
                      {copiedSecret ? (
                        <FiCheck className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiCopy className="w-5 h-5 text-brown-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Code Input */}
                <h3 className="text-xl font-bold text-gold-500 mb-4">
                  3. ใส่รหัส 6 หลัก
                </h3>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-admin-dark border border-brown-700 rounded-lg px-4 py-3 text-center text-2xl font-mono text-gold-400 focus:border-gold-500 focus:outline-none tracking-widest"
                  placeholder="000000"
                />
                
                <button
                  onClick={verify2FA}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full mt-4 bg-gold-500 hover:bg-gold-600 text-admin-dark px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังยืนยัน...' : 'ยืนยันและเปิดใช้งาน'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && qrCodeData && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                เปิดใช้งาน 2FA สำเร็จ!
              </h2>
              <p className="text-green-200">
                บัญชีของคุณได้รับการปกป้องด้วย Two-Factor Authentication แล้ว
              </p>
            </div>

            {/* Backup Codes */}
            <div className="bg-admin-card rounded-lg p-6 border border-brown-700">
              <div className="flex items-start gap-3 mb-4">
                <FiAlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">
                    รหัสสำรอง (Backup Codes)
                  </h3>
                  <p className="text-yellow-200 text-sm mb-4">
                    เก็บรหัสเหล่านี้ไว้ในที่ปลอดภัย ใช้ในกรณีที่คุณไม่สามารถเข้าถึงแอป Authenticator ได้
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {qrCodeData.backup_codes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-admin-dark rounded-lg p-3 flex items-center justify-between"
                  >
                    <code className="text-gold-400 font-mono">{code}</code>
                    <button
                      onClick={() => copyToClipboard(code, index)}
                      className="p-1 hover:bg-brown-700 rounded transition-colors"
                    >
                      {copiedCodes.includes(index) ? (
                        <FiCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <FiCopy className="w-4 h-4 text-brown-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const allCodes = qrCodeData.backup_codes.join('\n');
                  copyToClipboard(allCodes, -1);
                }}
                className="w-full mt-4 bg-brown-700 hover:bg-brown-600 text-brown-100 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                คัดลอกทั้งหมด
              </button>
            </div>

            {/* Complete Button */}
            <button
              onClick={handleComplete}
              className="w-full bg-gold-500 hover:bg-gold-600 text-admin-dark px-6 py-3 rounded-lg font-medium transition-colors"
            >
              เสร็จสิ้น
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup2FA;
