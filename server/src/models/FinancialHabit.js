import mongoose from 'mongoose';

const financialHabitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: [true, 'Frequency is required'],
      default: 'daily',
    },
    targetCountPerPeriod: {
      type: Number,
      default: 1,
      min: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    reminderTime: {
      type: String, // e.g. "20:00"
      default: '20:00',
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'archived'],
      default: 'active',
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCompletedPeriod: {
      type: String, // e.g., '2026-10-21'
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

financialHabitSchema.index({ user: 1, status: 1 });

const FinancialHabit = mongoose.model('FinancialHabit', financialHabitSchema);
export default FinancialHabit;
