import mongoose from 'mongoose';

const goalTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['contribution', 'withdrawal', 'adjustment'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
      set: (val) => Math.round(val * 100) / 100,
    },
    balanceAfter: {
      type: Number,
      required: true,
      set: (val) => Math.round(val * 100) / 100,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

goalTransactionSchema.index({ goal: 1, date: -1 });

const GoalTransaction = mongoose.model('GoalTransaction', goalTransactionSchema);
export default GoalTransaction;
