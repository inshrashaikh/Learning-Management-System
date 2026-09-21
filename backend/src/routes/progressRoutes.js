const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/student/analytics', authorize('student', 'admin'), progressController.getStudentOverallAnalytics);
router.get('/:courseId', authorize('student', 'instructor', 'admin'), progressController.getCourseProgress);
router.post('/:courseId/lessons/:lessonId/toggle', authorize('student', 'admin'), progressController.toggleLessonProgress);

module.exports = router;
