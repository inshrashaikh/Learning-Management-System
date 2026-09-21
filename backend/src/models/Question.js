const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Question must belong to a quiz']
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: {
      type: [String],
      validate: [
        function (val) {
          return val && val.length === 4;
        },
        'A question must have exactly 4 options'
      ],
      required: true
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, 'Correct answer index is required (0-3)'],
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      default: ''
    },
    marks: {
      type: Number,
      default: 1,
      min: 1
    },
    order: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

questionSchema.index({ quizId: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
