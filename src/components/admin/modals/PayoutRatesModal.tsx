import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { adminHuayLimitAPI, HuayLimit, CreateHuayLimitRequest } from '@/api/adminHuayLimitAPI';

interface PayoutRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotteryId: number;
  lotteryName: string;
}

const PayoutRatesModal: React.FC<PayoutRatesModalProps> = ({
  isOpen,
  onClose,
  lotteryId,
  lotteryName,
}) => {
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState<HuayLimit[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CreateHuayLimitRequest>>({});

  const poyOptions = [
    { value: 'teng_bon_3', label: '3 ตัวบน' },
    { value: 'teng_bon_2', label: '2 ตัวบน' },
    { value: 'teng_lang_3', label: '3 ตัวล่าง' },
    { value: 'teng_lang_2', label: '2 ตัวล่าง' },
    { value: 'tode_3', label: '3 ตัวโต๊ด' },
    { value: 'tode_2', label: '2 ตัวโต๊ด' },
    { value: 'run_bon', label: 'วิ่งบน' },
    { value: 'run_lang', label: 'วิ่งล่าง' },
  ];

  const huayTypes = [
    { value: 'g', label: 'รัฐบาล (g)' },
    { value: 's', label: 'หุ้น (s)' },
    { value: 'o', label: 'อื่นๆ (o)' },
    { value: 'b', label: 'บาทละ (b)' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchLimits();
    }
  }, [isOpen, lotteryId]);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const data = await adminHuayLimitAPI.getByLotteryId(lotteryId);
      setLimits(data);
    } catch (error) {
      console.error('Failed to fetch payout rates:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(-1);
    setFormData({
      huayId: lotteryId,
      huayType: 'g',
      poyOption: 'teng_bon_3',
      multiply: 800,
      pPrice: 100,
      status: 1,
    });
  };

  const handleEdit = (limit: HuayLimit) => {
    setEditingId(limit.id);
    setFormData({
      huayType: limit.huayType,
      poyOption: limit.poyOption,
      multiply: limit.multiply,
      pPrice: limit.pPrice,
      status: limit.status,
    });
  };

  const handleSave = async () => {
    try {
      if (editingId === -1) {
        // Create new
        await adminHuayLimitAPI.create(lotteryId, formData as CreateHuayLimitRequest);
        alert('เพิ่มอัตราจ่ายสำเร็จ');
      } else if (editingId) {
        // Update existing
        await adminHuayLimitAPI.update(editingId, formData);
        alert('อัปเดตอัตราจ่ายสำเร็จ');
      }
      setEditingId(null);
      setFormData({});
      fetchLimits();
    } catch (error: any) {
      console.error('Failed to save payout rate:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบอัตราจ่ายนี้หรือไม่?')) return;
    try {
      await adminHuayLimitAPI.delete(id);
      alert('ลบอัตราจ่ายสำเร็จ');
      fetchLimits();
    } catch (error: any) {
      console.error('Failed to delete payout rate:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const getPoyOptionLabel = (value: string) => {
    return poyOptions.find(opt => opt.value === value)?.label || value;
  };

  const getHuayTypeLabel = (value: string) => {
    return huayTypes.find(opt => opt.value === value)?.label || value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brown-900">
            กำหนดอัตราการจ่ายหวย - {lotteryName}
          </h2>
          <button
            onClick={onClose}
            className="text-brown-900 hover:text-brown-700 transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Button */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg transition-all shadow-lg flex items-center gap-2"
            >
              <FaPlus />
              เพิ่มอัตราจ่าย
            </button>
          </div>

          {/* Add/Edit Form */}
          {editingId !== null && (
            <div className="bg-admin-darker border border-admin-border rounded-xl p-4 mb-4">
              <h3 className="text-lg font-bold text-gold-400 mb-4">
                {editingId === -1 ? 'เพิ่มอัตราจ่าย' : 'แก้ไขอัตราจ่าย'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">ประเภทหวย</label>
                  <select
                    value={formData.huayType || ''}
                    onChange={(e) => setFormData({ ...formData, huayType: e.target.value })}
                    className="input w-full"
                  >
                    {huayTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">ประเภทการแทง</label>
                  <select
                    value={formData.poyOption || ''}
                    onChange={(e) => setFormData({ ...formData, poyOption: e.target.value })}
                    className="input w-full"
                  >
                    {poyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">อัตราจ่าย (เท่า)</label>
                  <input
                    type="number"
                    value={formData.multiply || ''}
                    onChange={(e) => setFormData({ ...formData, multiply: parseFloat(e.target.value) })}
                    className="input w-full"
                    placeholder="800"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">ราคาสูงสุดต่อหมายเลข</label>
                  <input
                    type="number"
                    value={formData.pPrice || ''}
                    onChange={(e) => setFormData({ ...formData, pPrice: parseFloat(e.target.value) })}
                    className="input w-full"
                    placeholder="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">สถานะ</label>
                  <select
                    value={formData.status || 1}
                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                    className="input w-full"
                  >
                    <option value={1}>เปิดใช้งาน</option>
                    <option value={0}>ปิดใช้งาน</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    บันทึก
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-lg"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-10 text-gray-400">กำลังโหลดข้อมูล...</div>
          ) : limits.length === 0 ? (
            <div className="text-center py-10 text-gray-400">ยังไม่มีข้อมูลอัตราจ่าย</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-admin-darker">
                  <tr className="border-b border-admin-border">
                    <th className="px-4 py-3 text-left text-gray-300 text-sm font-semibold">ประเภทหวย</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm font-semibold">ประเภทการแทง</th>
                    <th className="px-4 py-3 text-right text-gray-300 text-sm font-semibold">อัตราจ่าย</th>
                    <th className="px-4 py-3 text-right text-gray-300 text-sm font-semibold">สูงสุด/หมายเลข</th>
                    <th className="px-4 py-3 text-center text-gray-300 text-sm font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-center text-gray-300 text-sm font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {limits.map((limit) => (
                    <tr key={limit.id} className="hover:bg-admin-darker/50 transition-colors">
                      <td className="px-4 py-3 text-white">{getHuayTypeLabel(limit.huayType)}</td>
                      <td className="px-4 py-3 text-white">{getPoyOptionLabel(limit.poyOption)}</td>
                      <td className="px-4 py-3 text-right text-warning font-semibold">1 : {limit.multiply.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-info">{limit.pPrice.toLocaleString()} บาท</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          limit.status === 1 ? 'bg-success/20 text-success' : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {limit.status === 1 ? 'เปิด' : 'ปิด'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(limit)}
                            className="px-3 py-1 bg-warning hover:bg-yellow-600 text-brown-900 rounded-lg transition-all shadow-md flex items-center gap-1 text-sm"
                          >
                            <FaEdit />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(limit.id)}
                            className="px-3 py-1 bg-error hover:bg-red-600 text-white rounded-lg transition-all shadow-md flex items-center gap-1 text-sm"
                          >
                            <FaTrash />
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-admin-darker border-t border-admin-border p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-lg"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutRatesModal;
