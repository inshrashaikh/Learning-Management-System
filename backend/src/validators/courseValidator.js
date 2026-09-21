const { z } = require('zod');

const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(120),
    shortDescription: z.string().min(10).max(200),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.enum([
      'Web Development',
      'Data Science',
      'Cybersecurity',
      'Cloud Computing',
      'Artificial Intelligence',
      'Mobile Development',
      'Software Architecture',
      'DevOps'
    ]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    thumbnail: z.string().optional(),
    estimatedDuration: z.string().optional(),
    learningOutcomes: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional()
  })
});

const createModuleSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Module title is required').max(120),
    description: z.string().optional(),
    order: z.number().int().optional()
  })
});

const createLessonSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Lesson title is required').max(150),
    content: z.string().min(5, 'Content is required'),
    videoUrl: z.string().optional(),
    durationMinutes: z.number().int().positive().optional(),
    order: z.number().int().optional(),
    isFreePreview: z.boolean().optional(),
    resources: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        fileType: z.string().optional()
      })
    ).optional()
  })
});

module.exports = {
  createCourseSchema,
  createModuleSchema,
  createLessonSchema
};
