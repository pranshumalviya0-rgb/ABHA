const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All emergency routes require authenticated 'staff' role
router.get(
  '/patient/:abhaId',
  authenticate,
  authorize('staff'),
  emergencyController.getPatientRecord
);

router.post(
  '/patient/:abhaId/notify-family',
  authenticate,
  authorize('staff'),
  emergencyController.notifyFamily
);

module.exports = router;
