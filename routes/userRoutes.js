// routes/userRoutes.js
//
// WHAT: Defines all /api/users/* endpoints (account deletion, public lookup).
// WHY: Separate from authRoutes.js to keep "session/auth" concerns apart
//      from general "user account" concerns.

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const { deleteMyAccount, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

// @route   DELETE /api/users/me
// @desc    Delete the logged-in user's own account
router.delete('/me', protect, deleteMyAccount);

// @route   GET /api/users/:id
// @desc    Get public info about any user by ID
router.get(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  getUserById
);

module.exports = router;
