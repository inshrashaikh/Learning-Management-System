const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOptionIndex: {
      type: Number,
      min: 0,
      max: 3
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksAwarded: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Attempt must belong to a quiz']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attempt must belong to a student']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    answers: [studentAnswerSchema],
    score: {
      type: Number,
      required: true,
      default: 0
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

quizAttemptSchema.index({ quizId: 1, studentId: 1 });
quizAttemptSchema.index({ studentId: 1, courseId: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
