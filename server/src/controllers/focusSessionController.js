const mongoose = require('mongoose');
const FocusSession = require('../models/FocusSession');
const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Create a focus session
// @route   POST /api/focus-sessions
// @access  Private
const createFocusSession = asyncHandler(async (req, res, next) => {
  const { subjectId, duration, sessionType, completedAt } = req.body;

  if (!subjectId) {
    return next(new AppError('Please provide a subjectId', 400));
  }
  
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    return next(new AppError('Invalid Subject ID format', 400));
  }

  if (!duration || duration <= 0) {
    return next(new AppError('Duration is required and must be greater than 0', 400));
  }

  const validTypes = ['Pomodoro', 'Short Break', 'Long Break', 'Custom'];
  if (!sessionType || !validTypes.includes(sessionType)) {
    return next(new AppError('Please provide a valid session type', 400));
  }

  // Verify subject exists and belongs to user
  const subject = await Subject.findOne({ _id: subjectId, userId: req.user.id });
  if (!subject) {
    return next(new AppError('Subject not found or does not belong to you', 404));
  }

  const focusSession = await FocusSession.create({
    userId: req.user.id,
    subjectId,
    duration,
    sessionType,
    completedAt: completedAt || Date.now()
  });

  await focusSession.populate('subjectId', 'name color');

  res.status(201).json({
    success: true,
    message: 'Focus session created successfully',
    data: focusSession
  });
});

// @desc    Get all focus sessions
// @route   GET /api/focus-sessions
// @access  Private
const getFocusSessions = asyncHandler(async (req, res, next) => {
  const focusSessions = await FocusSession.find({ userId: req.user.id })
    .sort({ completedAt: -1 })
    .populate('subjectId', 'name color');

  res.status(200).json({
    success: true,
    message: 'Focus sessions retrieved successfully',
    data: focusSessions
  });
});

// @desc    Get focus session stats
// @route   GET /api/focus-sessions/stats
// @access  Private
const getFocusSessionStats = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Run aggregations and count concurrently
  const [totals, subjectStats, sessionsThisWeek] = await Promise.all([
    FocusSession.aggregate([
      { $match: { userId } },
      { 
        $group: { 
          _id: null, 
          totalSessions: { $sum: 1 }, 
          totalFocusMinutes: { $sum: "$duration" } 
        } 
      }
    ]),
    FocusSession.aggregate([
      { $match: { userId, sessionType: { $ne: 'Short Break' } } }, // Assuming breaks don't count for actual study focus stats, but let's include all requested by prompt or refine. Just group.
      { $group: { _id: "$subjectId", focusMinutes: { $sum: "$duration" } } },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
      { $unwind: "$subject" },
      { 
        $project: { 
          subjectId: "$_id", 
          subjectName: "$subject.name", 
          focusMinutes: 1, 
          _id: 0 
        } 
      },
      { $sort: { focusMinutes: -1 } }
    ]),
    FocusSession.countDocuments({
      userId: req.user.id,
      completedAt: { $gte: oneWeekAgo }
    })
  ]);

  const totalFocusMinutes = totals.length > 0 ? totals[0].totalFocusMinutes : 0;
  const totalSessions = totals.length > 0 ? totals[0].totalSessions : 0;

  res.status(200).json({
    success: true,
    message: 'Focus session stats retrieved successfully',
    data: {
      totalFocusMinutes,
      totalSessions,
      focusMinutesBySubject: subjectStats,
      sessionsThisWeek
    }
  });
});

// @desc    Delete a focus session
// @route   DELETE /api/focus-sessions/:id
// @access  Private
const deleteFocusSession = asyncHandler(async (req, res, next) => {
  const focusSession = await FocusSession.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!focusSession) {
    return next(new AppError('Focus session not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Focus session deleted successfully',
    data: {}
  });
});

module.exports = {
  createFocusSession,
  getFocusSessions,
  getFocusSessionStats,
  deleteFocusSession
};