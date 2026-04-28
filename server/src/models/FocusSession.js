const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Focus session must belong to a user']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Focus session must belong to a subject']
    },
    duration: {
      type: Number,
      required: [true, 'Please provide a duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    sessionType: {
      type: String,
      enum: ['Pomodoro', 'Short Break', 'Long Break', 'Custom'],
      required: [true, 'Please provide a session type']
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for common queries
focusSessionSchema.index({ userId: 1, completedAt: 1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
