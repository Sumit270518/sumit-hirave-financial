import Asset, { ASSET_CATEGORIES } from '../models/Asset.js';
import Liability, { LIABILITY_CATEGORIES } from '../models/Liability.js';
import NetWorthSnapshot from '../models/NetWorthSnapshot.js';

// Helper to update current month's net worth snapshot
export const syncNetWorthSnapshot = async (userId) => {
  try {
    const assets = await Asset.find({ user: userId });
    const liabilities = await Liability.find({ user: userId });

    const assetCategories = {};
    let totalAssets = 0;
    assets.forEach((a) => {
      totalAssets += a.currentValue;
      assetCategories[a.category] = (assetCategories[a.category] || 0) + a.currentValue;
    });

    const liabilityCategories = {};
    let totalLiabilities = 0;
    liabilities.forEach((l) => {
      totalLiabilities += l.outstandingAmount;
      liabilityCategories[l.category] = (liabilityCategories[l.category] || 0) + l.outstandingAmount;
    });

    totalAssets = Math.round(totalAssets * 100) / 100;
    totalLiabilities = Math.round(totalLiabilities * 100) / 100;
    const netWorth = Math.round((totalAssets - totalLiabilities) * 100) / 100;

    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const assetBreakdown = Object.entries(assetCategories).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
    }));

    const liabilityBreakdown = Object.entries(liabilityCategories).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
    }));

    await NetWorthSnapshot.findOneAndUpdate(
      { user: userId, dateKey },
      {
        user: userId,
        snapshotDate: now,
        dateKey,
        totalAssets,
        totalLiabilities,
        netWorth,
        assetBreakdown,
        liabilityBreakdown,
      },
      { upsert: true, new: true }
    );

    return { totalAssets, totalLiabilities, netWorth, assetBreakdown, liabilityBreakdown };
  } catch (error) {
    console.error('Snapshot sync error:', error);
  }
};

// ================= ASSETS =================

