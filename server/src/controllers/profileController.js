import User from '../models/User.js';
import FinancialProfile from '../models/FinancialProfile.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = await FinancialProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await FinancialProfile.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      preferredCurrency,
      monthlyBudget,
      savingsTargetMonthly,
      timezone,
      notificationPreferences,
      theme,
    } = req.body;

    // Update user details
    const user = await User.findById(req.user._id);
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    await user.save();

    // Update or create financial profile
    let profile = await FinancialProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new FinancialProfile({ user: req.user._id });
    }

    if (preferredCurrency) profile.preferredCurrency = preferredCurrency;
    if (monthlyBudget !== undefined && monthlyBudget >= 0) profile.monthlyBudget = Number(monthlyBudget);
    if (savingsTargetMonthly !== undefined && savingsTargetMonthly >= 0) {
      profile.savingsTargetMonthly = Number(savingsTargetMonthly);
    }
    if (timezone) profile.timezone = timezone;
    if (notificationPreferences) {
      profile.notificationPreferences = {
        ...profile.notificationPreferences,
        ...notificationPreferences,
      };
    }
    if (theme) profile.theme = theme;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
