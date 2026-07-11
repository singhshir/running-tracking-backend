const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMidddleware');

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');


const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
} = require('../validators/authValidator');

// @route   POST /api/auth/register
router.post('/register', registerValidator, validate, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidator, validate, loginUser);

// @route   GET /api/auth/profile
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateProfileValidator, validate, updateProfile);

// @route   POST /api/auth/profile/photo
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);

// @route   PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', resetPasswordValidator, validate, resetPassword);

// @route   POST /api/auth/logout
router.post('/logout', protect, logoutUser);

module.exports = router;