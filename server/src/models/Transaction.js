import mongoose from 'mongoose';

export const INCOME_CATEGORIES = [
  'Salary',
  'Internship',
  'Freelance',
  'Business',
  'Interest',
  'Dividend',
  'Gift',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Education',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Investments',
  'Savings transfers',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
      set: (val) => Math.round(val * 100) / 100, // Normalize to 2 decimal places
    },
    currency: {
      type: String,
      default: 'INR',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
      default: 'upi',
    },
    isInternalTransfer: {
      type: Boolean,
      default: false,
      // Internal transfers (e.g., transfers to savings accounts or mutual funds)
      // are excluded from regular consumption expense totals to avoid double counting.
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user transaction date range queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
