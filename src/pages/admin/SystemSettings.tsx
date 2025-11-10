import React, { useState } from 'react';
import { FiSettings, FiDollarSign, FiBell, FiSend, FiCreditCard } from 'react-icons/fi';
import SystemTab from '../../components/admin/settings/SystemTab';
import LimitsTab from '../../components/admin/settings/LimitsTab';
import LineNotifyTab from '../../components/admin/settings/LineNotifyTab';
import TelegramTab from '../../components/admin/settings/TelegramTab';
import BankAccountsTab from '../../components/admin/settings/BankAccountsTab';

const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'ตั้งค่าระบบ', icon: FiSettings },
    { id: 'limits', label: 'วงเงินและข้อจำกัด', icon: FiDollarSign },
    { id: 'line', label: 'Line Notify', icon: FiBell },
    { id: 'telegram', label: 'Telegram', icon: FiSend },
    { id: 'banks', label: 'บัญชีธนาคาร', icon: FiCreditCard },
  ];

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gold-500 mb-2">ตั้งค่าระบบ</h1>
          <p className="text-brown-100">จัดการการตั้งค่าทั้งหมดของระบบ</p>
        </div>

        {/* Tabs */}
        <div className="bg-admin-card rounded-lg shadow-lg mb-6">
          <div className="flex border-b border-brown-800 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-gold-500 border-b-2 border-gold-500'
                      : 'text-brown-100 hover:text-gold-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'system' && <SystemTab />}
        {activeTab === 'limits' && <LimitsTab />}
        {activeTab === 'line' && <LineNotifyTab />}
        {activeTab === 'telegram' && <TelegramTab />}
        {activeTab === 'banks' && <BankAccountsTab />}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
