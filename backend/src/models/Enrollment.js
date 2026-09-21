const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enrollment must belong to a student']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Enrollment must belong to a course']
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Ensure a student can only enroll once in a course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
