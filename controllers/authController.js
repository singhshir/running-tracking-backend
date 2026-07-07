

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const fs = require('fs');


// Helper to set the JWT as an httpOnly cookie on the response.
const setTokenCookie = (res, token) => {
  const days = Number(process.env.COOKIE_EXPIRES_IN_DAYS) || 7;

  res.cookie('token', token, {
    httpOnly: true, // JS on the frontend cannot read this cookie (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: days * 24 * 60 * 60 * 1000, // convert days to milliseconds
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, height, weight, age, gender } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'A user with this email already exists');
    }

    // Create the new user. Password hashing happens automatically
    // inside the User model's pre('save') middleware.
    const user = await User.create({
      name,
      email,
      password,
      height,
      weight,
      age,
      gender,
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return sendSuccess(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    next(error); // forward to global error handler
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // We must explicitly select password since the schema sets select:false
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return sendSuccess(res, 200, 'Login successful', {
      user, // password automatically stripped by toJSON() in the model
      token,
    });
  } catch (error) {
    next(error);
  }
};


const getProfile = async (req, res, next) => {
  try {
    // req.user was already attached by the `protect` middleware
    return sendSuccess(res, 200, 'Profile fetched successfully', req.user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Only allow updating these specific fields (never allow updating password here)
    const allowedFields = ['name', 'email', 'height', 'weight', 'age', 'gender', 'profileImage'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0), // immediately expire the cookie
    });

    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No image file uploaded');
    }

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');

    // purano photo delete garne (optional, tara raakhda disk space bachcha)
    if (user.profileImage) {
      const oldPath = `.${user.profileImage}`;
      fs.unlink(oldPath, () => {}); // fail silently if not found
    }

    user.profileImage = `/uploads/${req.file.filename}`;
    const updatedUser = await user.save();

    return sendSuccess(res, 200, 'Profile photo updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  logoutUser,
};
