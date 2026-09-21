const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: 'document'
    }
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Lesson must belong to a course']
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Lesson must belong to a module']
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required']
    },
    videoUrl: {
      type: String,
      default: ''
    },
    durationMinutes: {
      type: Number,
      default: 15,
      min: 1
    },
    order: {
      type: Number,
      default: 1
    },
    resources: [resourceSchema],
    isFreePreview: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ courseId: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
