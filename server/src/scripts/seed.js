import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';

import User from '../models/User.js';
import FinancialProfile from '../models/FinancialProfile.js';
import Transaction from '../models/Transaction.js';
import FinancialHabit from '../models/FinancialHabit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import SavingsGoal from '../models/SavingsGoal.js';
import GoalTransaction from '../models/GoalTransaction.js';
import Asset from '../models/Asset.js';
import Liability from '../models/Liability.js';
import NetWorthSnapshot from '../models/NetWorthSnapshot.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seed process...');
    await connectDB();

    console.log('[Seed] Cleaning existing demo data...');
    // Clean demo accounts only
    const demoEmails = [
      'admin@wealthtracker.local',
      'alex@example.com',
      'priya@example.com',
    ];

    const existingDemoUsers = await User.find({ email: { $in: demoEmails } });
    const userIds = existingDemoUsers.map((u) => u._id);

    await Promise.all([
      User.deleteMany({ _id: { $in: userIds } }),
      FinancialProfile.deleteMany({ user: { $in: userIds } }),
      Transaction.deleteMany({ user: { $in: userIds } }),
      FinancialHabit.deleteMany({ user: { $in: userIds } }),
      HabitCompletion.deleteMany({ user: { $in: userIds } }),
      SavingsGoal.deleteMany({ user: { $in: userIds } }),
      GoalTransaction.deleteMany({ user: { $in: userIds } }),
      Asset.deleteMany({ user: { $in: userIds } }),
      Liability.deleteMany({ user: { $in: userIds } }),
      NetWorthSnapshot.deleteMany({ user: { $in: userIds } }),
      Notification.deleteMany({ user: { $in: userIds } }),
      Feedback.deleteMany({ user: { $in: userIds } }),
      AuditLog.deleteMany({ actor: { $in: userIds } }),
    ]);

    console.log('[Seed] Creating demo users...');
    // Create Admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePass123!';
    const admin = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@wealthtracker.local',
      password: adminPassword,
      role: 'admin',
      status: 'active',
      phone: '+91 9876543210',
    });

    await FinancialProfile.create({
      user: admin._id,
      preferredCurrency: 'INR',
      monthlyBudget: 50000,
      savingsTargetMonthly: 20000,
    });

    // Create Main Demo User (Alex - Young Professional)
    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active',
      phone: '+91 9811223344',
    });

    await FinancialProfile.create({
      user: alex._id,
      preferredCurrency: 'INR',
      monthlyBudget: 45000,
      savingsTargetMonthly: 15000,
      timezone: 'Asia/Kolkata',
    });

    // Create Second Demo User (Priya - Student)
    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active',
      phone: '+91 9822334455',
    });

    await FinancialProfile.create({
      user: priya._id,
      preferredCurrency: 'INR',
      monthlyBudget: 15000,
      savingsTargetMonthly: 4000,
      timezone: 'Asia/Kolkata',
    });

    console.log('[Seed] Seeding financial habits for Alex...');
    const habitsData = [
      {
        name: 'Record daily expenses before 9 PM',
        description: 'Log all cash, UPI, and card purchases made throughout the day.',
        frequency: 'daily',
        currentStreak: 12,
        longestStreak: 18,
        totalCompletions: 34,
        status: 'active',
      },
      {
        name: 'Weekly zero-spending day',
        description: 'Have at least one designated day per week with zero discretionary expenses.',
        frequency: 'weekly',
        currentStreak: 4,
        longestStreak: 6,
        totalCompletions: 12,
        status: 'active',
      },
      {
        name: 'Monthly emergency fund contribution',
        description: 'Transfer minimum ₹5,000 to emergency fund on salary credit date.',
        frequency: 'monthly',
        currentStreak: 5,
        longestStreak: 5,
        totalCompletions: 5,
        status: 'active',
      },
      {
        name: 'Review investment portfolio',
        description: 'Check index fund allocation and asset distribution monthly.',
        frequency: 'monthly',
        currentStreak: 3,
        longestStreak: 4,
        totalCompletions: 4,
        status: 'active',
      },
    ];

    const habits = [];
    for (const h of habitsData) {
      const habit = await FinancialHabit.create({
        ...h,
        user: alex._id,
      });
      habits.push(habit);
    }

    // Seed habit completions for past 12 days for daily habit
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const compDate = new Date();
      compDate.setDate(now.getDate() - i);
      const periodKey = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
      await HabitCompletion.create({
        user: alex._id,
        habit: habits[0]._id,
        periodKey,
        completedAt: compDate,
        notes: i === 0 ? 'Logged all 4 UPI expenses from today.' : '',
      });
    }

    console.log('[Seed] Seeding transactions for Alex...');
    const transactions = [
      // Current Month Incomes
      {
        type: 'income',
        amount: 65000,
        category: 'Salary',
        description: 'Monthly Tech Salary - Software Eng',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        paymentMethod: 'bank_transfer',
      },
      {
        type: 'income',
        amount: 12000,
        category: 'Freelance',
        description: 'UI/UX Design consulting milestone',
        date: new Date(now.getFullYear(), now.getMonth(), 8),
        paymentMethod: 'upi',
      },
      {
        type: 'income',
        amount: 2500,
        category: 'Dividend',
        description: 'Quarterly index fund dividend payout',
        date: new Date(now.getFullYear(), now.getMonth(), 14),
        paymentMethod: 'bank_transfer',
      },
      // Current Month Expenses
      {
        type: 'expense',
        amount: 18000,
        category: 'Rent',
        description: 'Apartment rent sharing',
        date: new Date(now.getFullYear(), now.getMonth(), 2),
        paymentMethod: 'bank_transfer',
      },
      {
        type: 'expense',
        amount: 5500,
        category: 'Food',
        description: 'Monthly groceries & supermarket haul',
        date: new Date(now.getFullYear(), now.getMonth(), 4),
        paymentMethod: 'upi',
      },
      {
        type: 'expense',
        amount: 2200,
        category: 'Utilities',
        description: 'Electricity & High-speed fiber internet',
        date: new Date(now.getFullYear(), now.getMonth(), 6),
        paymentMethod: 'upi',
      },
      {
        type: 'expense',
        amount: 1800,
        category: 'Transport',
        description: 'Metro smartcard recharge and cab rides',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        paymentMethod: 'upi',
      },
      {
        type: 'expense',
        amount: 3200,
        category: 'Food',
        description: 'Team dinner & weekend cafe visits',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        paymentMethod: 'card',
      },
      {
        type: 'expense',
        amount: 4500,
        category: 'Shopping',
        description: 'Ergonomic mouse & desk lighting',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        paymentMethod: 'card',
      },
      {
        type: 'expense',
        amount: 1200,
        category: 'Entertainment',
        description: 'Streaming service subscriptions',
        date: new Date(now.getFullYear(), now.getMonth(), 17),
        paymentMethod: 'card',
      },
      // Internal Transfer (Distinguished from consumption expense!)
      {
        type: 'expense',
        amount: 10000,
        category: 'Savings transfers',
        description: 'Monthly auto-transfer to High Yield Savings',
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        paymentMethod: 'bank_transfer',
        isInternalTransfer: true,
      },
    ];

    for (const tx of transactions) {
      await Transaction.create({
        ...tx,
        user: alex._id,
        currency: 'INR',
      });
    }

    console.log('[Seed] Seeding savings goals for Alex...');
    const goal1 = await SavingsGoal.create({
      user: alex._id,
      name: '6-Month Emergency Safety Fund',
      description: 'Buffer for unforeseen medical or job transition expenses.',
      targetAmount: 120000,
      currentAmount: 85000,
      currency: 'INR',
      targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 15),
      priority: 'high',
      category: 'Emergency Fund',
      status: 'in-progress',
    });

    await GoalTransaction.create({
      user: alex._id,
      goal: goal1._id,
      type: 'contribution',
      amount: 10000,
      balanceAfter: 85000,
      date: new Date(now.getFullYear(), now.getMonth(), 3),
      description: 'Monthly auto-savings transfer',
    });

    const goal2 = await SavingsGoal.create({
      user: alex._id,
      name: 'MacBook Pro M-Series Upgrade',
      description: 'High performance laptop for development and side projects.',
      targetAmount: 90000,
      currentAmount: 54000,
      currency: 'INR',
      targetDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
      priority: 'medium',
      category: 'Tech & Gadgets',
      status: 'in-progress',
    });

    await GoalTransaction.create({
      user: alex._id,
      goal: goal2._id,
      type: 'contribution',
      amount: 6000,
      balanceAfter: 54000,
      date: new Date(now.getFullYear(), now.getMonth(), 9),
      description: 'Freelance project savings allocation',
    });

    const goal3 = await SavingsGoal.create({
      user: alex._id,
      name: 'Goa Vacation Trip with College Friends',
      description: 'Weekend beach holiday and travel budget.',
      targetAmount: 25000,
      currentAmount: 25000,
      currency: 'INR',
      targetDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
      priority: 'low',
      category: 'Travel',
      status: 'completed',
    });

    console.log('[Seed] Seeding assets and liabilities for Alex...');
    const assets = [
      { name: 'Liquid Cash & Wallet', category: 'Cash', currentValue: 8500 },
      { name: 'HDFC Bank Salary Account', category: 'Bank Savings', currentValue: 64000 },
      { name: 'Fixed Deposit (Safe Yield)', category: 'Fixed Deposits', currentValue: 100000 },
      { name: 'Nifty 50 Index Mutual Fund', category: 'Investments', currentValue: 145000 },
      { name: 'Employee Provident Fund (EPF)', category: 'Retirement Savings', currentValue: 75000 },
    ];

    for (const a of assets) {
      await Asset.create({
        ...a,
        user: alex._id,
        currency: 'INR',
        valuationDate: now,
      });
    }

    const liabilities = [
      {
        name: 'ICICI Coral Credit Card',
        category: 'Credit Card Balance',
        outstandingAmount: 14200,
        interestRatePercent: 36,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 25),
      },
      {
        name: 'SBI Education Loan',
        category: 'Education Debt',
        outstandingAmount: 68000,
        interestRatePercent: 8.5,
      },
    ];

    for (const l of liabilities) {
      await Liability.create({
        ...l,
        user: alex._id,
        currency: 'INR',
        valuationDate: now,
      });
    }

    console.log('[Seed] Seeding dated historical net worth snapshots...');
    const historyMonths = [
      { offset: 5, assets: 320000, liab: 110000, nw: 210000 },
      { offset: 4, assets: 338000, liab: 105000, nw: 233000 },
      { offset: 3, assets: 355000, liab: 98000, nw: 257000 },
      { offset: 2, assets: 372000, liab: 91000, nw: 281000 },
      { offset: 1, assets: 385000, liab: 86000, nw: 299000 },
      { offset: 0, assets: 392500, liab: 82200, nw: 310300 },
    ];

    for (const h of historyMonths) {
      const snapDate = new Date(now.getFullYear(), now.getMonth() - h.offset, 28);
      const dateKey = `${snapDate.getFullYear()}-${String(snapDate.getMonth() + 1).padStart(2, '0')}`;
      await NetWorthSnapshot.create({
        user: alex._id,
        snapshotDate: snapDate,
        dateKey,
        totalAssets: h.assets,
        totalLiabilities: h.liab,
        netWorth: h.nw,
        currency: 'INR',
      });
    }

    console.log('[Seed] Seeding notifications for Alex...');
    await Notification.create([
      {
        user: alex._id,
        type: 'milestone',
        title: 'Goal Completed: Goa Vacation Trip!',
        message: 'Congratulations! You hit 100% of your target amount (₹25,000).',
        link: '/goals',
      },
      {
        user: alex._id,
        type: 'reminder',
        title: 'Daily Expense Check-in',
        message: 'You have a 12-day streak on daily expense logging! Keep going today.',
        link: '/habits',
      },
      {
        user: alex._id,
        type: 'warning',
        title: 'Credit Card Due in 5 Days',
        message: 'Your ICICI Coral statement balance of ₹14,200 is due soon.',
        link: '/wealth',
      },
    ]);

    console.log('[Seed] Seeding feedback and complaints...');
    await Feedback.create([
      {
        user: alex._id,
        userEmail: alex.email,
        category: 'feature_request',
        title: 'Recurring daily habit notifications',
        description: 'Would love web push notifications at 9 PM to remind me to log expenses.',
        priority: 'medium',
        status: 'in_review',
        resolutionNotes: 'Our engineering team is implementing Web Push Notifications for Phase 2.',
        internalNotes: 'User is highly engaged. Good candidate for beta testing push notifications.',
      },
      {
        user: priya._id,
        userEmail: priya.email,
        category: 'calculation_query',
        title: 'Question regarding savings rate formula',
        description: 'Are internal transfers to my mutual fund counted as expenses in the savings rate?',
        priority: 'low',
        status: 'resolved',
        resolutionNotes: 'No, internal savings transfers are excluded from consumption expenses so your savings rate reflects pure discretionary spending.',
        internalNotes: 'Verified documentation clearly states savings transfers are segregated.',
        resolvedAt: new Date(),
        resolvedBy: admin._id,
      },
    ]);

    console.log('[Seed] Recording audit log entry...');
    await AuditLog.create({
      actor: admin._id,
      actorEmail: admin.email,
      action: 'SYSTEM_SEEDED',
      resourceType: 'System',
      details: {
        adminCreated: admin.email,
        usersCreated: [alex.email, priya.email],
        environment: process.env.NODE_ENV || 'development',
      },
    });

    console.log('=======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('-------------------------------------------------------');
    console.log('👑 Admin Account:');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('👤 Demo User (Young Professional):');
    console.log('   Email:    alex@example.com');
    console.log('   Password: Password123!');
    console.log('🎓 Demo User (Student):');
    console.log('   Email:    priya@example.com');
    console.log('   Password: Password123!');
    console.log('=======================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Fatal: Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
