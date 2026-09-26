const Patient = require('../models/Patient');
const AuditService = require('../services/audit.service');

/**
 * Fetch patient context for discharge header
 * GET /api/facility/patient/:abhaId
 * Role: facility
 */
const getPatientContext = async (req, res) => {
  try {
    const { abhaId } = req.params;
    if (!abhaId) {
      return res.status(400).json({ error: 'ABHA ID is required' });
    }

    const cleanIdentifier = abhaId.toString().trim().replace(/\s+/g, '');
    const cleanAbha = cleanIdentifier.replace(/-/g, '');

    const patient = await Patient.findOne({
      $or: [
        { abhaId: cleanAbha },
        { abhaId: cleanIdentifier },
        { abhaAddress: cleanIdentifier.toLowerCase() }
      ]
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Write audit log
    await AuditService.logAccess({
      patientId: patient._id,
      actorType: 'facility',
      actorId: req.user.id,
      actorName: req.user.staffEmployeeId || 'Facility Staff',
      facilityName: req.user.facilityName || 'Hospital Facility',
      dataAccessed: 'Patient identity',
      accessType: 'discharge',
      tone: 'warn'
    });

    return res.status(200).json({
      patient: {
        abhaId: patient.abhaId,
        fullName: patient.fullName
      }
    });
  } catch (error) {
    console.error('getPatientContext error:', error);
    return res.status(500).json({ error: 'Server error retrieving patient context' });
  }
};

module.exports = {
  getPatientContext
};
