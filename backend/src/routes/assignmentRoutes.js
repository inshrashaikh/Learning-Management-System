const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createAssignmentSchema,
  submitAssignmentSchema
} = require('../validators/assignmentValidator');

router.use(protect);

router.get('/course/:courseId', assignmentController.getAssignmentsByCourse);
router.get('/student/my-assignments', authorize('student', 'admin'), assignmentController.getStudentAssignments);
router.get('/:id', assignmentController.getAssignmentById);

// Instructor routes
router.post('/', authorize('instructor', 'admin'), validate(createAssignmentSchema), assignmentController.createAssignment);
router.put('/:id', authorize('instructor', 'admin'), assignmentController.updateAssignment);
router.delete('/:id', authorize('instructor', 'admin'), assignmentController.deleteAssignment);

// Student Submission
router.post('/:id/submit', authorize('student', 'admin'), validate(submitAssignmentSchema), submissionController.submitAssignment);

// Instructor view submissions for assignment
router.get('/:id/submissions', authorize('instructor', 'admin'), submissionController.getAssignmentSubmissions);

module.exports = router;
