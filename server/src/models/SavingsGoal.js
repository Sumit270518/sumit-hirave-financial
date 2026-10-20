import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
      set: (val) => Math.round(val * 100) / 100,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
      set: (val) => Math.round(val * 100) / 100,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'paused', 'archived'],
      default: 'in-progress',
      index: true,
    },
    category: {
      type: String,
      enum: ['Emergency Fund', 'Tech & Gadgets', 'Education', 'Travel', 'Vehicle', 'Home', 'Investment', 'Other'],
      default: 'Emergency Fund',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function () {
  if (!this.targetAmount || this.targetAmount <= 0) return 0;
  const pct = (this.currentAmount / this.targetAmount) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
});

// Ensure virtuals are included in JSON output
savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
export default SavingsGoal;
