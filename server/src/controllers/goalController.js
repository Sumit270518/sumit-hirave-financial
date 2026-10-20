import SavingsGoal from '../models/SavingsGoal.js';
import GoalTransaction from '../models/GoalTransaction.js';

export const getGoals = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const goals = await SavingsGoal.find(filter).sort({ targetDate: 1 });

    const enrichedGoals = goals.map((goal) => {
      const g = goal.toJSON();
      const remainingAmount = Math.max(0, Math.round((g.targetAmount - g.currentAmount) * 100) / 100);
      const daysRemaining = Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      return {
        ...g,
        remainingAmount,
        daysRemaining: isNaN(daysRemaining) ? 0 : daysRemaining,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedGoals,
    });
  } catch (error) {
    next(error);
  }
};

export const getGoalById = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal.',
      });
    }

    const transactions = await GoalTransaction.find({ goal: goal._id }).sort({ date: -1 });

    const g = goal.toJSON();
    const remainingAmount = Math.max(0, Math.round((g.targetAmount - g.currentAmount) * 100) / 100);

    res.status(200).json({
      success: true,
      data: {
        ...g,
        remainingAmount,
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const {
      name,
      description,
      targetAmount,
      targetDate,
      priority = 'medium',
      category = 'Emergency Fund',
      currency = 'INR',
    } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Goal name, target amount, and target date are required.',
      });
    }

    const numTarget = Number(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be a positive number.',
      });
    }

    const parsedTargetDate = new Date(targetDate);
    if (isNaN(parsedTargetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target date format.',
      });
    }

    const goal = await SavingsGoal.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      targetAmount: Math.round(numTarget * 100) / 100,
      currentAmount: 0,
      currency,
      targetDate: parsedTargetDate,
      priority,
      category,
      status: 'in-progress',
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this goal.',
      });
    }

    const { name, description, targetAmount, targetDate, priority, status, category } = req.body;

    if (name) goal.name = name.trim();
    if (description !== undefined) goal.description = description.trim();
    if (targetAmount !== undefined) {
      const numTarget = Number(targetAmount);
      if (isNaN(numTarget) || numTarget <= 0) {
        return res.status(400).json({ success: false, message: 'Target amount must be positive.' });
      }
      goal.targetAmount = Math.round(numTarget * 100) / 100;
    }
    if (targetDate) {
      const pDate = new Date(targetDate);
      if (isNaN(pDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid target date.' });
      }
      goal.targetDate = pDate;
    }
    if (priority) goal.priority = priority;
    if (status) goal.status = status;
    if (category) goal.category = category;

    // Check if goal reached target
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'in-progress') {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal.',
      });
    }

    await GoalTransaction.deleteMany({ goal: goal._id });
    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal and contribution history deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const recordContribution = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to record contributions for this goal.',
      });
    }

    const { type = 'contribution', amount, description, date } = req.body;

    if (!['contribution', 'withdrawal'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "contribution" or "withdrawal".',
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero.',
      });
    }

    const roundedAmount = Math.round(numAmount * 100) / 100;

    let newBalance = goal.currentAmount;
    if (type === 'contribution') {
      newBalance = Math.round((goal.currentAmount + roundedAmount) * 100) / 100;
    } else if (type === 'withdrawal') {
      if (goal.currentAmount < roundedAmount) {
        return res.status(400).json({
          success: false,
          message: `Cannot withdraw ₹${roundedAmount}. Current saved balance is only ₹${goal.currentAmount}.`,
        });
      }
      newBalance = Math.round((goal.currentAmount - roundedAmount) * 100) / 100;
    }

    // Atomic update
    goal.currentAmount = newBalance;
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'in-progress') {
      goal.status = 'completed';
    } else if (goal.currentAmount < goal.targetAmount && goal.status === 'completed') {
      goal.status = 'in-progress';
    }
    await goal.save();

    const goalTx = await GoalTransaction.create({
      user: req.user._id,
      goal: goal._id,
      type,
      amount: roundedAmount,
      balanceAfter: newBalance,
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : (type === 'contribution' ? 'Goal contribution' : 'Goal withdrawal'),
    });

    res.status(201).json({
      success: true,
      message: `${type === 'contribution' ? 'Contribution recorded!' : 'Withdrawal recorded.'}`,
      data: {
        goal,
        transaction: goalTx,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGoalHistory = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this goal history.',
      });
    }

    const transactions = await GoalTransaction.find({ goal: goal._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
