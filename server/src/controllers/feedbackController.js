import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const { category, title, description, priority = 'medium' } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      userEmail: req.user.email,
      category: category || 'general',
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping us improve!',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedback = async (req, res, next) => {
  try {
    // Exclude internalNotes from non-admin view
    const feedbacks = await Feedback.find({ user: req.user._id })
      .select('-internalNotes')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
