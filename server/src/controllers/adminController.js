import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import FinancialHabit from '../models/FinancialHabit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Asset from '../models/Asset.js';
import Liability from '../models/Liability.js';
import Feedback from '../models/Feedback.js';
import AuditLog from '../models/AuditLog.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalTransactions,
      totalHabits,
      totalCompletions,
      totalGoals,
      totalAssets,
      totalLiabilities,
      totalFeedback,
      pendingFeedback,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'active' }),
      User.countDocuments({ role: 'user', status: 'suspended' }),
      Transaction.countDocuments(),
      FinancialHabit.countDocuments(),
      HabitCompletion.countDocuments(),
      SavingsGoal.countDocuments(),
      Asset.countDocuments(),
      Liability.countDocuments(),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
    ]);

    // Registration trend by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        records: {
          transactions: totalTransactions,
          habits: totalHabits,
          completions: totalCompletions,
          goals: totalGoals,
          assets: totalAssets,
          liabilities: totalLiabilities,
          totalFinancialRecords: totalTransactions + totalHabits + totalGoals + totalAssets + totalLiabilities,
        },
        feedback: {
          total: totalFeedback,
          pending: pendingFeedback,
        },
        registrationTrend: userRegistrations.map((u) => ({
          period: `${u._id.year}-${String(u._id.month).padStart(2, '0')}`,
          count: u.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: { $ne: 'admin' } }; // Filter standard users

    if (status && ['active', 'suspended'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const { id } = req.params;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "suspended".',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify status of an administrator.',
      });
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    // Log administrative action
    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      details: {
        targetUserEmail: user.email,
        previousStatus,
        newStatus: status,
        reason: reason || 'Administrative action',
      },
    });

    res.status(200).json({
      success: true,
      message: `User account has been ${status === 'suspended' ? 'suspended' : 'reactivated'}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedback = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [feedbackList, total] = await Promise.all([
      Feedback.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Feedback.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: feedbackList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedback = async (req, res, next) => {
  try {
    const { status, resolutionNotes, internalNotes } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback entry not found.' });
    }

    if (status) feedback.status = status;
    if (resolutionNotes !== undefined) feedback.resolutionNotes = resolutionNotes.trim();
    if (internalNotes !== undefined) feedback.internalNotes = internalNotes.trim();

    if (status === 'resolved') {
      feedback.resolvedAt = new Date();
      feedback.resolvedBy = req.user._id;
    }

    await feedback.save();

    // Log resolution action
    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'FEEDBACK_UPDATED',
      resourceType: 'Feedback',
      resourceId: feedback._id.toString(),
      details: {
        status: feedback.status,
        resolutionNotesLength: feedback.resolutionNotes.length,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully.',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};
