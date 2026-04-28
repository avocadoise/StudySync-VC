const mongoose = require('mongoose');

const aiReviewerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'AI Reviewer must belong to a user']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'AI Reviewer must belong to a subject']
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: [true, 'AI Reviewer must belong to a note']
    },
    summary: {
      type: String,
      trim: true
    },
    keyTerms: [
      {
        term: { type: String, trim: true },
        definition: { type: String, trim: true }
      }
    ],
    questions: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true }
      }
    ],
    flashcards: [
      {
        front: { type: String, trim: true },
        back: { type: String, trim: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for common queries
aiReviewerSchema.index({ userId: 1, noteId: 1 });

module.exports = mongoose.model('AIReviewer', aiReviewerSchema);
