const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { evaluateSubmissionSchema } = require('../validators/assignmentValidator');

router.use(protect);

router.get('/instructor/all', authorize('instructor', 'admin'), submissionController.getInstructorPendingSubmissions);
router.patch('/:id/evaluate', authorize('instructor', 'admin'), validate(evaluateSubmissionSchema), submissionController.evaluateSubmission);

module.exports = router;
