const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Quiz must be associated with a course']
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Quiz must have an instructor']
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      default: ''
    },
    durationMinutes: {
      type: Number,
      default: 15,
      min: 1
    },
    passingScore: {
      type: Number,
      default: 60, // percentage
      min: 0,
      max: 100
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

quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quizId'
});

quizSchema.index({ courseId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
