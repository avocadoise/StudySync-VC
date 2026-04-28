const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply a stricter rate limiter for auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
