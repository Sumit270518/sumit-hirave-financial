import mongoose from 'mongoose';

export const LIABILITY_CATEGORIES = [
  'Personal Loan',
  'Credit Card Balance',
  'Education Debt',
  'Vehicle Loan',
  'Home Mortgage',
  'Family/Peer Loan',
  'Other Liabilities',
];

const liabilitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Liability name is required'],
      trim: true,
      maxlength: [100, 'Liability name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: LIABILITY_CATEGORIES,
      default: 'Credit Card Balance',
    },
    outstandingAmount: {
      type: Number,
      required: [true, 'Outstanding amount is required'],
      min: [0, 'Outstanding amount cannot be negative'],
      set: (val) => Math.round(val * 100) / 100,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    interestRatePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    valuationDate: {
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

liabilitySchema.index({ user: 1, category: 1 });

const Liability = mongoose.model('Liability', liabilitySchema);
export default Liability;
