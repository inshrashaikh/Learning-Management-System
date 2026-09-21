const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Module must belong to a course']
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for lessons
moduleSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'moduleId'
});

moduleSchema.index({ courseId: 1, order: 1 });

const Module = mongoose.model('Module', moduleSchema);
module.exports = Module;
