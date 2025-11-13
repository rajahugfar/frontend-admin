export interface SystemSettings {
  siteName: string;
  siteLogo: string;
  siteLine: string;
  siteLineQrcode: string;
  siteNotifyAdmin: string;
  siteAlert: boolean;
  siteAlertDescription: string;
  siteAdmin2faEnable: boolean;
  siteAdmin2faMethod: string;
  siteStatusPincode: boolean;
  siteNotifyAdminPincode: string;
  siteBanner1: string;
  siteBanner2: string;
  siteBanner3: string;
  siteAffStep: number;
  siteAffPercent: number;
  siteAffType: number;
  siteAffMinWithdraw: number;
  siteAffPromotion: boolean;
  depositBankTransferEnabled: boolean;
  depositGatewayEnabled: boolean;
}

export interface LimitSettings {
  statusWithdraw: boolean;
  turnOver: number;
  perdayWithdraw: number;
  maxWithdraw: number;
  maxAutoWithdraw: number;
  statusPincodeWithdraw: boolean;
  notifyAdminWithdraw: string;
  forceAllWithdrawals: boolean;
  statusKbankWithdraw: boolean;
  cashbackEnable: boolean;
  cashbackPercent: number;
  cashbackTimeStart: number;
  cashbackTimeEnd: number;
  cashbackTurnover: boolean;
  ambAuthToken: string;
  ambAuthTokenSeamless: string;
}

export interface LineNotify {
  id: number;
  name: string;
  token: string;
  type: string;
  enabled: boolean;
}

export interface TelegramBot {
  id: number;
  name: string;
  token: string;
  chatId: string;
  enabled: boolean;
}

export interface BankAccount {
  id: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  statusBank: boolean;
  statusDeposit: boolean;
  statusWithdraw: boolean;
  pin: string;
  username: string;
  password: string;
  deviceId: string;
  lastUpdate: string;
}
