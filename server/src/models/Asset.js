import mongoose from 'mongoose';

export const ASSET_CATEGORIES = [
  'Cash',
  'Bank Savings',
  'Fixed Deposits',
  'Investments',
  'Retirement Savings',
  'Property',
  'Gold & Precious Metals',
  'Other Assets',
];

const assetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [100, 'Asset name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ASSET_CATEGORIES,
      default: 'Bank Savings',
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Asset value cannot be negative'],
      set: (val) => Math.round(val * 100) / 100,
    },
    currency: {
      type: String,
      default: 'INR',
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

assetSchema.index({ user: 1, category: 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
