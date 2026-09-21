const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/my-enrollments', authorize('student', 'admin'), enrollmentController.getMyEnrollments);
router.get('/course/:courseId', authorize('instructor', 'admin'), enrollmentController.getCourseEnrollments);

module.exports = router;
