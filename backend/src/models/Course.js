const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Course description is required']
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must have an instructor']
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      enum: [
        'Web Development',
        'Data Science',
        'Cybersecurity',
        'Cloud Computing',
        'Artificial Intelligence',
        'Mobile Development',
        'Software Architecture',
        'DevOps'
      ],
      default: 'Web Development'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    },
    estimatedDuration: {
      type: String,
      default: '6 Weeks'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    learningOutcomes: [
      {
        type: String
      }
    ],
    prerequisites: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for modules
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'courseId'
});

// Indexes for high performance searches and filtering
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, difficulty: 1, status: 1 });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
