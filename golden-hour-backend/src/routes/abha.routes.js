const express = require('express');
const router = express.Router();
const abhaController = require('../controllers/abha.controller');
const { authLimiter } = require('../middleware/rateLimiter');

// Step 1: Send Registration OTP
router.post('/send-otp', authLimiter, abhaController.sendOtp);
// Backward compatibility alias for /initiate
router.post('/initiate', authLimiter, abhaController.sendOtp);

// Step 2: Verify Registration OTP
router.post('/verify-otp', authLimiter, abhaController.verifyOtp);

// Step 3: Complete Profile & Create ABHA
router.post('/create', abhaController.createAbha);

// Check Handle / ABHA Address Availability
router.get('/check-address', abhaController.checkAddress);

module.exports = router;
