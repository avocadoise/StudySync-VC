const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subject must belong to a user'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a subject name'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters']
    },
    code: {
      type: String,
      trim: true,
      maxlength: [50, 'Subject code cannot exceed 50 characters']
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters']
    },
    schedule: {
      type: String,
      trim: true,
      maxlength: [200, 'Schedule cannot exceed 200 characters']
    },
    color: {
      type: String,
      default: '#3498db'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
