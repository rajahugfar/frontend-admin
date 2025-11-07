import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminLotteryDailyAPI } from '../../../api/adminLotteryDailyAPI';

interface LotteryResultModalProps {
  isOpen: boolean;
  lottery: {
    stockId: number;
    stockName: string;
    lotteryGroup: number;
    huayCode: string;
    has4d?: boolean;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LotteryResultModal: React.FC<LotteryResultModalProps> = ({
  isOpen,
  lottery,
  onClose,
  onSuccess,
}) => {
  const [saving, setSaving] = useState(false);

  // Form fields
  const [stockWin1, setStockWin1] = useState(''); // เลขเต็ม 6 หลัก (GLO only)
  const [stockWin, setStockWin] = useState(''); // 3 ตัว
  const [g3Front, setG3Front] = useState(''); // 3 ตัวหน้า (GLO - รางวัลแยก - กรอกเป็นชุด)
  const [g3Down, setG3Down] = useState(''); // 3 ตัวหลัง (GLO - รางวัลแยก - กรอกเป็นชุด)
  const [g4Up, setG4Up] = useState(''); // 4 ตัว (ถ้า hauy4 = 1)
  const [stock2Up, setStock2Up] = useState(''); // 2 ตัวหน้า (auto from 3 ตัว)
  const [stock2Low, setStock2Low] = useState(''); // 2 ตัวล่าง

  useEffect(() => {
    if (isOpen && lottery) {
      // Reset form
      setStockWin1('');
      setStockWin('');
      setG3Front('');
      setG3Down('');
      setG4Up('');
      setStock2Up('');
      setStock2Low('');
    }
  }, [isOpen, lottery]);

  // Auto-fill 2 ตัวหน้า from 3 ตัว (เอา 2 หลักท้ายของ 3 ตัว)
  useEffect(() => {
    if (stockWin && stockWin.length === 3) {
      setStock2Up(stockWin.substring(1, 3)); // ตัด digit 0 ทิ้ง เอา digit 1,2
    }
  }, [stockWin]);

  // Auto-fill สามตัว และ สองตัวบน from 4 ตัว
  useEffect(() => {
    if (g4Up && g4Up.length === 4) {
      setStockWin(g4Up.substring(1, 4)); // ตัด digit 0 ทิ้ง = สามตัว
      setStock2Up(g4Up.substring(2, 4)); // ตัด digit 0,1 ทิ้ง = สองตัวบน
    }
  }, [g4Up]);

  const isGLO = () => {
    // GLO = เฉพาะ code "glo" เท่านั้น
    return lottery?.huayCode?.toLowerCase() === 'glo';
  };

  const is4Digit = () => {
    // Check if lottery needs 4-digit from has4d flag
    return lottery?.has4d === true;
  };

  const handleSubmit = async () => {
    if (!lottery) return;

    // Validation
    if (isGLO()) {
      if (!stockWin1 || stockWin1.length !== 6) {
        toast.error('กรุณากรอกเลขเต็ม 6 หลัก');
        return;
      }
      if (!g3Front || g3Front.trim() === '') {
        toast.error('กรุณากรอก 3 ตัวหน้า (รูปแบบ: 123,456)');
        return;
      }
      if (!g3Down || g3Down.trim() === '') {
        toast.error('กรุณากรอก 3 ตัวหลัง (รูปแบบ: 654,321)');
        return;
      }
    } else {
      if (!stockWin || stockWin.length !== 3) {
        toast.error('กรุณากรอก 3 ตัว');
        return;
      }
    }

    if (is4Digit() && (!g4Up || g4Up.length !== 4)) {
      toast.error('กรุณากรอก 4 ตัว');
      return;
    }

    if (!stock2Low || stock2Low.length !== 2) {
      toast.error('กรุณากรอก 2 ตัวล่าง');
      return;
    }

    try {
      setSaving(true);

      const payload: any = {
        stockId: lottery.stockId,
        stockWin: stockWin,
        stock2Up: stock2Up,
        stock2Low: stock2Low,
      };

      // GLO specific fields
      if (isGLO()) {
        payload.stockWin1 = stockWin1; // 6 หลัก
        payload.g3Front = g3Front; // 3 ตัวหน้า (ชุด)
        payload.g3Down = g3Down; // 3 ตัวหลัง (ชุด)
      }

      // 4 digit
      if (is4Digit() && g4Up) {
        payload.g4Up = g4Up;
      }

      await adminLotteryDailyAPI.saveResult(payload);
      toast.success('บันทึกผลหวยสำเร็จ');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save lottery result:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกผลหวยได้');
    } finally {
      setSaving(false);
    }
  };

  if (!lottery) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && onClose()}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-br from-admin-card via-admin-darker to-admin-card rounded-2xl border border-gold-500/30 shadow-2xl shadow-gold-500/20 max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-4 px-6 border-b border-gold-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiAward className="text-2xl text-brown-900" />
                  <div>
                    <h3 className="text-xl font-bold text-brown-900">กรอกผลหวย</h3>
                    <p className="text-brown-700 text-sm">{lottery.stockName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="p-2 hover:bg-brown-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiX className="text-xl text-brown-900" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                {/* GLO: เลขเต็ม 6 หลัก */}
                {isGLO() && (
                  <div>
                    <label className="block text-gold-400 font-semibold mb-2">
                      เลขเต็ม 6 หลัก <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={stockWin1}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 6) setStockWin1(value);
                      }}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white text-center text-2xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                      disabled={saving}
                    />
                    <p className="text-gray-400 text-xs mt-1 text-center">
                      รางวัลที่ 1 (6 หลัก)
                    </p>
                  </div>
                )}

                {/* GLO: 3 ตัวหน้า และ 3 ตัวหลัง (กรอกเป็นชุด) */}
                {isGLO() && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gold-400 font-semibold mb-2">
                        3 ตัวหน้า <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={g3Front}
                        onChange={(e) => setG3Front(e.target.value)}
                        placeholder="123,456"
                        className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white text-center text-lg font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                        disabled={saving}
                      />
                      <p className="text-gray-400 text-xs mt-1 text-center">
                        กรอกเป็นชุด เช่น 123,456
                      </p>
                    </div>

                    <div>
                      <label className="block text-gold-400 font-semibold mb-2">
                        3 ตัวหลัง <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={g3Down}
                        onChange={(e) => setG3Down(e.target.value)}
                        placeholder="654,321"
                        className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white text-center text-lg font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                        disabled={saving}
                      />
                      <p className="text-gray-400 text-xs mt-1 text-center">
                        กรอกเป็นชุด เช่น 654,321
                      </p>
                    </div>
                  </div>
                )}
                {/* 4 ตัว (ถ้ามี) */}
                {is4Digit() && (
                  <div>
                    <label className="block text-gold-400 font-semibold mb-2">
                      4 ตัวตรง <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={g4Up}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 4) setG4Up(value);
                      }}
                      placeholder="1234"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white text-center text-2xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                      disabled={saving}
                    />
                  </div>
                )}
                {/* หวยทั่วไป: 3 ตัว */}
                {!isGLO() && (
                  <div>
                    <label className="block text-gold-400 font-semibold mb-2">
                      3 ตัวบน <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={stockWin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 3) setStockWin(value);
                      }}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white text-center text-2xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                      disabled={saving}
                    />
                  </div>
                )}

                

                {/* 2 ตัวหน้า และ 2 ตัวหลัง */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gold-400 font-semibold mb-2">
                      2 ตัวหน้า
                    </label>
                    <input
                      type="text"
                      value={stock2Up}
                      readOnly
                      placeholder="12"
                      className="w-full px-4 py-3 bg-black/20 border-2 border-gold-500/20 rounded-xl text-gray-400 text-center text-xl font-bold placeholder-gray-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-gray-400 text-xs mt-1 text-center">
                      2 หลักท้ายของ 3 ตัวบน (อัตโนมัติ)
                    </p>
                  </div>

                  <div>
                    <label className="block text-gold-400 font-semibold mb-2">
                      2 ตัวล่าง <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={stock2Low}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 2) setStock2Low(value);
                      }}
                      placeholder="34"
                      maxLength={2}
                      className="w-full px-4 py-3 bg-black/40 border-2 border-gold-500/40 rounded-xl text-white text-center text-xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                  <p className="text-info text-sm">
                    <strong>หมายเหตุ:</strong>
                  </p>
                  <ul className="text-info/80 text-xs mt-2 space-y-1 list-disc list-inside">
                    {isGLO() && (
                      <>
                        <li>เลขเต็ม 6 หลัก = รางวัลที่ 1</li>
                        <li>3 ตัวหน้า/หลัง = รางวัลแยกต่างหาก (กรอกเป็นชุด เช่น 123,456)</li>
                      </>
                    )}
                    <li>2 ตัวหน้า (2 ตัวบน) = 2 หลักท้ายของ 3 ตัวบน (เช่น 123 → 23)</li>
                    <li>2 ตัวล่าง = กรอกด้วยตนเอง</li>
                    {is4Digit() && <li>4 ตัวตรง (1234) → 3 ตัว (234), 2 ตัวบน (34)</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-admin-darker/50 border-t border-gold-500/20 py-4 px-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-brown-900 font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSave />
                {saving ? 'กำลังบันทึก...' : 'บันทึกผล'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LotteryResultModal;
