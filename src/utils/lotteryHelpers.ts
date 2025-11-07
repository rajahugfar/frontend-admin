/**
 * Lottery Helper Functions
 * ฟังก์ชันช่วยเหลือสำหรับระบบแทงหวย
 */

export interface BetTypeConfig {
  id: string
  label: string
  color: 'purple' | 'red' | 'blue' | 'green' | 'orange' | 'yellow' | 'cyan' | 'pink' | 'indigo'
  digitCount: number
  multiply: number
  min: number
  max: number
}

// ใช้ชื่อตรงกับ Backend (teng_bon_3, tode_3, etc.)
export const BET_TYPES: Record<string, BetTypeConfig> = {
  'teng_bon_4': { id: 'teng_bon_4', label: '4ตัวบน', color: 'purple', digitCount: 4, multiply: 5000, min: 1, max: 1000 },
  'tode_4': { id: 'tode_4', label: '4ตัวโต๊ด', color: 'pink', digitCount: 4, multiply: 200, min: 1, max: 1000 },
  'teng_bon_3': { id: 'teng_bon_3', label: '3ตัวบน', color: 'red', digitCount: 3, multiply: 500, min: 1, max: 1000 },
  'tode_3': { id: 'tode_3', label: '3ตัวโต๊ด', color: 'orange', digitCount: 3, multiply: 120, min: 1, max: 1000 },
  'teng_lang_3': { id: 'teng_lang_3', label: '3ตัวหน้า', color: 'yellow', digitCount: 3, multiply: 500, min: 1, max: 1000 },
  'teng_bon_2': { id: 'teng_bon_2', label: '2ตัวบน', color: 'green', digitCount: 2, multiply: 90, min: 1, max: 1000 },
  'teng_lang_2': { id: 'teng_lang_2', label: '2ตัวล่าง', color: 'blue', digitCount: 2, multiply: 90, min: 1, max: 1000 },
  'teng_bon_1': { id: 'teng_bon_1', label: 'วิ่งบน', color: 'cyan', digitCount: 1, multiply: 3.2, min: 1, max: 500 },
  'teng_lang_1': { id: 'teng_lang_1', label: 'วิ่งล่าง', color: 'indigo', digitCount: 1, multiply: 4.2, min: 1, max: 500 },
}

// Conflict Rules: ไม่มี conflict (สามารถแทงหลายประเภทพร้อมกันได้)
export const CONFLICT_RULES: Record<string, string[]> = {}

/**
 * ======================
 * Number Generation Functions
 * ======================
 */

/**
 * 19 ประตู - สร้างเลข 19 เลขจากตัวเลข 1 ตัว
 * @param num - ตัวเลข 1 หลัก (0-9)
 * @returns Array ของเลข 2 หลัก 19 เลข
 * @example gen_19('5') // ['05', '15', '25', ..., '95', '50', '51', ..., '59']
 */
export function gen_19(num: string): string[] {
  if (num.length !== 1) return []
  const result: string[] = []

  for (let i = 0; i <= 9; i++) {
    result.push(num + i.toString())
    result.push(i.toString() + num)
  }

  return [...new Set(result)].sort()
}

/**
 * เลขเบิ้ล - เลขซ้ำ (00, 11, 22, ..., 99)
 * @returns Array ของเลขเบิ้ล 10 เลข
 */
export function gen_2_ble(): string[] {
  return ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99']
}

/**
 * รูดหน้า - สร้างเลข 10 เลขที่ขึ้นต้นด้วยตัวเลขที่ระบุ
 * @param num - ตัวเลข 1 หลัก (0-9)
 * @returns Array ของเลข 2 หลัก 10 เลข
 * @example rood_nha('5') // ['50', '51', '52', ..., '59']
 */
export function rood_nha(num: string): string[] {
  if (num.length !== 1) return []
  const result: string[] = []

  for (let i = 0; i <= 9; i++) {
    result.push(num + i.toString())
  }

  return result
}

/**
 * รูดหลัง - สร้างเลข 10 เลขที่ลงท้ายด้วยตัวเลขที่ระบุ
 * @param num - ตัวเลข 1 หลัก (0-9)
 * @returns Array ของเลข 2 หลัก 10 เลข
 * @example rood_lung('5') // ['05', '15', '25', ..., '95']
 */
export function rood_lung(num: string): string[] {
  if (num.length !== 1) return []
  const result: string[] = []

  for (let i = 0; i <= 9; i++) {
    result.push(i.toString() + num)
  }

  return result
}

