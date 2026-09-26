const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

// Patient Authentication
router.post('/patient/login', authLimiter, authController.patientLogin);

// Staff Authentication
router.post('/staff/login', authLimiter, authController.staffLogin);

// Facility Staff Authentication
router.post('/facility/login', authLimiter, authController.facilityLogin);

// Patient Password Recovery Flow
router.post('/patient/forgot', authLimiter, authController.forgotPasswordSendOtp);
router.post('/patient/verify-otp', authLimiter, authController.forgotPasswordVerifyOtp);
router.post('/patient/reset-password', authLimiter, authController.forgotPasswordReset);

module.exports = router;
