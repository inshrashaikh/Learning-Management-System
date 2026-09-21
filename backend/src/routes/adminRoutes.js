const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.get('/courses', adminController.getAllCourses);
router.patch('/courses/:id/feature', adminController.toggleFeaturedCourse);
router.get('/enrollments', adminController.getAllEnrollments);

module.exports = router;