/**
 * 2ตัวต่ำ - เลข 00-49
 * @returns Array ของเลข 2 หลัก 50 เลข
 */
export function gen_2_low(): string[] {
  const result: string[] = []
  for (let i = 0; i <= 49; i++) {
    result.push(i.toString().padStart(2, '0'))
  }
  return result
}

/**
 * 2ตัวสูง - เลข 50-99
 * @returns Array ของเลข 2 หลัก 50 เลข
 */
export function gen_2_high(): string[] {
  const result: string[] = []
  for (let i = 50; i <= 99; i++) {
    result.push(i.toString())
  }
  return result
}

/**
 * 2ตัวคู่ - เลขคู่ 00, 02, 04, ..., 98
 * @returns Array ของเลขคู่ 50 เลข
 */
export function gen_2_even(): string[] {
  const result: string[] = []
  for (let i = 0; i <= 99; i += 2) {
    result.push(i.toString().padStart(2, '0'))
  }
  return result
}

/**
 * 2ตัวคี่ - เลขคี่ 01, 03, 05, ..., 99
 * @returns Array ของเลขคี่ 50 เลข
 */
export function gen_2_odd(): string[] {
  const result: string[] = []
  for (let i = 1; i <= 99; i += 2) {
    result.push(i.toString().padStart(2, '0'))
  }
  return result
}

/**
 * 3ตัวกลับ - สลับตำแหน่งเลข 3 หลัก (Permutation)
 * @param num - ตัวเลข 3 หลัก
 * @returns Array ของเลขที่สลับตำแหน่ง (สูงสุด 6 แบบ)
 * @example shuffle_num_3('123') // ['123', '132', '213', '231', '312', '321']
 */
export function shuffle_num_3(num: string): string[] {
  if (num.length !== 3) return []

  const digits = num.split('')
  const result: Set<string> = new Set()

  function permute(arr: string[], m: string[] = []) {
    if (arr.length === 0) {
      result.add(m.join(''))
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice()
        const next = curr.splice(i, 1)
        permute(curr, m.concat(next))
      }
    }
  }

  permute(digits)
  return Array.from(result).sort()
}

/**
 * 2ตัวกลับ - สลับตำแหน่งเลข 2 หลัก
 * @param num - ตัวเลข 2 หลัก
 * @returns Array ของเลขที่สลับตำแหน่ง (2 แบบ)
 * @example shuffle_num_2('12') // ['12', '21']
 */
export function shuffle_num_2(num: string): string[] {
  if (num.length !== 2) return []

  const [a, b] = num.split('')
  const result: Set<string> = new Set([
    a + b,
    b + a
  ])

  return Array.from(result).sort()
}

/**
 * 4ตัวโต๊ด - สลับตำแหน่งเลข 4 หลัก (Permutation ทั้งหมด)
 * @param num - ตัวเลข 4 หลัก
 * @returns Array ของเลขที่สลับตำแหน่ง (สูงสุด 24 แบบ)
 * @example tode4Permutations('1234') // ['1234', '1243', ..., '4321']
 */
export function tode4Permutations(num: string): string[] {
  if (num.length !== 4) return []

  const digits = num.split('')
  const result: Set<string> = new Set()

  function permute(arr: string[], m: string[] = []) {
    if (arr.length === 0) {
      result.add(m.join(''))
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice()
        const next = curr.splice(i, 1)
        permute(curr, m.concat(next))
      }
    }
  }

  permute(digits)
  return Array.from(result).sort()
}

/**
 * ======================
 * Validation Functions
 * ======================
 */

/**
 * ตรวจสอบความยาวของเลขตามประเภทการแทง
 * @param num - ตัวเลข
 * @param betType - ประเภทการแทง
 * @returns true ถ้าความยาวถูกต้อง
 */
export function validateNumberLength(num: string, betType: string): boolean {
  const config = BET_TYPES[betType]
  if (!config) return false
  return num.length === config.digitCount
}

/**
 * ตรวจสอบว่าประเภทการแทงที่เลือกขัดแย้งกันหรือไม่
 * @param betType - ประเภทที่ต้องการเลือก
 * @param selectedTypes - ประเภทที่เลือกไว้แล้ว
 * @returns true ถ้าขัดแย้ง
 */
export function checkConflict(betType: string, selectedTypes: string[]): boolean {
  const conflicts = CONFLICT_RULES[betType] || []
  return selectedTypes.some(type => conflicts.includes(type))
}

