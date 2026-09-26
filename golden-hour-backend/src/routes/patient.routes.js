const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All patient portal endpoints require authenticated 'patient' role
router.get(
  '/me',
  authenticate,
  authorize('patient'),
  patientController.getProfile
);

router.get(
  '/me/audit-log',
  authenticate,
  authorize('patient'),
  patientController.getAuditLogs
);

router.post(
  '/me/conditions',
  authenticate,
  authorize('patient'),
  patientController.addCondition
);

router.delete(
  '/me/conditions/:conditionId',
  authenticate,
  authorize('patient'),
  patientController.removeCondition
);

router.put(
  '/me/emergency-contacts',
  authenticate,
  authorize('patient'),
  patientController.updateEmergencyContacts
);

router.post(
  '/me/request-card',
  authenticate,
  authorize('patient'),
  patientController.requestCard
);

module.exports = router;
