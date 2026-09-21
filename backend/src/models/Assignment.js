const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Assignment must be associated with a course']
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignment must have an instructor']
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Assignment instructions/description is required']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      default: 100,
      min: 1
    },
    attachmentUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignmentId'
});

assignmentSchema.index({ courseId: 1, dueDate: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
