import React from 'react';
import { FiAlertCircle, FiCreditCard } from 'react-icons/fi';

const BankAccountsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">จัดการบัญชีธนาคาร</h3>
            <p className="text-blue-100 mb-3">
              ระบบจัดการบัญชีธนาคารมีอยู่แล้วในเมนู "จัดการบัญชีธนาคาร" ทางด้านซ้าย
            </p>
            <p className="text-sm text-blue-200">
              คุณสามารถเพิ่ม แก้ไข หรือลบบัญชีธนาคารสำหรับรับฝาก-ถอนได้ที่เมนูนั้น
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-admin-card rounded-lg p-6 border-2 border-brown-700 hover:border-gold-500 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-500">บัญชีรับฝาก</h3>
              <p className="text-sm text-brown-300">จัดการบัญชีสำหรับรับเงินฝาก</p>
            </div>
          </div>
          <ul className="text-sm text-brown-100 space-y-2">
            <li>• เพิ่ม/ลบบัญชีธนาคาร</li>
            <li>• ตั้งค่าสถานะเปิด/ปิด</li>
            <li>• กำหนดวงเงินรับฝาก</li>
            <li>• เชื่อมต่อ Auto Statement</li>
          </ul>
        </div>

        <div className="bg-admin-card rounded-lg p-6 border-2 border-brown-700 hover:border-gold-500 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400">บัญชีจ่ายถอน</h3>
              <p className="text-sm text-brown-300">จัดการบัญชีสำหรับจ่ายเงินถอน</p>
            </div>
          </div>
          <ul className="text-sm text-brown-100 space-y-2">
            <li>• เพิ่ม/ลบบัญชีธนาคาร</li>
            <li>• ตั้งค่าสถานะเปิด/ปิด</li>
            <li>• กำหนดวงเงินจ่ายถอน</li>
            <li>• เชื่อมต่อ Auto Transfer</li>
          </ul>
        </div>
      </div>

      {/* Navigation Hint */}
      <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
        <p className="text-gold-100 text-center">
          💡 <strong>เคล็ดลับ:</strong> ไปที่เมนู <span className="text-gold-400 font-bold">"จัดการบัญชีธนาคาร"</span> เพื่อจัดการบัญชีทั้งหมด
        </p>
      </div>
    </div>
  );
};

export default BankAccountsTab;
