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
import AdminMemberDetail from '@pages/admin/AdminMemberDetail';
import AdminMemberPoys from '@pages/admin/AdminMemberPoys';
import AdminMemberTransactions from '@pages/admin/AdminMemberTransactions';
import AdminPoyDetail from '@pages/admin/AdminPoyDetail';

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
import LotteryBets from '@pages/admin/LotteryBets'; // Poy (โพยเกม)
import LotteryBetsPage from '@pages/admin/LotteryBetsPage'; // Lottery Bets (หวย)
import LotteryBetsGrouped from '@pages/admin/LotteryBetsGrouped'; // Lottery Bets Grouped (หวยแบ่งกลุ่ม)
import StockMasterList from '@pages/admin/StockMasterList';
import LotteryDaily from '@pages/admin/LotteryDaily';
import LotteryDailyDetail from '@pages/admin/LotteryDailyDetail';
import LotteryEditLogs from '@pages/admin/LotteryEditLogs';

// Game Management
import GameManagement from '@pages/admin/GameManagement';
import GameProvidersManagement from '@pages/admin/GameProvidersManagement';
import ReviewManagement from '@pages/admin/ReviewManagement';

// Site Content
import SiteImagesManagement from '@pages/admin/SiteImagesManagement';
import PromotionsManagement from '@pages/admin/PromotionsManagement';
import SystemSettings from '@pages/admin/SystemSettings';
import PromotionLogsPage from '@pages/admin/PromotionLogsPage';
import PromotionSummary from '@pages/admin/PromotionSummary';
import PromotionSettings from '@pages/admin/PromotionSettings';
import Setup2FA from '@pages/admin/Setup2FA';
import Verify2FA from '@pages/admin/Verify2FA';

// Chat
import ChatManagement from '@pages/admin/ChatManagement';

// Lucky Wheel
import LuckyWheelManagement from '@pages/admin/LuckyWheelManagement';

// Turnover
import TurnoverOverview from '@pages/admin/TurnoverOverview';
import TurnoverMembers from '@pages/admin/TurnoverMembers';
import TurnoverRedemptions from '@pages/admin/TurnoverRedemptions';
import TurnoverManagement from '@pages/admin/TurnoverManagement';

// System
import AdminLogs from '@pages/admin/AdminLogs';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
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
        <Route path="/verify-2fa" element={<Verify2FA />} />

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
            <Route index element={<MembersManagement />} />
            <Route path="list" element={<MembersList />} />
            <Route path="today" element={<TodayCustomers />} />
            <Route path=":memberId" element={<AdminMemberDetail />} />
            <Route path=":memberId/transactions" element={<AdminMemberTransactions />} />
            <Route path=":memberId/poys" element={<AdminMemberPoys />} />
            <Route path=":memberId/poys/:poyId" element={<AdminPoyDetail />} />
          </Route>

          {/* Customers (alias for Members) */}
          <Route path="customers">
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
            <Route index element={<LotteryManagement />} />
            <Route path="daily" element={<LotteryDaily />} />
            <Route path="daily/:lotteryId" element={<LotteryDailyDetail />} />
            <Route path="edit-logs" element={<LotteryEditLogs />} />
            <Route path="management" element={<LotteryManagement />} />
            <Route path="bets" element={<LotteryBetsGrouped />} /> {/* หวยแบ่งกลุ่ม */}
            <Route path="bets-all" element={<LotteryBetsPage />} /> {/* หวยทั้งหมด */}
            <Route path="poys" element={<LotteryBets />} /> {/* โพยเกม */}
            <Route path="poy/:poyId" element={<AdminPoyDetail />} />
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
          <Route path="promotion-settings" element={<PromotionSettings />} />
          <Route path="promotion-logs" element={<PromotionLogsPage />} />
          <Route path="promotion-summary" element={<PromotionSummary />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="setup-2fa" element={<Setup2FA />} />

          {/* Chat */}
          <Route path="chat" element={<ChatManagement />} />

          {/* Lucky Wheel */}
          <Route path="lucky-wheel" element={<LuckyWheelManagement />} />

          {/* Turnover (unified with referral) */}
          <Route path="turnover">
            <Route index element={<TurnoverManagement />} />
            <Route path="overview" element={<TurnoverOverview />} />
            <Route path="members" element={<TurnoverMembers />} />
            <Route path="redemptions" element={<TurnoverRedemptions />} />
            <Route path="settings" element={<TurnoverManagement />} />
          </Route>

          {/* Referral redirects to turnover */}
          <Route path="referral">
            <Route index element={<Navigate to="/admin/turnover" replace />} />
            <Route path="settings" element={<Navigate to="/admin/turnover" replace />} />
          </Route>

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
