const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Study plan must belong to a user']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Study plan must belong to a subject']
    },
    topic: {
      type: String,
      required: [true, 'Please provide a topic'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters']
    },
    studyDate: {
      type: Date,
      required: [true, 'Please provide a study date']
    },
    startTime: {
      type: String,
      required: [true, 'Please provide a start time']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide an end time']
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['Planned', 'Completed', 'Missed', 'Cancelled'],
      default: 'Planned'
    }
  },
  {
    timestamps: true
  }
);

// Index for common queries
studyPlanSchema.index({ userId: 1, studyDate: 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
