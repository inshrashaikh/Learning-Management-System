const { z } = require('zod');

const createAssignmentSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    moduleId: z.string().optional(),
    title: z.string().min(3, 'Assignment title is required').max(150),
    description: z.string().min(10, 'Assignment description is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    maxMarks: z.number().positive().optional().default(100),
    attachmentUrl: z.string().optional()
  })
});

const submitAssignmentSchema = z.object({
  body: z.object({
    content: z.string().min(5, 'Submission content/response is required'),
    attachmentUrl: z.string().optional()
  })
});

const evaluateSubmissionSchema = z.object({
  body: z.object({
    marksAwarded: z.number().min(0, 'Marks awarded cannot be negative'),
    feedback: z.string().optional()
  })
});

module.exports = {
  createAssignmentSchema,
  submitAssignmentSchema,
  evaluateSubmissionSchema
};
