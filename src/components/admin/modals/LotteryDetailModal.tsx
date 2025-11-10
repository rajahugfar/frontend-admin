import React from 'react'
import { FiX, FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi'
import { Lottery } from '@/api/adminLotteryAPI'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

interface LotteryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  lottery: Lottery
}

const LotteryDetailModal: React.FC<LotteryDetailModalProps> = ({ isOpen, onClose, lottery }) => {
  if (!isOpen) return null

  const getGroupName = (group: number): string => {
    const groups: { [key: number]: string } = {
      1: 'หวยไทย', 2: 'ลาว', 3: 'เวียดนาม', 4: 'หุ้นไทย', 5: 'หุ้นต่างประเทศ', 6: 'วีซ่า', 7: 'อื่นๆ'
    }
    return groups[group] || `กลุ่ม ${group}`
  }

  const getDayNameFull = (day: number): string => {
    const days: { [key: number]: string } = {
      1: 'จันทร์', 2: 'อังคาร', 3: 'พุธ', 4: 'พฤหัสบดี', 5: 'ศุกร์', 6: 'เสาร์', 7: 'อาทิตย์'
    }
    return days[day] || ''
  }

  const getFlagEmoji = (countryCode: string): string => {
    const code = countryCode.toLowerCase()
    const flags: { [key: string]: string } = {
      'th': '🇹🇭', 'la': '🇱🇦', 'vn': '🇻🇳', 'cn': '🇨🇳', 'jp': '🇯🇵',
      'kr': '🇰🇷', 'sg': '🇸🇬', 'my': '🇲🇾', 'tw': '🇹🇼', 'hk': '🇭🇰'
    }
    return flags[code] || '🏴'
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border sticky top-0 bg-admin-card z-10">
          <div className="flex items-center gap-3">
            <FiInfo className="w-6 h-6 text-gold-500" />
            <h2 className="text-2xl font-display font-bold text-gold-500">รายละเอียดหวย</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-admin-hover rounded transition-colors"
          >
            <FiX className="w-6 h-6 text-brown-400 hover:text-gold-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiInfo className="w-5 h-5" />
              ข้อมูลพื้นฐาน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon */}
              {lottery.icon && (
                <div className="flex items-center gap-3">
                  <span className="text-brown-400 font-medium min-w-[120px]">ธงชาติ:</span>
                  <span className="text-4xl">{getFlagEmoji(lottery.icon)}</span>
                </div>
              )}

              {/* Huay Code */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">รหัสหวย:</span>
                <span className="text-gold-500 font-bold">{lottery.huayCode}</span>
              </div>

              {/* Huay Name */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">ชื่อหวย:</span>
                <span className="text-brown-200 font-semibold">{lottery.huayName}</span>
              </div>

              {/* Huay Group */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">กลุ่มหวย:</span>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20">
                  {getGroupName(lottery.huayGroup)}
                </span>
              </div>

              {/* Huay Type */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">ประเภท:</span>
                <span className="text-brown-200">{lottery.huayType}</span>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">สถานะ:</span>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  lottery.status
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-error/10 text-error border border-error/20'
                }`}>
                  {lottery.status ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      เปิดใช้งาน
                    </>
                  ) : (
                    <>
                      <FiXCircle className="w-4 h-4" />
                      ปิดใช้งาน
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Time Settings Card */}
          <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              การตั้งค่าเวลา
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Open */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">เวลาเปิด:</span>
                <span className="text-brown-200">
                  {lottery.timeOpen ? lottery.timeOpen.split('T')[1]?.substring(0, 5) : '-'}
                </span>
              </div>

              {/* Time Close */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">เวลาปิด:</span>
                <span className="text-brown-200">
                  {lottery.timeClose ? lottery.timeClose.split('T')[1]?.substring(0, 5) : '-'}
                </span>
              </div>

              {/* Time Result */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">เวลาออกผล:</span>
                <span className="text-brown-200">
                  {lottery.timeResult ? lottery.timeResult.split('T')[1]?.substring(0, 5) : '-'}
                </span>
              </div>

              {/* Flag Nextday */}
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">ปิดข้ามวัน:</span>
                <span className="text-brown-200">
                  {lottery.flagNextday ? 'ใช่' : 'ไม่'}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gold-500 mb-4 flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              กำหนดการเปิดหวย
            </h3>
            <div className="space-y-4">
              {/* Date Opent */}
              {lottery.dateOpent && (
                <div className="flex items-start gap-3">
                  <span className="text-brown-400 font-medium min-w-[120px]">วันที่เปิด:</span>
                  <div className="flex flex-wrap gap-2">
                    {lottery.dateOpent.split(',').map((day, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-info/10 text-info border border-info/20 rounded-full"
                      >
                        {getDayNameFull(parseInt(day))}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Opent Fix */}
              {lottery.opentFix && (
                <div className="flex items-start gap-3">
                  <span className="text-brown-400 font-medium min-w-[120px]">วันที่ Fix:</span>
                  <div className="flex flex-wrap gap-2">
                    {lottery.opentFix.split(',').map((day, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-warning/10 text-warning border border-warning/20 rounded-full"
                      >
                        วันที่ {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!lottery.dateOpent && !lottery.opentFix && (
                <div className="text-brown-500 text-center py-2">
                  ไม่มีกำหนดการเปิดหวย
                </div>
              )}
            </div>
          </div>

          {/* Lottery Types Card */}
          <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gold-500 mb-4">ประเภทการเล่นที่เปิดใช้งาน</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${
                lottery.has4d
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-admin-bg border-admin-border text-brown-500'
              }`}>
                <div className="font-medium">4 ตัวบน</div>
                <div className="text-xs mt-1">{lottery.has4d ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                lottery.has3dTop
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-admin-bg border-admin-border text-brown-500'
              }`}>
                <div className="font-medium">3 ตัวบน</div>
                <div className="text-xs mt-1">{lottery.has3dTop ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                lottery.has3dBottom
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-admin-bg border-admin-border text-brown-500'
              }`}>
                <div className="font-medium">3 ตัวล่าง</div>
                <div className="text-xs mt-1">{lottery.has3dBottom ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                lottery.has2dTop
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-admin-bg border-admin-border text-brown-500'
              }`}>
                <div className="font-medium">2 ตัวบน</div>
                <div className="text-xs mt-1">{lottery.has2dTop ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                lottery.has2dBottom
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-admin-bg border-admin-border text-brown-500'
              }`}>
                <div className="font-medium">2 ตัวล่าง</div>
                <div className="text-xs mt-1">{lottery.has2dBottom ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
              </div>
            </div>
          </div>

          {/* Detail/Description Card */}
          {lottery.detail && (
            <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold-500 mb-4">รายละเอียดเพิ่มเติม</h3>
              <div
                className="text-brown-200 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lottery.detail }}
              />
            </div>
          )}

          {/* Official Website */}
          {lottery.officialWebsite && (
            <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold-500 mb-4">เว็บไซต์อย่างเป็นทางการ</h3>
              <a
                href={lottery.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info hover:text-info/80 underline break-all"
              >
                {lottery.officialWebsite}
              </a>
            </div>
          )}

          {/* System Info Card */}
          <div className="bg-admin-bg border border-admin-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gold-500 mb-4">ข้อมูลระบบ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">ID:</span>
                <span className="text-brown-200">{lottery.id}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">Display Order:</span>
                <span className="text-brown-200">{lottery.displayOrder}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">สร้างเมื่อ:</span>
                <span className="text-brown-200">
                  {dayjs(lottery.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brown-400 font-medium min-w-[120px]">อัปเดตล่าสุด:</span>
                <span className="text-brown-200">
                  {dayjs(lottery.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-admin-border sticky bottom-0 bg-admin-card">
          <button
            onClick={onClose}
            className="px-6 py-2 text-brown-200 bg-admin-bg border border-admin-border rounded-lg hover:border-gold-500/50 hover:text-gold-500 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}

export default LotteryDetailModal
