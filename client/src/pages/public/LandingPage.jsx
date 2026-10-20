import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Flame,
  Target,
  ArrowRight,
  CheckCircle,
  PieChart,
  Lock,
  Sparkles,
  Zap,
  Award,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { formatCurrency } from '../../utils/formatters';

export const LandingPage = () => {
  // Interactive Compound Wealth Growth Calculator
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [returnRate, setReturnRate] = useState(12); // 12% equity index average
  const [years, setYears] = useState(5);

  const calculateFutureWealth = () => {
    const monthlyRate = returnRate / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyContribution * months;
    const futureValue =
      monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return Math.round(futureValue);
  };

  const totalInvested = monthlyContribution * years * 12;
  const estimatedWealth = calculateFutureWealth();
  const wealthGained = estimatedWealth - totalInvested;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Designed for Students & Young Professionals
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Master your money. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Build daily habits.
            </span>{' '}
            Grow real wealth.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one financial dashboard that links daily mindful spending habits with
            long-term net worth milestones. No spreadsheets. No double-counting. 100% private.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Start Your Financial Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl border border-slate-200 shadow-sm transition"
            >
              Try Interactive Demo
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Non-intrusive Manual Logging
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Accurate Savings Rate Formula
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Dated Net Worth Snapshots
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Compound Wealth Growth Calculator */}
      <section id="calculator" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Growth Simulator</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Visualize the Power of Consistent Habits
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              See what saving a small amount every month can do when compounded over time.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>Monthly Savings Contribution</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(monthlyContribution, 'INR')}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹500</span>
                  <span>₹25,000</span>
                  <span>₹50,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>Investment Horizon (Time)</span>
                  <span className="text-emerald-600 font-bold">{years} Years ({years * 12} months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 Year</span>
                  <span>7 Years</span>
                  <span>15 Years</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>Expected Annual Return Rate</span>
                  <span className="text-emerald-600 font-bold">{returnRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="18"
                  step="1"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>5% (FD/Debt)</span>
                  <span>12% (Index Funds)</span>
                  <span>18% (Aggressive)</span>
                </div>
              </div>
            </div>

            {/* Projected Result Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Projected Portfolio Value
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2">
                {formatCurrency(estimatedWealth, 'INR')}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Estimated wealth built through consistent monthly habits.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Money Saved:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(totalInvested, 'INR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Compound Returns Gained:</span>
                  <span className="font-semibold text-emerald-600">+{formatCurrency(wealthGained, 'INR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Wealth Multiplier:</span>
                  <span className="font-bold text-slate-900">
                    {totalInvested > 0 ? (estimatedWealth / totalInvested).toFixed(1) : 1}x
                  </span>
                </div>
              </div>

              <Link
                to="/register"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition"
              >
                Start Tracking Real Goals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Habit-Building Framework */}
      <section id="habits" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Core Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              The 3-Tier Financial Habit Framework
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Wealth is not created by luck. It is built through small, persistent behaviors practiced daily, weekly, and monthly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Daily Mindfulness</h3>
              <p className="text-xs font-semibold text-amber-600 mt-0.5">Record expenses before sleep</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Log cash and UPI micro-spending every evening. Awareness naturally curves impulsive discretionary purchases by up to 23%.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Weekly Check-In</h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">Budget audit & zero-spend day</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Review weekly category totals against your monthly threshold. Dedicate at least one weekday as a conscious zero-spend day.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Monthly Snapshot</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">Asset & debt balance valuation</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Capture your month-end net worth snapshot. Watch your debt shrink and investments expand steadily across dated visual charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Complete Feature Suite</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Built with Real Financial Integrity
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every formula and rule in FinHabit is designed with rigorous accounting precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-xl bg-white w-fit border border-slate-200 shadow-sm text-emerald-600 mb-3">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Internal Transfer Protection</h4>
              <p className="text-sm text-slate-600 mt-2">
                Transfers to your savings accounts or mutual funds are distinguished from consumption expenses so your savings aren't double-counted.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-xl bg-white w-fit border border-slate-200 shadow-sm text-amber-600 mb-3">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Strict Streak Calculation</h4>
              <p className="text-sm text-slate-600 mt-2">
                Habit streaks reflect persistent completions. Duplicate checks prevent accidental multiple marks in the same period.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-xl bg-white w-fit border border-slate-200 shadow-sm text-blue-600 mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Atomic Savings Goals</h4>
              <p className="text-sm text-slate-600 mt-2">
                Contributions and withdrawals create an immutable audit trail. No artificial balance alterations without validated entries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-xl bg-white w-fit border border-slate-200 shadow-sm text-purple-600 mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Dated Valuation Snapshots</h4>
              <p className="text-sm text-slate-600 mt-2">
                Net worth curves are derived from genuine dated snapshots rather than extrapolating backward from today's balances.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-xl bg-white w-fit border border-slate-200 shadow-sm text-teal-600 mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Private by Design</h4>
              <p className="text-sm text-slate-600 mt-2">
                Your financial records are strictly isolated. Even administrators cannot view your private transaction descriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-xl bg-white w-fit border border-slate-200 shadow-sm text-rose-600 mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">College Capstone Standard</h4>
              <p className="text-sm text-slate-600 mt-2">
                Comprehensive architecture with automated Vitest suites, full REST API, Mongoose schemas, and verified live deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-tr from-slate-900 to-slate-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Create your account in under 60 seconds or test drive the platform with one click using our demo profiles.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-700/80 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
