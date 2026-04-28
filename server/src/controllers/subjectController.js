const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = asyncHandler(async (req, res, next) => {
  const { name, code, instructor, schedule, color } = req.body;

  if (!name || name.trim() === '') {
    return next(new AppError('Please provide a subject name', 400));
  }

  const subject = await Subject.create({
    userId: req.user.id,
    name,
    code,
    instructor,
    schedule,
    color,
  });

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: subject,
  });
});

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res, next) => {
  const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Subjects retrieved successfully',
    data: subjects,
  });
});

// @desc    Get a single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!subject) {
    return next(new AppError('Subject not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Subject retrieved successfully',
    data: subject,
  });
});

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (name !== undefined && name.trim() === '') {
    return next(new AppError('Subject name cannot be empty', 400));
  }

  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subject) {
    return next(new AppError('Subject not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Subject updated successfully',
    data: subject,
  });
});

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!subject) {
    return next(new AppError('Subject not found or unauthorized', 404));
  }

  await subject.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Subject deleted successfully',
    data: {},
  });
});

module.exports = {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
};
