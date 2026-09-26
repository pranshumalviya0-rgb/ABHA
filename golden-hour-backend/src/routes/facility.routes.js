const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Facility routes require authenticated 'facility' role
router.get(
  '/patient/:abhaId',
  authenticate,
  authorize('facility'),
  facilityController.getPatientContext
);

module.exports = router;
