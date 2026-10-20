import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  Bell,
  Wallet,
  CheckCircle2,
  Save,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, profile, updateProfileState, updateUserState } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredCurrency: profile?.preferredCurrency || 'INR',
    monthlyBudget: profile?.monthlyBudget || 30000,
    savingsTargetMonthly: profile?.savingsTargetMonthly || 10000,
    timezone: profile?.timezone || 'Asia/Kolkata',
    notificationPreferences: profile?.notificationPreferences || {
      emailReminders: true,
      inAppNotifications: true,
      budgetAlerts: true,
      habitReminders: true,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        preferredCurrency: profile.preferredCurrency || 'INR',
        monthlyBudget: profile.monthlyBudget || 30000,
        savingsTargetMonthly: profile.savingsTargetMonthly || 10000,
        timezone: profile.timezone || 'Asia/Kolkata',
        notificationPreferences: profile.notificationPreferences || prev.notificationPreferences,
      }));
    }
  }, [user, profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.patch('/profile', formData);
      if (res.data.success) {
        toast.success('Financial preferences updated successfully.');
        updateUserState(res.data.user);
        updateProfileState(res.data.profile);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await api.patch('/profile/password', passwordData);
      if (res.data.success) {
        toast.success('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Profile & Preferences</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure preferred currency, monthly spending budgets, and alert settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs h-fit text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              Role: {user?.role || 'user'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Active Member
            </span>
          </div>
        </div>

        {/* Right Column: Preferences Form & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Preferences Form */}
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" /> Financial Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={formData.preferredCurrency}
                  onChange={(e) => setFormData((p) => ({ ...p, preferredCurrency: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Spending Budget</label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData((p) => ({ ...p, monthlyBudget: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Savings Goal</label>
                <input
                  type="number"
                  min="0"
                  value={formData.savingsTargetMonthly}
                  onChange={(e) => setFormData((p) => ({ ...p, savingsTargetMonthly: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-600" /> Alerts & Notifications
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences?.habitReminders}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        notificationPreferences: { ...p.notificationPreferences, habitReminders: e.target.checked },
                      }))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Daily Habit Check-in Reminders</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences?.budgetAlerts}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        notificationPreferences: { ...p.notificationPreferences, budgetAlerts: e.target.checked },
                      }))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Budget Threshold Warnings</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" /> Security & Password
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
