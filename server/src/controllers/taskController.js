const mongoose = require('mongoose');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, dueDate, priority, status, subjectId } = req.body;

  if (!title || title.trim() === '') {
    return next(new AppError('Please provide a task title', 400));
  }
  if (!dueDate) {
    return next(new AppError('Please provide a due date', 400));
  }
  if (!subjectId) {
    return next(new AppError('Please provide a subjectId', 400));
  }

  // Validate subjectId format
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    return next(new AppError('Invalid Subject ID format', 400));
  }

  // Verify the subject exists and belongs to the logged-in user
  const subject = await Subject.findOne({
    _id: subjectId,
    userId: req.user.id,
  });

  if (!subject) {
    return next(new AppError('Subject not found or does not belong to you', 404));
  }

  // Create the task
  const task = await Task.create({
    userId: req.user.id,
    subjectId,
    title,
    description,
    dueDate,
    priority,
    status,
  });

  // Populate subject details before returning
  await task.populate('subjectId', 'name color');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

// @desc    Get all tasks for logged-in user (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res, next) => {
  const { status, priority, subjectId, sort } = req.query;

  // Build query scoped to user
  const query = { userId: req.user.id };

  // Add filters directly in MongoDB query
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return next(new AppError('Invalid Subject ID format in filter', 400));
    }
    query.subjectId = subjectId;
  }

  // Initialize DB query
  let mongoQuery = Task.find(query).populate('subjectId', 'name color');

  // Optimization: Sorting & Limiting
  if (sort === 'dueDate') {
    mongoQuery = mongoQuery.sort({ dueDate: 1 }); // Ascending (earliest first)
  } else {
    mongoQuery = mongoQuery.sort({ createdAt: -1 }); // Default: newest first
  }

  // Execute query safely, limit to 200 tasks by default to optimize loading
  const tasks = await mongoQuery.limit(200);

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: tasks,
  });
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate('subjectId', 'name color');

  if (!task) {
    return next(new AppError('Task not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  });
});

// @desc    Update a task (General)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res, next) => {
  const { subjectId } = req.body;

  // If subject is being updated, verify ownership
  if (subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return next(new AppError('Invalid Subject ID format', 400));
    }
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user.id });
    if (!subject) {
      return next(new AppError('New Subject not found or does not belong to you', 404));
    }
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('subjectId', 'name color');

  if (!task) {
    return next(new AppError('Task not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

// @desc    Update task status only
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Please provide a status to update', 400));
  }

  const validStatuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status },
    { new: true, runValidators: true }
  ).populate('subjectId', 'name color');

  if (!task) {
    return next(new AppError('Task not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: task,
  });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!task) {
    return next(new AppError('Task not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: {},
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
