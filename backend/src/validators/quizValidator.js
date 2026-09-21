const { z } = require('zod');

const createQuizSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    moduleId: z.string().optional(),
    title: z.string().min(3, 'Quiz title is required').max(150),
    description: z.string().optional(),
    durationMinutes: z.number().int().positive().optional().default(15),
    passingScore: z.number().min(0).max(100).optional().default(60)
  })
});

const addQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(3, 'Question text is required'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).length(4, 'Must have exactly 4 options'),
    correctAnswerIndex: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
    marks: z.number().int().positive().optional().default(1),
    order: z.number().int().optional()
  })
});

const submitQuizSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionIndex: z.number().int().min(0).max(3).nullable().optional()
      })
    )
  })
});

module.exports = {
  createQuizSchema,
  addQuestionSchema,
  submitQuizSchema
};
