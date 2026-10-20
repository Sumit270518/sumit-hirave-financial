import FinancialHabit from '../models/FinancialHabit.js';
import HabitCompletion from '../models/HabitCompletion.js';

// Helper to calculate period key based on frequency and date
export const getPeriodKey = (date, frequency) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  if (frequency === 'daily') {
    return `${year}-${month}-${day}`;
  }

  if (frequency === 'monthly') {
    return `${year}-${month}`;
  }

  if (frequency === 'weekly') {
    // ISO week number
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const week = 1 + Math.ceil((firstThursday - target) / 604800000);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  return `${year}-${month}-${day}`;
};

export const getHabits = async (req, res, next) => {
  try {
    const { status = 'active' } = req.query;
    const filter = { user: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const habits = await FinancialHabit.find(filter).sort({ createdAt: -1 });

    // Fetch completion status for current period for each habit
    const today = new Date();
    const habitIds = habits.map((h) => h._id);

    const completionMap = {};
    for (const habit of habits) {
      const currentPeriodKey = getPeriodKey(today, habit.frequency);
      const isCompleted = await HabitCompletion.exists({
        habit: habit._id,
        periodKey: currentPeriodKey,
      });
      completionMap[habit._id.toString()] = {
        isCompletedToday: Boolean(isCompleted),
        currentPeriodKey,
      };
    }

    const habitsWithStatus = habits.map((habit) => {
      const hObj = habit.toObject();
      const statusInfo = completionMap[habit._id.toString()] || { isCompletedToday: false };
      hObj.isCompleted = statusInfo.isCompletedToday;
      hObj.currentPeriodKey = statusInfo.currentPeriodKey;
      return hObj;
    });

    res.status(200).json({
      success: true,
      data: habitsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const createHabit = async (req, res, next) => {
  try {
    const {
      name,
      description,
      frequency = 'daily',
      targetCountPerPeriod = 1,
      startDate,
      endDate,
      reminderTime,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Habit name is required.',
      });
    }

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Frequency must be daily, weekly, or monthly.',
      });
    }

    const habit = await FinancialHabit.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      frequency,
      targetCountPerPeriod: Number(targetCountPerPeriod) || 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      reminderTime: reminderTime || '20:00',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Financial habit created successfully.',
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const habit = await FinancialHabit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found.',
      });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this habit.',
      });
    }

    const { name, description, frequency, status, reminderTime, endDate } = req.body;

    if (name) habit.name = name.trim();
    if (description !== undefined) habit.description = description.trim();
    if (frequency && ['daily', 'weekly', 'monthly'].includes(frequency)) {
      habit.frequency = frequency;
    }
    if (status && ['active', 'paused', 'archived'].includes(status)) {
      habit.status = status;
    }
    if (reminderTime) habit.reminderTime = reminderTime;
    if (endDate !== undefined) habit.endDate = endDate ? new Date(endDate) : null;

    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully.',
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await FinancialHabit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found.',
      });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this habit.',
      });
    }

    // Delete associated completions
    await HabitCompletion.deleteMany({ habit: habit._id });
    await habit.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Habit and associated completions removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const recordHabitCompletion = async (req, res, next) => {
  try {
    const habit = await FinancialHabit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found.',
      });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this habit.',
      });
    }

    const { date, notes } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const periodKey = getPeriodKey(targetDate, habit.frequency);

    // Check if already completed for this period
    const existing = await HabitCompletion.findOne({
      habit: habit._id,
      periodKey,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Habit is already marked as completed for period: ${periodKey}.`,
      });
    }

    // Create completion record
    const completion = await HabitCompletion.create({
      user: req.user._id,
      habit: habit._id,
      periodKey,
      completedAt: targetDate,
      notes: notes ? notes.trim() : '',
    });

    // Update streak and counters
    const newStreak = habit.currentStreak + 1;
    habit.currentStreak = newStreak;
    habit.longestStreak = Math.max(habit.longestStreak, newStreak);
    habit.totalCompletions += 1;
    habit.lastCompletedPeriod = periodKey;
    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Great job! Habit marked as completed.',
      data: {
        completion,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const undoHabitCompletion = async (req, res, next) => {
  try {
    const habit = await FinancialHabit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found.',
      });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this habit.',
      });
    }

    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const periodKey = getPeriodKey(targetDate, habit.frequency);

    const completion = await HabitCompletion.findOneAndDelete({
      habit: habit._id,
      periodKey,
    });

    if (!completion) {
      return res.status(404).json({
        success: false,
        message: 'No completion record found for this period to undo.',
      });
    }

    // Adjust streak safely
    habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit completion undone.',
      data: {
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitHistory = async (req, res, next) => {
  try {
    const habit = await FinancialHabit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found.',
      });
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this habit history.',
      });
    }

    const completions = await HabitCompletion.find({ habit: habit._id })
      .sort({ completedAt: -1 })
      .limit(60);

    res.status(200).json({
      success: true,
      data: {
        habit,
        completions,
      },
    });
  } catch (error) {
    next(error);
  }
};
