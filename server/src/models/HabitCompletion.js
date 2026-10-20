import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinancialHabit',
      required: true,
      index: true,
    },
    periodKey: {
      type: String,
      required: [true, 'Period key is required (e.g. YYYY-MM-DD for daily, YYYY-Www for weekly, YYYY-MM for monthly)'],
      trim: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Crucial: unique compound index prevents duplicate completions for the same habit and period
habitCompletionSchema.index({ habit: 1, periodKey: 1 }, { unique: true });
habitCompletionSchema.index({ user: 1, completedAt: -1 });

const HabitCompletion = mongoose.model('HabitCompletion', habitCompletionSchema);
export default HabitCompletion;
