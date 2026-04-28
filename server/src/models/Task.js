const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Task must belong to a subject']
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('Task', taskSchema);
