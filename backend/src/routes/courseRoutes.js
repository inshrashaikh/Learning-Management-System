const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const enrollmentController = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createCourseSchema } = require('../validators/courseValidator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware so public detail view can know if current viewer is enrolled
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'learnsphere_super_secret_jwt_key_2026_academic_production_grade'
      );
      req.user = await User.findById(decoded.id);
    } catch (e) {
      // Ignore token failure for public view
    }
  }
  next();
};

// Public routes
router.get('/', courseController.getCourses);
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), courseController.getInstructorCourses);
router.get('/:id', optionalAuth, courseController.getCourseById);

// Protected routes
router.use(protect);

// Enrollment
router.post('/:courseId/enroll', authorize('student', 'admin'), enrollmentController.enrollInCourse);
router.get('/:courseId/enrollments', authorize('instructor', 'admin'), enrollmentController.getCourseEnrollments);

// Instructor Course Management
router.post('/', authorize('instructor', 'admin'), validate(createCourseSchema), courseController.createCourse);
router.put('/:id', authorize('instructor', 'admin'), courseController.updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), courseController.deleteCourse);
router.patch('/:id/publish', authorize('instructor', 'admin'), courseController.publishCourse);

module.exports = router;