/**
 * ตรวจสอบเลขซ้ำในตะกร้า
 * @param number - ตัวเลข
 * @param betType - ประเภทการแทง
 * @param cart - รายการในตะกร้า
 * @returns true ถ้ามีเลขซ้ำ
 */
export function checkDuplicate(
  number: string,
  betType: string,
  cart: Array<{ number: string; bet_type: string }>
): boolean {
  return cart.some(item => item.number === number && item.bet_type === betType)
}

/**
 * ======================
 * Calculation Functions
 * ======================
 */

/**
 * คำนวณเงินรางวัลที่อาจได้รับ
 * @param amount - จำนวนเงินที่แทง
 * @param multiply - อัตราจ่าย
 * @returns จำนวนเงินรางวัล
 */
export function calculatePotentialWin(amount: number, multiply: number): number {
  return amount * multiply
}

/**
 * คำนวณยอดรวมทั้งหมดในตะกร้า
 * @param cart - รายการในตะกร้า
 * @returns { totalAmount, totalWin }
 */
export function calculateTotal(
  cart: Array<{ amount: number; payout_rate: number }>
): { totalAmount: number; totalWin: number } {
  const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0)
  const totalWin = cart.reduce((sum, item) => sum + (item.amount * item.payout_rate), 0)

  return { totalAmount, totalWin }
}

/**
 * ======================
 * Number Grid Generation
 * ======================
 */

/**
 * สร้างแผงเลขตามจำนวนหลัก
 * @param digitCount - จำนวนหลัก (1-4)
 * @returns Array ของเลขทั้งหมด
 * @example generateNumberGrid(2) // ['00', '01', ..., '99']
 */
export function generateNumberGrid(digitCount: number): string[] {
  const max = Math.pow(10, digitCount)
  const numbers: string[] = []

  for (let i = 0; i < max; i++) {
    numbers.push(i.toString().padStart(digitCount, '0'))
  }

  return numbers
}

/**
 * แบ่งแผงเลขเป็น Tabs (สำหรับ 3 ตัว)
 * @param numbers - Array ของเลข
 * @param tabSize - ขนาดของแต่ละ Tab (default: 100)
 * @returns Object ที่แบ่งตาม Tab
 * @example groupNumbersByTab(numbers, 100) // { '000': [...], '100': [...], ... }
 */
export function groupNumbersByTab(numbers: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}

  numbers.forEach(num => {
    const tabKey = num.substring(0, 1) + '00'
    if (!grouped[tabKey]) {
      grouped[tabKey] = []
    }
    grouped[tabKey].push(num)
  })

  return grouped
}

/**
 * Filter เลขตามคำค้นหา
 * @param numbers - Array ของเลข
 * @param search - คำค้นหา
 * @returns Array ของเลขที่ตรงกับคำค้นหา
 */
export function filterNumbers(numbers: string[], search: string): string[] {
  if (!search) return numbers
  return numbers.filter(num => num.includes(search))
}

/**
 * ======================
 * Utility Functions
 * ======================
 */

/**
 * Pad เลขให้มีความยาวที่ต้องการ
 * @param num - ตัวเลข
 * @param length - ความยาวที่ต้องการ
 * @returns เลขที่ Pad แล้ว
 */
export function padNumber(num: string | number, length: number): string {
  return num.toString().padStart(length, '0')
}

/**
 * Format ตัวเลขให้มีคอมม่า
 * @param num - ตัวเลข
 * @returns ตัวเลขที่ Format แล้ว
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

/**
 * Get color classes ตามประเภท
 * @param color - สี
 * @param isActive - สถานะ active
 * @returns className
 */
export function getColorClasses(color: string, isActive: boolean): string {
  const colorClasses: Record<string, { active: string; inactive: string }> = {
    purple: {
      active: 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50',
      inactive: 'bg-purple-900/50 border-purple-700 hover:bg-purple-800/50'
    },
    red: {
      active: 'bg-red-600 border-red-400 shadow-lg shadow-red-500/50',
      inactive: 'bg-red-900/50 border-red-700 hover:bg-red-800/50'
    },
    blue: {
      active: 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50',
      inactive: 'bg-blue-900/50 border-blue-700 hover:bg-blue-800/50'
    },
    green: {
      active: 'bg-green-600 border-green-400 shadow-lg shadow-green-500/50',
      inactive: 'bg-green-900/50 border-green-700 hover:bg-green-800/50'
    },
  }

  const classes = colorClasses[color]
  return classes ? (isActive ? classes.active : classes.inactive) : ''
}
