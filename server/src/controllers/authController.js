const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate request
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate Token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check user exists & verify password
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate Token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  // req.user is loaded in the protect middleware
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
};
