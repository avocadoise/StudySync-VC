const mongoose = require('mongoose');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res, next) => {
  const { title, content, tags, subjectId } = req.body;

  if (!title || title.trim() === '') {
    return next(new AppError('Please provide a note title', 400));
  }
  if (!content || content.trim() === '') {
    return next(new AppError('Please provide note content', 400));
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

  // Create the note
  const note = await Note.create({
    userId: req.user.id,
    subjectId,
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
  });

  // Populate subject details before returning
  await note.populate('subjectId', 'name color');

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
});

// @desc    Get all notes for logged-in user (with search and filters)
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res, next) => {
  const { subjectId, search } = req.query;

  // Build query scoped to user
  const query = { userId: req.user.id };

  if (subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return next(new AppError('Invalid Subject ID format in filter', 400));
    }
    query.subjectId = subjectId;
  }

  // Text search optimization using regex (searching in title or tags)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query safely, newest first, limit to 200
  const notes = await Note.find(query)
    .populate('subjectId', 'name color')
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(200).json({
    success: true,
    message: 'Notes retrieved successfully',
    data: notes,
  });
});

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate('subjectId', 'name color');

  if (!note) {
    return next(new AppError('Note not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Note retrieved successfully',
    data: note,
  });
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res, next) => {
  const { subjectId, title, content } = req.body;

  if (title !== undefined && title.trim() === '') {
    return next(new AppError('Note title cannot be empty', 400));
  }
  if (content !== undefined && content.trim() === '') {
    return next(new AppError('Note content cannot be empty', 400));
  }

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

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('subjectId', 'name color');

  if (!note) {
    return next(new AppError('Note not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!note) {
    return next(new AppError('Note not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
    data: {},
  });
});

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
};
