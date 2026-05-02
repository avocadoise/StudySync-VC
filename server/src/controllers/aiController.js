const mongoose = require('mongoose');
const AIReviewer = require('../models/AIReviewer');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');
const FocusSession = require('../models/FocusSession');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const {
  generateReviewerFromNote,
  generateStudyRecommendation,
  validateAcademicInput
} = require('../services/aiService');

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

  const [
    subjects,
    pendingTasks,
    overdueTasks,
    highPriorityTasks,
    upcomingDeadlines,
    upcomingPlans,
    recentFocus
  ] = await Promise.all([
    Subject.find({ userId }).select('name code'),
    Task.find({ userId, status: { $in: ['Pending', 'In Progress', 'Overdue'] } })
      .populate('subjectId', 'name')
      .select('title priority dueDate status subjectId')
      .sort({ dueDate: 1 })
      .limit(20),
    Task.find({ userId, dueDate: { $lt: today }, status: { $ne: 'Completed' } })
      .populate('subjectId', 'name')
      .select('title priority dueDate status subjectId')
      .sort({ dueDate: 1 })
      .limit(10),
    Task.find({ userId, priority: { $in: ['High', 'Urgent'] }, status: { $ne: 'Completed' } })
      .populate('subjectId', 'name')
      .select('title priority dueDate status subjectId')
      .sort({ dueDate: 1 })
      .limit(10),
    Task.find({ userId, dueDate: { $gte: today }, status: { $ne: 'Completed' } })
      .populate('subjectId', 'name')
      .select('title priority dueDate status subjectId')
      .sort({ dueDate: 1 })
      .limit(10),
    StudyPlan.find({ userId, studyDate: { $gte: today } })
      .populate('subjectId', 'name')
      .select('topic studyDate startTime endTime status subjectId')
      .sort({ studyDate: 1, startTime: 1 })
      .limit(10),
    FocusSession.find({ userId })
      .populate('subjectId', 'name')
      .sort({ completedAt: -1 })
      .limit(10)
      .select('duration sessionType completedAt subjectId')
  ]);

  const snapshot = {
    subjects: subjects.map((subject) => ({
      name: subject.name,
      code: subject.code || ''
    })),
    pendingTasks: pendingTasks.map(formatTaskForAi),
    overdueTasks: overdueTasks.map(formatTaskForAi),
    highPriorityTasks: highPriorityTasks.map(formatTaskForAi),
    upcomingDeadlines: upcomingDeadlines.map(formatTaskForAi),
    studyPlans: upcomingPlans.map((plan) => ({
      subject: plan.subjectId?.name || 'Unknown subject',
      topic: plan.topic,
      studyDate: plan.studyDate,
      startTime: plan.startTime,
      endTime: plan.endTime,
      status: plan.status
    })),
    recentFocusSessions: recentFocus.map((session) => ({
      subject: session.subjectId?.name || 'Unknown subject',
      duration: session.duration,
      sessionType: session.sessionType,
      completedAt: session.completedAt
    }))
  };

  const recommendation = await generateStudyRecommendation(JSON.stringify(snapshot, null, 2));

  res.status(200).json({
    success: true,
    message: 'Study recommendation generated successfully',
    data: recommendation
  });
});

const formatTaskForAi = (task) => ({
  subject: task.subjectId?.name || 'Unknown subject',
  title: task.title,
  priority: task.priority,
  status: task.status,
  dueDate: task.dueDate
});

// @desc    Advisory AI input validation
// @route   POST /api/ai/validate-input
// @access  Private
const validateInput = asyncHandler(async (req, res, next) => {
  const moduleName = req.body.module;
  const inputData = req.body.data || req.body.inputData;
  const supportedModules = ['task', 'subject', 'note', 'studyPlan', 'focusSession'];

  if (!moduleName || !supportedModules.includes(moduleName)) {
    return next(new AppError('Please provide a supported module for AI validation', 400));
  }

  if (!inputData || typeof inputData !== 'object' || Array.isArray(inputData)) {
    return next(new AppError('Please provide input data to validate', 400));
  }

  const validation = await validateAcademicInput(moduleName, inputData);

  res.status(200).json({
    success: true,
    message: 'AI input validation completed',
    data: validation
  });
});

module.exports = {
  generateReviewer,
  getReviewers,
  getReviewer,
  deleteReviewer,
  getStudyRecommendation,
  validateInput
};
