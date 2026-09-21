const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createModuleSchema, createLessonSchema } = require('../validators/courseValidator');

router.get('/course/:courseId', moduleController.getModulesByCourse);

router.use(protect);
router.post('/course/:courseId', authorize('instructor', 'admin'), validate(createModuleSchema), moduleController.createModule);
router.put('/:id', authorize('instructor', 'admin'), moduleController.updateModule);
router.delete('/:id', authorize('instructor', 'admin'), moduleController.deleteModule);

// Nest lesson creation under module
router.post('/:moduleId/lessons', authorize('instructor', 'admin'), validate(createLessonSchema), lessonController.createLesson);

module.exports = router;
