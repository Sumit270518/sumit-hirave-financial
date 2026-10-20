import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic header titles
  const titleMap = {
    '/dashboard': 'Financial Dashboard',
    '/transactions': 'Income & Expense Tracker',
    '/habits': 'Financial Habit Tracker',
    '/goals': 'Savings Goals',
    '/wealth': 'Wealth Growth & Net Worth',
    '/profile': 'Settings & Financial Preferences',
    '/notifications': 'Notification Center',
    '/feedback': 'Feedback & Support',
  };

  const currentTitle = titleMap[location.pathname] || 'Financial Tracker';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={currentTitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
