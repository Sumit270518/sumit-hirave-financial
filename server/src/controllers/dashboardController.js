import Transaction from '../models/Transaction.js';
import FinancialHabit from '../models/FinancialHabit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Asset from '../models/Asset.js';
import Liability from '../models/Liability.js';
import NetWorthSnapshot from '../models/NetWorthSnapshot.js';
import { getPeriodKey } from './habitController.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { range = 'this-month', startDate, endDate } = req.query;
    const now = new Date();

    let startPeriod;
    let endPeriod = new Date(now);
    endPeriod.setHours(23, 59, 59, 999);

    if (startDate && endDate) {
      startPeriod = new Date(startDate);
      endPeriod = new Date(endDate);
      endPeriod.setHours(23, 59, 59, 999);
    } else if (range === 'last-month') {
      startPeriod = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endPeriod = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (range === 'last-3-months') {
      startPeriod = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (range === 'this-year') {
      startPeriod = new Date(now.getFullYear(), 0, 1);
    } else {
      // default: this-month
      startPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 1. Transactions in period
    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startPeriod, $lte: endPeriod },
    }).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpenses = 0;
    let internalTransfers = 0;
    const categoryBreakdown = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        if (tx.isInternalTransfer) {
          internalTransfers += tx.amount;
        } else {
          totalExpenses += tx.amount;
          categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
        }
      }
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    internalTransfers = Math.round(internalTransfers * 100) / 100;

    const savings = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 1000) / 10 : 0;

    // 2. Assets, Liabilities & Net Worth
    const [assets, liabilities] = await Promise.all([
      Asset.find({ user: req.user._id }),
      Liability.find({ user: req.user._id }),
    ]);

    let totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
    let totalLiabilities = liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0);
    totalAssets = Math.round(totalAssets * 100) / 100;
    totalLiabilities = Math.round(totalLiabilities * 100) / 100;
    const netWorth = Math.round((totalAssets - totalLiabilities) * 100) / 100;

    // 3. Savings Goals
    const goals = await SavingsGoal.find({ user: req.user._id, status: { $ne: 'archived' } });
    const activeGoalsCount = goals.filter((g) => g.status === 'in-progress').length;
    const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;

    // 4. Habits & Completion rate
    const habits = await FinancialHabit.find({ user: req.user._id, status: 'active' });
    let completedTodayCount = 0;
    const pendingHabitsToday = [];

    for (const habit of habits) {
      const pKey = getPeriodKey(now, habit.frequency);
      const isDone = await HabitCompletion.exists({ habit: habit._id, periodKey: pKey });
      if (isDone) {
        completedTodayCount++;
      } else {
        pendingHabitsToday.push(habit);
      }
    }

    const habitCompletionRate = habits.length > 0
      ? Math.round((completedTodayCount / habits.length) * 1000) / 10
      : 0;

    // 5. Recent 6 months Net Worth Trend from Snapshots
    const netWorthHistory = await NetWorthSnapshot.find({ user: req.user._id })
      .sort({ snapshotDate: 1 })
      .limit(12);

    // 6. Recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    // 7. Monthly Cashflow comparison for chart (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sixMonthTransactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: sixMonthsAgo, $lte: endPeriod },
    });

    const monthlyCashflowMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().slice(2)}`;
      monthlyCashflowMap[mKey] = { month: mKey, income: 0, expense: 0, savings: 0 };
    }

    sixMonthTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().slice(2)}`;
      if (monthlyCashflowMap[mKey]) {
        if (tx.type === 'income') {
          monthlyCashflowMap[mKey].income += tx.amount;
        } else if (tx.type === 'expense' && !tx.isInternalTransfer) {
          monthlyCashflowMap[mKey].expense += tx.amount;
        }
      }
    });

    const monthlyCashflow = Object.values(monthlyCashflowMap).map((m) => {
      const inc = Math.round(m.income * 100) / 100;
      const exp = Math.round(m.expense * 100) / 100;
      return {
        month: m.month,
        income: inc,
        expense: exp,
        savings: Math.round((inc - exp) * 100) / 100,
      };
    });

    // 8. Expense Category Breakdown for Pie Chart
    const expenseCategories = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      name: category,
      value: Math.round(amount * 100) / 100,
    })).sort((a, b) => b.value - a.value);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          internalTransfers,
          savings,
          savingsRate,
          totalAssets,
          totalLiabilities,
          netWorth,
          activeGoalsCount,
          completedGoalsCount,
          habitCount: habits.length,
          completedTodayCount,
          habitCompletionRate,
        },
        monthlyCashflow,
        expenseCategories,
        netWorthHistory,
        recentTransactions,
        pendingHabitsToday,
        goals: goals.slice(0, 4),
      },
    });
  } catch (error) {
    next(error);
  }
};
