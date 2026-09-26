const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const StaffCredential = require('../models/StaffCredential');
const FacilityCredential = require('../models/FacilityCredential');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_long_random_string';

/**
 * Authentication Middleware
 * Extracts and verifies JWT bearer token, verifies user existence and tokenVersion.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { sub: userId, role, tokenVersion } = decoded;

    if (role === 'patient') {
      const patient = await Patient.findById(userId);
      if (!patient) {
        return res.status(401).json({ error: 'User not found' });
      }
      // Check tokenVersion for invalidation after password reset
      if (tokenVersion !== undefined && patient.tokenVersion !== undefined && tokenVersion !== patient.tokenVersion) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
      req.user = {
        id: patient._id,
        role: 'patient',
        abhaId: patient.abhaId,
        abhaAddress: patient.abhaAddress,
        fullName: patient.fullName
      };
    } else if (role === 'staff') {
      const staff = await StaffCredential.findById(userId);
      if (!staff || !staff.active) {
        return res.status(401).json({ error: 'Staff credential invalid or deactivated' });
      }
      req.user = {
        id: staff._id,
        role: 'staff',
        hpid: staff.hpid,
        name: staff.name,
        specialization: staff.specialization
      };
    } else if (role === 'facility') {
      const facility = await FacilityCredential.findById(userId);
      if (!facility || !facility.active) {
        return res.status(401).json({ error: 'Facility credential invalid or deactivated' });
      }
      req.user = {
        id: facility._id,
        role: 'facility',
        hfrId: facility.hfrId,
        staffEmployeeId: facility.staffEmployeeId,
        facilityName: facility.facilityName,
        city: facility.city,
        state: facility.state
      };
    } else {
      return res.status(401).json({ error: 'Invalid token role' });
    }

    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

/**
 * Authorization Middleware Factory
 * Checks if authenticated user has one of the allowed roles.
 * @param {string[]} roles
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
