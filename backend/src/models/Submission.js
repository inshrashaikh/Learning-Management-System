const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Submission must belong to an assignment']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submission must belong to a student']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Submission text or details are required']
    },
    attachmentUrl: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    isLate: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'resubmitted'],
      default: 'submitted'
    },
    marksAwarded: {
      type: Number,
      min: 0
    },
    feedback: {
      type: String,
      default: ''
    },
    gradedAt: {
      type: Date
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ courseId: 1, status: 1 });
submissionSchema.index({ studentId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
