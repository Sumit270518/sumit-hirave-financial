import mongoose from 'mongoose';

const netWorthSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    snapshotDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateKey: {
      type: String, // e.g. "2026-10" or "2026-10-21"
      required: true,
    },
    totalAssets: {
      type: Number,
      required: true,
      min: 0,
      set: (val) => Math.round(val * 100) / 100,
    },
    totalLiabilities: {
      type: Number,
      required: true,
      min: 0,
      set: (val) => Math.round(val * 100) / 100,
    },
    netWorth: {
      type: Number,
      required: true,
      set: (val) => Math.round(val * 100) / 100,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    assetBreakdown: [
      {
        category: String,
        amount: Number,
      },
    ],
    liabilityBreakdown: [
      {
        category: String,
        amount: Number,
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

netWorthSnapshotSchema.index({ user: 1, dateKey: 1 }, { unique: true });
netWorthSnapshotSchema.index({ user: 1, snapshotDate: -1 });

const NetWorthSnapshot = mongoose.model('NetWorthSnapshot', netWorthSnapshotSchema);
export default NetWorthSnapshot;
