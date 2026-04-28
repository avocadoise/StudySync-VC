const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Note must belong to a subject']
    },
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide note content']
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for common queries
noteSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('Note', noteSchema);
