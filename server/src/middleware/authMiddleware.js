const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route, no token provided', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request, excluding password
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route, illegal token', 401));
  }
});

module.exports = { protect };
