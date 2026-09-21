const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createQuizSchema,
  addQuestionSchema,
  submitQuizSchema
} = require('../validators/quizValidator');

router.use(protect);

router.get('/course/:courseId', quizController.getQuizzesByCourse);
router.get('/student/results', authorize('student', 'admin'), quizController.getStudentResults);
router.get('/attempt/:id/result', quizController.getQuizAttemptResult);
router.get('/:id', quizController.getQuizById);

// Instructor routes
router.post('/', authorize('instructor', 'admin'), validate(createQuizSchema), quizController.createQuiz);
router.put('/:id', authorize('instructor', 'admin'), quizController.updateQuiz);
router.delete('/:id', authorize('instructor', 'admin'), quizController.deleteQuiz);
router.post('/:id/questions', authorize('instructor', 'admin'), validate(addQuestionSchema), quizController.addQuestion);
router.delete('/questions/:questionId', authorize('instructor', 'admin'), quizController.deleteQuestion);

// Student Attempt
router.post('/:id/attempt', authorize('student', 'admin'), validate(submitQuizSchema), quizController.attemptQuiz);

module.exports = router;
