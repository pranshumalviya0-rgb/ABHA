const AuditLog = require('../models/AuditLog');

/**
 * Creates an immutable audit log entry for patient data access.
 * @param {Object} logData
 * @param {string|ObjectId} logData.patientId
 * @param {'staff'|'facility'|'patient'} logData.actorType
 * @param {string|ObjectId} logData.actorId
 * @param {string} logData.actorName
 * @param {string} [logData.facilityName]
 * @param {string} logData.dataAccessed
 * @param {'emergency'|'discharge'|'self'|'registration'} logData.accessType
 * @param {'emergency'|'warn'|'ok'} logData.tone
 */
const logAccess = async (logData) => {
  try {
    const entry = new AuditLog({
      patientId: logData.patientId,
      actorType: logData.actorType,
      actorId: logData.actorId,
      actorName: logData.actorName,
      facilityName: logData.facilityName || undefined,
      dataAccessed: logData.dataAccessed,
      accessType: logData.accessType,
      tone: logData.tone
    });

    await entry.save();
    return entry;
  } catch (error) {
    // Non-blocking: Catch and log error to console so request handling is not disrupted
    console.error('AuditLog Error:', error.message);
    return null;
  }
};

module.exports = {
  logAccess
};
