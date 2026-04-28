const mongoose = require('mongoose');
const StudyPlan = require('../models/StudyPlan');
const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Helper to validate time (assumes HH:mm format)
const isTimeValid = (start, end) => {
  return start < end;
};

// @desc    Create a new study plan
// @route   POST /api/study-plans
// @access  Private
const createStudyPlan = asyncHandler(async (req, res, next) => {
  const { subjectId, topic, studyDate, startTime, endTime, notes, status } = req.body;

  if (!topic || topic.trim() === '') {
    return next(new AppError('Please provide a topic', 400));
  }
  if (!studyDate) {
    return next(new AppError('Please provide a study date', 400));
  }
  if (!startTime) {
    return next(new AppError('Please provide a start time', 400));
  }
  if (!endTime) {
    return next(new AppError('Please provide an end time', 400));
  }

  // Validate time logic
  if (!isTimeValid(startTime, endTime)) {
    return next(new AppError('End time must be after start time', 400));
  }

  if (!subjectId) {
    return next(new AppError('Please provide a subjectId', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    return next(new AppError('Invalid Subject ID format', 400));
  }

  const subject = await Subject.findOne({ _id: subjectId, userId: req.user.id });
  if (!subject) {
    return next(new AppError('Subject not found or does not belong to you', 404));
  }

  const studyPlan = await StudyPlan.create({
    userId: req.user.id,
    subjectId,
    topic,
    studyDate,
    startTime,
    endTime,
    notes,
    status
  });

  await studyPlan.populate('subjectId', 'name color');

  res.status(201).json({
    success: true,
    message: 'Study plan created successfully',
    data: studyPlan,
  });
});

// @desc    Get all study plans for logged-in user
// @route   GET /api/study-plans
// @access  Private
const getStudyPlans = asyncHandler(async (req, res, next) => {
  const { date, subjectId, status } = req.query;

  const query = { userId: req.user.id };

  if (status) query.status = status;

  if (subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return next(new AppError('Invalid Subject ID format in filter', 400));
    }
    query.subjectId = subjectId;
  }

  // Handle specific date filter (matches exact day regardless of hours inside DB)
  if (date) {
    const startDate = new Date(date);
    // Invalid date check
    if (isNaN(startDate.getTime())) {
      return next(new AppError('Invalid date format. Use YYYY-MM-DD', 400));
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    query.studyDate = {
      $gte: startDate,
      $lt: endDate
    };
  }

  const studyPlans = await StudyPlan.find(query)
    .sort({ studyDate: 1 }) // Ascending
    .populate('subjectId', 'name color')
    .limit(200);

  res.status(200).json({
    success: true,
    message: 'Study plans retrieved successfully',
    data: studyPlans,
  });
});

// @desc    Get a single study plan
// @route   GET /api/study-plans/:id
// @access  Private
const getStudyPlan = asyncHandler(async (req, res, next) => {
  const studyPlan = await StudyPlan.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate('subjectId', 'name color');

  if (!studyPlan) {
    return next(new AppError('Study plan not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Study plan retrieved successfully',
    data: studyPlan,
  });
});

// @desc    Update a study plan
// @route   PUT /api/study-plans/:id
// @access  Private
const updateStudyPlan = asyncHandler(async (req, res, next) => {
  const { subjectId, startTime, endTime } = req.body;

  let existingPlan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user.id });
  if (!existingPlan) {
    return next(new AppError('Study plan not found or unauthorized', 404));
  }

  if (subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return next(new AppError('Invalid Subject ID format', 400));
    }
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user.id });
    if (!subject) {
      return next(new AppError('New Subject not found or does not belong to you', 404));
    }
  }

  // Validate time logic if either time is being updated
  const newStartTime = startTime || existingPlan.startTime;
  const newEndTime = endTime || existingPlan.endTime;
  if (!isTimeValid(newStartTime, newEndTime)) {
    return next(new AppError('End time must be after start time', 400));
  }

  const updatedPlan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('subjectId', 'name color');

  res.status(200).json({
    success: true,
    message: 'Study plan updated successfully',
    data: updatedPlan,
  });
});

// @desc    Update study plan status only
// @route   PATCH /api/study-plans/:id/status
// @access  Private
const updateStudyPlanStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Please provide a status to update', 400));
  }

  const validStatuses = ['Planned', 'Completed', 'Missed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const studyPlan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status },
    { new: true, runValidators: true }
  ).populate('subjectId', 'name color');

  if (!studyPlan) {
    return next(new AppError('Study plan not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Study plan status updated successfully',
    data: studyPlan,
  });
});

// @desc    Delete a study plan
// @route   DELETE /api/study-plans/:id
// @access  Private
const deleteStudyPlan = asyncHandler(async (req, res, next) => {
  const studyPlan = await StudyPlan.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!studyPlan) {
    return next(new AppError('Study plan not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Study plan deleted successfully',
    data: {},
  });
});

module.exports = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  updateStudyPlanStatus,
  deleteStudyPlan,
};
