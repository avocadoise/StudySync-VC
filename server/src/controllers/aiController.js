const mongoose = require('mongoose');
const AIReviewer = require('../models/AIReviewer');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');
const FocusSession = require('../models/FocusSession');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { generateReviewerFromNote, generateStudyRecommendation } = require('../services/aiService');

// @desc    Generate a new AI Reviewer from a Note
// @route   POST /api/ai/generate-reviewer
// @access  Private
const generateReviewer = asyncHandler(async (req, res, next) => {
  const { noteId } = req.body;

  if (!noteId) {
    return next(new AppError('Please provide a noteId', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid Note ID format', 400));
  }

  // Find the note and ensure it belongs to the logged-in user
  const note = await Note.findOne({ _id: noteId, userId: req.user.id });
  if (!note) {
    return next(new AppError('Note not found or unauthorized', 404));
  }

  // Optionally check if a reviewer already exists for this note to prevent duplicates
  // const existingReviewer = await AIReviewer.findOne({ noteId, userId: req.user.id });
  // if (existingReviewer) {
  //   return res.status(200).json({ success: true, message: 'Reviewer already exists', data: existingReviewer });
  // }

  // Offload logic to the AI Service
  const generatedData = await generateReviewerFromNote(note.title, note.content);

  // Save the result securely mapping ownership
  const newReviewer = await AIReviewer.create({
    userId: req.user.id,
    subjectId: note.subjectId,
    noteId: note._id,
    summary: generatedData.summary || '',
    keyTerms: generatedData.keyTerms || [],
    questions: generatedData.questions || [],
    flashcards: generatedData.flashcards || []
  });

  await newReviewer.populate([
    { path: 'subjectId', select: 'name color' },
    { path: 'noteId', select: 'title' }
  ]);

  res.status(201).json({
    success: true,
    message: 'AI Reviewer generated successfully',
    data: newReviewer
  });
});

// @desc    Get all AI Reviewers
// @route   GET /api/ai/reviewers
// @access  Private
const getReviewers = asyncHandler(async (req, res, next) => {
  const reviewers = await AIReviewer.find({ userId: req.user.id })
    .populate('subjectId', 'name color')
    .populate('noteId', 'title tags')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'AI Reviewers retrieved successfully',
    data: reviewers
  });
});

// @desc    Get single AI Reviewer
// @route   GET /api/ai/reviewers/:id
// @access  Private
const getReviewer = asyncHandler(async (req, res, next) => {
  const reviewer = await AIReviewer.findOne({
    _id: req.params.id,
    userId: req.user.id
  })
    .populate('subjectId', 'name color')
    .populate('noteId', 'title content');

  if (!reviewer) {
    return next(new AppError('AI Reviewer not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'AI Reviewer retrieved successfully',
    data: reviewer
  });
});

// @desc    Delete an AI Reviewer
// @route   DELETE /api/ai/reviewers/:id
// @access  Private
const deleteReviewer = asyncHandler(async (req, res, next) => {
  const reviewer = await AIReviewer.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!reviewer) {
    return next(new AppError('AI Reviewer not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'AI Reviewer deleted successfully',
    data: {}
  });
});

// @desc    Generate AI Study Recommendation based on data snapshot
// @route   POST /api/ai/study-recommendation
// @access  Private
const getStudyRecommendation = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Gather User's Academic Data Concurrently
  const [subjects, pendingTasks, overdueTasks, upcomingPlans, recentFocus] = await Promise.all([
    Subject.find({ userId }).select('name'),
    Task.find({ userId, status: { $ne: 'Completed' } }).select('title priority dueDate status').sort({ priority: -1, dueDate: 1 }),
    Task.find({ userId, dueDate: { $lt: today }, status: { $ne: 'Completed' } }).select('title priority dueDate'),
    StudyPlan.find({ userId, studyDate: { $gte: today } }).populate('subjectId', 'name').select('topic studyDate startTime endTime status'),
    FocusSession.find({ userId }).populate('subjectId', 'name').sort({ completedAt: -1 }).limit(5).select('duration sessionType')
  ]);

  // 2. Format a concise summary
  const summaryParts = [];
  
  if (subjects.length === 0) {
    summaryParts.push('Student has no subjects defined yet.');
  } else {
    summaryParts.push(`Currently studying ${subjects.length} subjects: ${subjects.map(s => s.name).join(', ')}.`);
  }

  summaryParts.push(`Total pending tasks: ${pendingTasks.length}.`);
  const highPriority = pendingTasks.filter(t => t.priority === 'High');
  if (highPriority.length > 0) {
    summaryParts.push(`${highPriority.length} of these tasks are High priority.`);
  }
  if (overdueTasks.length > 0) {
    summaryParts.push(`WARNING: The student has ${overdueTasks.length} overdue tasks.`);
  }

  if (upcomingPlans.length > 0) {
    summaryParts.push(`There are ${upcomingPlans.length} upcoming study plans scheduled.`);
  } else {
    summaryParts.push('The student currently has no study plans scheduled.');
  }

  if (recentFocus.length > 0) {
    summaryParts.push(`Recently completed focus sessions: ${recentFocus.map(f => `${f.duration}m on ${f.subjectId?.name || 'unknown subject'}`).join(', ')}.`);
  }

  const snapshotString = summaryParts.join('\n');

  // 3. Send securely to AI Service
  const recommendation = await generateStudyRecommendation(snapshotString);

  res.status(200).json({
    success: true,
    message: 'Study recommendation generated successfully',
    data: recommendation
  });
});

module.exports = {
  generateReviewer,
  getReviewers,
  getReviewer,
  deleteReviewer,
  getStudyRecommendation
};