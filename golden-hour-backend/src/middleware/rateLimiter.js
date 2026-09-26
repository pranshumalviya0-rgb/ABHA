const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Middleware
 * Limits public authentication and OTP endpoints to 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 500, // Generous limit in dev for testing
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'Too many requests — wait before trying again'
  },
  statusCode: 429
});

module.exports = {
  authLimiter
};