export const getAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find({ user: req.user._id }).sort({ currentValue: -1 });
    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req, res, next) => {
  try {
    const { name, category, currentValue, currency = 'INR', valuationDate, notes } = req.body;

    if (!name || currentValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Asset name and current value are required.',
      });
    }

    const numVal = Number(currentValue);
    if (isNaN(numVal) || numVal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Asset value must be a positive number or zero.',
      });
    }

    const asset = await Asset.create({
      user: req.user._id,
      name: name.trim(),
      category: category || 'Bank Savings',
      currentValue: Math.round(numVal * 100) / 100,
      currency,
      valuationDate: valuationDate ? new Date(valuationDate) : new Date(),
      notes: notes ? notes.trim() : '',
    });

    await syncNetWorthSnapshot(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Asset added successfully.',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    if (asset.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { name, category, currentValue, currency, valuationDate, notes } = req.body;

    if (name) asset.name = name.trim();
    if (category) asset.category = category;
    if (currentValue !== undefined) {
      const numVal = Number(currentValue);
      if (isNaN(numVal) || numVal < 0) {
        return res.status(400).json({ success: false, message: 'Value cannot be negative.' });
      }
      asset.currentValue = Math.round(numVal * 100) / 100;
    }
    if (currency) asset.currency = currency;
    if (valuationDate) asset.valuationDate = new Date(valuationDate);
    if (notes !== undefined) asset.notes = notes.trim();

    await asset.save();
    await syncNetWorthSnapshot(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully.',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    if (asset.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await asset.deleteOne();
    await syncNetWorthSnapshot(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ================= LIABILITIES =================

export const getLiabilities = async (req, res, next) => {
  try {
    const liabilities = await Liability.find({ user: req.user._id }).sort({ outstandingAmount: -1 });
    res.status(200).json({
      success: true,
      data: liabilities,
    });
  } catch (error) {
    next(error);
  }
};

export const createLiability = async (req, res, next) => {
  try {
    const {
      name,
      category,
      outstandingAmount,
      currency = 'INR',
      interestRatePercent = 0,
      dueDate,
      valuationDate,
      notes,
    } = req.body;

    if (!name || outstandingAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Liability name and outstanding amount are required.',
      });
    }

    const numVal = Number(outstandingAmount);
    if (isNaN(numVal) || numVal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Outstanding amount cannot be negative.',
      });
    }

    const liability = await Liability.create({
      user: req.user._id,
      name: name.trim(),
      category: category || 'Credit Card Balance',
      outstandingAmount: Math.round(numVal * 100) / 100,
      currency,
      interestRatePercent: Number(interestRatePercent) || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      valuationDate: valuationDate ? new Date(valuationDate) : new Date(),
      notes: notes ? notes.trim() : '',
    });

    await syncNetWorthSnapshot(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Liability recorded successfully.',
      data: liability,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLiability = async (req, res, next) => {
  try {
    const liability = await Liability.findById(req.params.id);

    if (!liability) {
      return res.status(404).json({ success: false, message: 'Liability not found.' });
    }

    if (liability.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const {
      name,
      category,
      outstandingAmount,
      currency,
      interestRatePercent,
      dueDate,
      valuationDate,
      notes,
    } = req.body;

    if (name) liability.name = name.trim();
    if (category) liability.category = category;
    if (outstandingAmount !== undefined) {
      const numVal = Number(outstandingAmount);
      if (isNaN(numVal) || numVal < 0) {
        return res.status(400).json({ success: false, message: 'Amount cannot be negative.' });
      }
      liability.outstandingAmount = Math.round(numVal * 100) / 100;
    }
    if (currency) liability.currency = currency;
    if (interestRatePercent !== undefined) liability.interestRatePercent = Number(interestRatePercent) || 0;
    if (dueDate !== undefined) liability.dueDate = dueDate ? new Date(dueDate) : null;
    if (valuationDate) liability.valuationDate = new Date(valuationDate);
    if (notes !== undefined) liability.notes = notes.trim();

    await liability.save();
    await syncNetWorthSnapshot(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Liability updated successfully.',
      data: liability,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLiability = async (req, res, next) => {
  try {
    const liability = await Liability.findById(req.params.id);

    if (!liability) {
      return res.status(404).json({ success: false, message: 'Liability not found.' });
    }

    if (liability.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await liability.deleteOne();
    await syncNetWorthSnapshot(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Liability deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ================= WEALTH SUMMARY & SNAPSHOTS =================

export const getWealthSummary = async (req, res, next) => {
  try {
    const [assets, liabilities, snapshots] = await Promise.all([
      Asset.find({ user: req.user._id }),
      Liability.find({ user: req.user._id }),
      NetWorthSnapshot.find({ user: req.user._id }).sort({ snapshotDate: -1 }).limit(12),
    ]);

    let totalAssets = 0;
    const assetCategories = {};
    assets.forEach((a) => {
      totalAssets += a.currentValue;
      assetCategories[a.category] = (assetCategories[a.category] || 0) + a.currentValue;
    });

    let totalLiabilities = 0;
    const liabilityCategories = {};
    liabilities.forEach((l) => {
      totalLiabilities += l.outstandingAmount;
      liabilityCategories[l.category] = (liabilityCategories[l.category] || 0) + l.outstandingAmount;
    });

    totalAssets = Math.round(totalAssets * 100) / 100;
    totalLiabilities = Math.round(totalLiabilities * 100) / 100;
    const netWorth = Math.round((totalAssets - totalLiabilities) * 100) / 100;

    const assetAllocation = Object.entries(assetCategories).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalAssets > 0 ? Math.round((amount / totalAssets) * 1000) / 10 : 0,
    }));

    const liabilityAllocation = Object.entries(liabilityCategories).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalLiabilities > 0 ? Math.round((amount / totalLiabilities) * 1000) / 10 : 0,
    }));

    // Previous month net worth comparison
    const previousSnapshot = snapshots.length > 1 ? snapshots[1] : null;
    const monthlyNetWorthChange = previousSnapshot
      ? Math.round((netWorth - previousSnapshot.netWorth) * 100) / 100
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        totalLiabilities,
        netWorth,
        monthlyNetWorthChange,
        assetAllocation,
        liabilityAllocation,
        assetCount: assets.length,
        liabilityCount: liabilities.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWealthHistory = async (req, res, next) => {
  try {
    const snapshots = await NetWorthSnapshot.find({ user: req.user._id })
      .sort({ snapshotDate: 1 })
      .limit(24);

    res.status(200).json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    next(error);
  }
};

export const captureSnapshot = async (req, res, next) => {
  try {
    const result = await syncNetWorthSnapshot(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Net worth snapshot captured successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
