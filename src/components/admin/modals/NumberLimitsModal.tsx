import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { adminHuayLimitAPI, HuayLimit, CreateHuayLimitRequest } from '@/api/adminHuayLimitAPI';

interface NumberLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number;  // Changed from lotteryId - now uses stock_master.id
  lotteryName: string;
}

const NumberLimitsModal: React.FC<NumberLimitsModalProps> = ({
  isOpen,
  onClose,
  stockId,
  lotteryName,
}) => {
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState<HuayLimit[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CreateHuayLimitRequest>>({});
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  // Use the same poy_option values as the betting system
  const poyOptions = [
    { value: 'teng_bon_4', label: 'หวย 4 ตัวบน' },
    { value: 'tode_4', label: 'หวย 4 ตัวโต๊ด' },
    { value: 'teng_bon_3', label: 'หวย 3 ตัวบน' },
    { value: 'tode_3', label: 'หวย 3 ตัวโต๊ด' },
    { value: 'teng_lang_3', label: 'หวย 3 ตัวล่าง' },
    { value: 'teng_lang_nha_3', label: 'หวย 3 ตัวหน้า' },
    { value: 'teng_bon_2', label: 'หวย 2 ตัวบน' },
    { value: 'teng_lang_2', label: 'หวย 2 ตัวล่าง' },
    { value: 'tode_2', label: 'หวย 2 ตัวโต๊ด' },
    { value: 'wing_bon', label: 'วิ่งบน' },
    { value: 'wing_lang', label: 'วิ่งล่าง' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchLimits();
      const initialExpanded: { [key: string]: boolean } = {};
      poyOptions.forEach(opt => {
        initialExpanded[opt.value] = true;
      });
      setExpandedGroups(initialExpanded);
    }
  }, [isOpen, stockId]);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const data = await adminHuayLimitAPI.getByStockId(stockId);
      setLimits(data);
    } catch (error) {
      console.error('Failed to fetch number limits:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const groupedLimits = React.useMemo(() => {
    const groups: { [key: string]: HuayLimit[] } = {};
    limits.forEach(limit => {
      if (!groups[limit.poyOption]) {
        groups[limit.poyOption] = [];
      }
      groups[limit.poyOption].push(limit);
    });
    return groups;
  }, [limits]);

  const handleAdd = () => {
    setEditingId(-1);
    setFormData({
      stockId: stockId,
      huayType: 'g',
      poyOption: 'teng_bon_3',  // Changed to match betting system
      multiply: 50,
      pPrice: 100,
      status: 1,
    });
  };

  const handleEdit = (limit: HuayLimit) => {
    setEditingId(limit.id);
    setFormData({
      huayType: limit.huayType,
      poyOption: limit.poyOption,
      poyNumber: limit.poyNumber || undefined,
      multiply: limit.multiply,
      pPrice: limit.pPrice,
      status: limit.status,
    });
  };

  const handleSave = async () => {
    try {
      if (editingId === -1) {
        await adminHuayLimitAPI.create(stockId, formData as CreateHuayLimitRequest);
        alert('เพิ่มหวยอั๋นสำเร็จ');
      } else if (editingId) {
        await adminHuayLimitAPI.update(editingId, formData);
        alert('อัปเดตหวยอั๋นสำเร็จ');
      }
      setEditingId(null);
      setFormData({});
      fetchLimits();
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบหวยอั๋นนี้หรือไม่?')) return;
    try {
      await adminHuayLimitAPI.delete(id);
      alert('ลบหวยอั๋นสำเร็จ');
      fetchLimits();
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const getPoyOptionLabel = (value: string) => {
    return poyOptions.find(opt => opt.value === value)?.label || value;
  };

  const toggleGroup = (poyOption: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [poyOption]: !prev[poyOption]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card rounded-2xl shadow-2xl border border-admin-border w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brown-900">
            หวยอั๋น - {lotteryName}
          </h2>
          <button onClick={onClose} className="text-brown-900 hover:text-brown-700 transition-colors p-2 hover:bg-white/20 rounded-lg">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex justify-end">
            <button onClick={handleAdd} className="px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg transition-all shadow-lg flex items-center gap-2">
              <FaPlus />
              เพิ่มหวยอั๋น
            </button>
          </div>

          {editingId !== null && (
            <div className="bg-admin-darker border border-admin-border rounded-xl p-4 mb-4">
              <h3 className="text-lg font-bold text-gold-400 mb-4">
                {editingId === -1 ? 'เพิ่มหวยอั๋น' : 'แก้ไขหวยอั๋น'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">ประเภทหวย</label>
                  <select value={formData.poyOption || ''} onChange={(e) => setFormData({ ...formData, poyOption: e.target.value })} className="input w-full">
                    {poyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    เลขที่กำหนด <span className="text-xs text-gray-400">(123,456,789)</span>
                  </label>
                  <input type="text" value={formData.poyNumber || ''} onChange={(e) => setFormData({ ...formData, poyNumber: e.target.value })} className="input w-full" placeholder="123,456,789" />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">ราคาจ่าย (เท่า)</label>
                  <input type="number" value={formData.multiply || ''} onChange={(e) => setFormData({ ...formData, multiply: parseFloat(e.target.value) })} className="input w-full" placeholder="50" step="0.01" />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">ยอดขายสูงสุด (บาท)</label>
                  <input type="number" value={formData.pPrice || ''} onChange={(e) => setFormData({ ...formData, pPrice: parseFloat(e.target.value) })} className="input w-full" placeholder="100" step="0.01" />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">สถานะ</label>
                  <select value={formData.status || 1} onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })} className="input w-full">
                    <option value={1}>เปิด</option>
                    <option value={0}>ปิด</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2">
                  <FaSave /> บันทึก
                </button>
                <button onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
          ) : limits.length === 0 ? (
            <div className="text-center py-10 text-gray-400">ยังไม่มีหวยอั๋น</div>
          ) : (
            <div className="space-y-4">
              {poyOptions.map(option => {
                const group = groupedLimits[option.value];
                if (!group || group.length === 0) return null;

                const isExpanded = expandedGroups[option.value];

                return (
                  <div key={option.value} className="bg-admin-darker border border-admin-border rounded-xl overflow-hidden">
                    <button onClick={() => toggleGroup(option.value)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-gold-400 font-bold text-lg">{option.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">{group.length}</span>
                      </div>
                      {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-3">
                        {group.map((limit) => (
                          <div key={limit.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gold-500 transition-all">
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <label className="text-xs text-gray-400">เลข</label>
                                <p className="text-white font-semibold break-words whitespace-normal">{limit.poyNumber || '-'}</p>
                              </div>
                              <div>
                                <label className="text-xs text-gray-400">ราคาจ่าย</label>
                                <p className="text-warning font-bold">1 : {limit.multiply}</p>
                              </div>
                              <div>
                                <label className="text-xs text-gray-400">ยอดขายสูงสุด</label>
                                <p className="text-info font-semibold">{limit.pPrice} บาท</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                              <span className={`px-2 py-1 rounded-full text-xs ${limit.status === 1 ? 'bg-success/20 text-success' : 'bg-gray-600/20 text-gray-400'}`}>
                                {limit.status === 1 ? 'เปิด' : 'ปิด'}
                              </span>
                              <div className="flex-1"></div>
                              <button onClick={() => handleEdit(limit)} className="px-3 py-1 bg-warning hover:bg-yellow-600 text-brown-900 rounded-lg flex items-center gap-1 text-sm">
                                <FaEdit /> แก้ไข
                              </button>
                              <button onClick={() => handleDelete(limit.id)} className="px-3 py-1 bg-error hover:bg-red-600 text-white rounded-lg flex items-center gap-1 text-sm">
                                <FaTrash /> ลบ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-admin-darker border-t border-admin-border p-4 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberLimitsModal;
