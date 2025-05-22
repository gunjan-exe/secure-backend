const rateLimit = require('express-rate-limit');

// Limit 5 requests per 15 minutes per IP for registration
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts. Please try again later.',
});

// Limit 5 login attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});

module.exports = { registerLimiter, loginLimiter };
