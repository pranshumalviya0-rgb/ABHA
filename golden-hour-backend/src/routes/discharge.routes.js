const express = require('express');
const router = express.Router();
const dischargeController = require('../controllers/discharge.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Submit clinical discharge entry
router.post(
  '/',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, () => {
        next();
      });
    }
    next();
  },
  dischargeController.submitDischarge
);

module.exports = router;
