import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Layout
import AdminLayout from '@components/admin/AdminLayout';

// Admin Pages
import AdminLogin from '@pages/admin/AdminLogin';
import AdminDashboard from '@pages/admin/AdminDashboard';

// Deposits
import DepositsAll from '@pages/admin/DepositsAll';
import DepositsPending from '@pages/admin/DepositsPending';
import PendingSCB from '@pages/admin/PendingSCB';
import PendingKBANK from '@pages/admin/PendingKBANK';
import PendingTrueWallet from '@pages/admin/PendingTrueWallet';

// Withdrawals
import WithdrawalsAll from '@pages/admin/WithdrawalsAll';
import WithdrawalsPending from '@pages/admin/WithdrawalsPending';

// Cashback
import CashbackList from '@pages/admin/CashbackList';

// Members
import MembersList from '@pages/admin/MembersList';
import MembersManagement from '@pages/admin/MembersManagement';
import TodayCustomers from '@pages/admin/TodayCustomers';

// Transfers
import TransferLog from '@pages/admin/TransferLog';
import PendingTransfer from '@pages/admin/PendingTransfer';

// Staff
import StaffManagement from '@pages/admin/StaffManagement';

// Reports
import BankSCBReport from '@pages/admin/BankSCBReport';
import PincodeReport from '@pages/admin/PincodeReport';
import ProfitReport from '@pages/admin/ProfitReport';

// Lottery Management
import LotteryManagement from '@pages/admin/LotteryManagement';
import LotteryPeriods from '@pages/admin/LotteryPeriods';
import LotteryBets from '@pages/admin/LotteryBets';
import LotteryConfigManagement from '@pages/admin/LotteryConfigManagement';
import PayoutTierManagement from '@pages/admin/PayoutTierManagement';
import StockMasterList from '@pages/admin/StockMasterList';
import LotteryDaily from '@pages/admin/LotteryDaily';
import LotteryDailyDetail from '@pages/admin/LotteryDailyDetail';

// Game Management
import GameManagement from '@pages/admin/GameManagement';
import GameProvidersManagement from '@pages/admin/GameProvidersManagement';
import ReviewManagement from '@pages/admin/ReviewManagement';

// Site Content
import SiteImagesManagement from '@pages/admin/SiteImagesManagement';
import PromotionsManagement from '@pages/admin/PromotionsManagement';
import SiteSettingsManagement from '@pages/admin/SiteSettingsManagement';
import PromotionLogsPage from '@pages/admin/PromotionLogsPage';

// Chat
import ChatManagement from '@pages/admin/ChatManagement';

// Referral
import ReferralManagement from '@pages/admin/ReferralManagement';
import ReferralSettings from '@pages/admin/ReferralSettings';

// Lucky Wheel
import LuckyWheelManagement from '@pages/admin/LuckyWheelManagement';

// System
import AdminLogs from '@pages/admin/AdminLogs';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1410',
            color: '#f5a73c',
            border: '1px solid #f5a73c',
          },
          success: {
            style: {
              background: '#1a1410',
              color: '#10b981',
              border: '1px solid #10b981',
            },
          },
          error: {
            style: {
              background: '#1a1410',
              color: '#ef4444',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
      <Routes>
        {/* Public Admin Login Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Deposits */}
          <Route path="deposits">
            <Route index element={<Navigate to="/admin/deposits/all" replace />} />
            <Route path="all" element={<DepositsAll />} />
            <Route path="pending" element={<DepositsPending />} />
            <Route path="pending-scb" element={<PendingSCB />} />
            <Route path="pending-kbank" element={<PendingKBANK />} />
            <Route path="pending-truewallet" element={<PendingTrueWallet />} />
          </Route>

          {/* Withdrawals */}
          <Route path="withdrawals">
            <Route index element={<Navigate to="/admin/withdrawals/all" replace />} />
            <Route path="all" element={<WithdrawalsAll />} />
            <Route path="pending" element={<WithdrawalsPending />} />
          </Route>

          {/* Cashback */}
          <Route path="cashback" element={<CashbackList />} />

          {/* Members */}
          <Route path="members">
            <Route index element={<MembersList />} />
            <Route path="management" element={<MembersManagement />} />
            <Route path="today" element={<TodayCustomers />} />
          </Route>

          {/* Transfers */}
          <Route path="transfers">
            <Route index element={<Navigate to="/admin/transfers/log" replace />} />
            <Route path="log" element={<TransferLog />} />
            <Route path="pending" element={<PendingTransfer />} />
          </Route>

          {/* Staff */}
          <Route path="staff" element={<StaffManagement />} />

          {/* Reports */}
          <Route path="reports">
            <Route index element={<Navigate to="/admin/reports/profit" replace />} />
            <Route path="profit" element={<ProfitReport />} />
            <Route path="bank-scb" element={<BankSCBReport />} />
            <Route path="pincode" element={<PincodeReport />} />
          </Route>

          {/* Lottery Management */}
          <Route path="lottery">
            <Route index element={<Navigate to="/admin/lottery/daily" replace />} />
            <Route path="daily" element={<LotteryDaily />} />
            <Route path="daily/:lotteryId" element={<LotteryDailyDetail />} />
            <Route path="management" element={<LotteryManagement />} />
            <Route path="periods" element={<LotteryPeriods />} />
            <Route path="bets" element={<LotteryBets />} />
            <Route path="config" element={<LotteryConfigManagement />} />
            <Route path="payout-tiers" element={<PayoutTierManagement />} />
            <Route path="stock-master" element={<StockMasterList />} />
          </Route>

          {/* Game Management */}
          <Route path="games">
            <Route index element={<GameManagement />} />
            <Route path="providers" element={<GameProvidersManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>

          {/* Site Content */}
          <Route path="site-images" element={<SiteImagesManagement />} />
          <Route path="promotions" element={<PromotionsManagement />} />
          <Route path="promotion-logs" element={<PromotionLogsPage />} />
          <Route path="settings" element={<SiteSettingsManagement />} />

          {/* Chat */}
          <Route path="chat" element={<ChatManagement />} />

          {/* Referral */}
          <Route path="referral">
            <Route index element={<ReferralManagement />} />
            <Route path="settings" element={<ReferralSettings />} />
          </Route>

          {/* Lucky Wheel */}
          <Route path="lucky-wheel" element={<LuckyWheelManagement />} />

          {/* System */}
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
