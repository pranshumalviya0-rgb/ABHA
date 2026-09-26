const express = require('express');
const router = express.Router();

// GET /api/audit
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Audit logs are managed internally. Refer to /api/patient/me/audit-log for user-facing logs.'
  });
});

module.exports = router;
