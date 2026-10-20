import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Landmark,
  ShieldAlert,
  Flame,
  Target,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const DashboardPage = () => {
  const { user, currency } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this-month');

  const fetchDashboardData = async (range) => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/stats?range=${range}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(dateRange);
  }, [dateRange]);

  const handleQuickCompleteHabit = async (habitId) => {
    try {
      const res = await api.post(`/habits/${habitId}/completions`);
      if (res.data.success) {
        toast.success('Habit completed for today!');
        fetchDashboardData(dateRange);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not complete habit.');
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Aggregating financial metrics..." />;
  }

  const { summary, monthlyCashflow, expenseCategories, netWorthHistory, recentTransactions, pendingHabitsToday, goals } =
    data || {
      summary: {},
      monthlyCashflow: [],
      expenseCategories: [],
      netWorthHistory: [],
      recentTransactions: [],
      pendingHabitsToday: [],
      goals: [],
    };

  return (
    <div className="space-y-6">
      {/* Welcome & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hello, {user?.name ? user.name.split(' ')[0] : 'there'} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is your financial habit performance and wealth summary.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
          {[
            { label: 'This Month', value: 'this-month' },
            { label: 'Last Month', value: 'last-month' },
            { label: 'Last 3 Months', value: 'last-3-months' },
            { label: 'This Year', value: 'this-year' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDateRange(tab.value)}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateRange === tab.value
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Period Income"
          value={formatCurrency(summary.totalIncome, currency)}
          subtitle="Total verified cash inflows"
          icon={TrendingUp}
          colorScheme="emerald"
        />

        <StatCard
          title="Period Expenses"
          value={formatCurrency(summary.totalExpenses, currency)}
          subtitle={summary.internalTransfers > 0 ? `+${formatCurrency(summary.internalTransfers, currency)} saved transfers` : 'Consumption spending'}
          icon={TrendingDown}
          colorScheme="rose"
        />

        <StatCard
          title="Net Savings"
          value={formatCurrency(summary.savings, currency)}
          trend={summary.savingsRate > 0 ? `${summary.savingsRate}% Savings Rate` : '0%'}
          trendPositive={summary.savings >= 0}
          subtitle="Income minus consumption"
          icon={PiggyBank}
          colorScheme="blue"
        />

        <StatCard
          title="Current Net Worth"
          value={formatCurrency(summary.netWorth, currency)}
          subtitle={`Assets ${formatCurrency(summary.totalAssets, currency)} - Debts ${formatCurrency(summary.totalLiabilities, currency)}`}
          icon={Landmark}
          colorScheme="purple"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Habit Completion Today</p>
              <h4 className="text-xl font-bold text-slate-900">
                {summary.completedTodayCount || 0} / {summary.habitCount || 0} completed
              </h4>
            </div>
          </div>
          <span className="text-sm font-bold text-amber-600">{summary.habitCompletionRate || 0}%</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Active Savings Goals</p>
              <h4 className="text-xl font-bold text-slate-900">
                {summary.activeGoalsCount || 0} in progress
              </h4>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            {summary.completedGoalsCount || 0} Achieved
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Asset Value</p>
              <h4 className="text-xl font-bold text-slate-900">
                {formatCurrency(summary.totalAssets, currency)}
              </h4>
            </div>
          </div>
          <Link to="/wealth" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
            Breakdown <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Visualizations Section: Cashflow & Expense Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cashflow Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Income vs Expenses (6-Month Trend)</h3>
              <p className="text-xs text-slate-500">Track how your cashflow and savings grow month over month</p>
            </div>
            <Link to="/transactions" className="text-xs font-semibold text-emerald-600 hover:underline">
              View History
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {monthlyCashflow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value, currency), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Consumption" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Net Savings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No cashflow recorded yet" description="Add your first income or expense transaction to see monthly comparisons." />
            )}
          </div>
        </div>

        {/* Expense Category Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Expense Breakdown</h3>
                <p className="text-xs text-slate-500">Distribution by spending category</p>
              </div>
            </div>

            <div className="h-56 w-full relative">
              {expenseCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value, currency), 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No expense records in this period
                </div>
              )}
            </div>
          </div>

          {/* Legend Table */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 max-h-36 overflow-y-auto">
            {expenseCategories.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(item.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Habits Today & Active Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits Requiring Attention Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Habits Requiring Check-In</h3>
            </div>
            <Link to="/habits" className="text-xs font-semibold text-emerald-600 hover:underline">
              All Habits
            </Link>
          </div>

          {pendingHabitsToday.length > 0 ? (
            <div className="space-y-3">
              {pendingHabitsToday.map((habit) => (
                <div
                  key={habit._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{habit.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {habit.frequency.toUpperCase()} &bull; Current streak: {habit.currentStreak} days
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickCompleteHabit(habit._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">All habits completed for today!</p>
              <p className="text-xs text-emerald-700/80 mt-1">Fantastic job keeping your streak alive.</p>
            </div>
          )}
        </div>

        {/* Active Savings Goals Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Active Savings Goals</h3>
            </div>
            <Link to="/goals" className="text-xs font-semibold text-emerald-600 hover:underline">
              Manage Goals
            </Link>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => {
                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                return (
                  <div key={goal._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-900">{goal.name}</span>
                      <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Saved: {formatCurrency(goal.currentAmount, currency)}</span>
                      <span>Target: {formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No active goals"
              description="Establish your first emergency buffer or asset purchase goal."
              actionText="+ Create Goal"
              onAction={() => window.location.assign('/goals')}
            />
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
          <Link to="/transactions" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : tx.isInternalTransfer
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-800">{tx.description || tx.category}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(tx.date)}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{tx.category}</span>
                      {tx.isInternalTransfer && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                          Transfer
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No transactions found for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
