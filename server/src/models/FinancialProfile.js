import mongoose from 'mongoose';

const financialProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredCurrency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },
    monthlyBudget: {
      type: Number,
      default: 0,
      min: [0, 'Monthly budget cannot be negative'],
    },
    savingsTargetMonthly: {
      type: Number,
      default: 0,
      min: [0, 'Monthly savings target cannot be negative'],
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    notificationPreferences: {
      emailReminders: { type: Boolean, default: true },
      inAppNotifications: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      habitReminders: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
  },
  {
    timestamps: true,
  }
);

const FinancialProfile = mongoose.model('FinancialProfile', financialProfileSchema);
export default FinancialProfile;
