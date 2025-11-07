interface BankIconProps {
  bankCode: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const bankInfo: Record<string, { name: string; file: string }> = {
  KBANK: { name: 'กสิกรไทย', file: 'ksb' },
  KBank: { name: 'กสิกรไทย', file: 'ksb' },
  SCB: { name: 'ไทยพาณิชย์', file: 'scb' },
  BBL: { name: 'กรุงเทพ', file: 'bkb' },
  KTB: { name: 'กรุงไทย', file: 'ktb' },
  BAY: { name: 'กรุงศรี', file: 'bkb' },
  TMB: { name: 'ทหารไทยธนชาต', file: 'tmb' },
  CIMB: { name: 'ซีไอเอ็มบี', file: 'cimb' },
  TISCO: { name: 'ทิสโก้', file: 'ksi' },
  KKP: { name: 'เกียรตินาคิน', file: 'knk' },
  LH: { name: 'แลนด์ แอนด์ เฮ้าส์', file: 'lhb' },
  LHB: { name: 'แลนด์ แอนด์ เฮ้าส์', file: 'lhb' },
  TBANK: { name: 'ธนชาต', file: 'tnc' },
  TNC: { name: 'ธนชาต', file: 'tnc' },
  GSB: { name: 'ออมสิน', file: 'gsb' },
  BAAC: { name: 'ธ.ก.ส.', file: 'baac' },
  GHBANK: { name: 'อาคารสงเคราะห์', file: 'ghb' },
  GHB: { name: 'อาคารสงเคราะห์', file: 'ghb' },
  UOB: { name: 'ยูโอบี', file: 'uob' },
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

export default function BankIcon({ bankCode, size = 'md', className = '' }: BankIconProps) {
  // Handle undefined or null bankCode
  if (!bankCode) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gray-600 flex items-center justify-center text-white font-bold text-xs ${className}`}
        title="Unknown Bank"
      >
        ??
      </div>
    )
  }

  const bank = bankInfo[bankCode] || bankInfo[bankCode.toUpperCase()]

  if (!bank) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gray-600 flex items-center justify-center text-white font-bold text-xs ${className}`}
        title={bankCode}
      >
        {bankCode.substring(0, 2)}
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-white shadow-md ${className}`}
      title={bank.name}
    >
      <img
        src={`/images/banks/bank-${bank.file}.png`}
        alt={bank.name}
        className="w-full h-full object-contain p-0.5"
      />
    </div>
  )
}

// Helper component to show bank info with icon
export function BankInfo({
  bankCode,
  bankName,
  bankNumber,
  size = 'md',
}: {
  bankCode: string
  bankName: string
  bankNumber: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const bank = bankInfo[bankCode] || bankInfo[bankCode.toUpperCase()] || { name: bankCode, file: '' }

  return (
    <div className="flex items-center gap-3">
      <BankIcon bankCode={bankCode} size={size} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-brown-100 truncate">{bankName}</div>
        <div className="text-xs text-brown-400 font-mono">{bankNumber}</div>
        <div className="text-xs text-brown-500">{bank.name}</div>
      </div>
    </div>
  )
}
