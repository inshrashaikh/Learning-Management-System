const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalOrRequiredAuth = async (req, res, next) => {
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
      // Ignored; controller handles fallback or free preview
    }
  }
  next();
};

router.get('/:id', optionalOrRequiredAuth, lessonController.getLessonById);

router.use(protect);
router.put('/:id', authorize('instructor', 'admin'), lessonController.updateLesson);
router.delete('/:id', authorize('instructor', 'admin'), lessonController.deleteLesson);

module.exports = router;
