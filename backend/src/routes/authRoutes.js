const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty().trim(),
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Update profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('fullName').optional().trim(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
  ],
  authController.updateProfile
);

module.exports = router;
