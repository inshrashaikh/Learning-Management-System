const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} = require('../validators/authValidator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/update-profile', validate(updateProfileSchema), authController.updateProfile);
router.patch('/change-password', validate(changePasswordSchema), authController.changePassword);

module.exports = router;
