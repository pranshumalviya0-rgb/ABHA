const Patient = require('../models/Patient');
const Condition = require('../models/Condition');
const AuditLog = require('../models/AuditLog');
const AuditService = require('../services/audit.service');

/**
 * Get logged-in patient's own profile and conditions
 * GET /api/patient/me
 * Role: patient
 */
const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const conditionsDoc = await Condition.find({ patientId: patient._id });
    const conditions = conditionsDoc.map((c) => ({
      id: c._id,
      name: c.name,
      since: c.since || undefined,
      notes: c.notes || undefined
    }));

    // Log self audit entry
    await AuditService.logAccess({
      patientId: patient._id,
      actorType: 'patient',
      actorId: patient._id,
      actorName: patient.fullName,
      facilityName: 'Self Portal',
      dataAccessed: 'Profile details',
      accessType: 'self',
      tone: 'ok'
    });

    return res.status(200).json({
      patient: {
        abhaId: patient.abhaId,
        abhaAddress: patient.abhaAddress,
        fullName: patient.fullName,
        bloodGroup: patient.bloodGroup,
        primaryContact: patient.primaryContact || undefined,
        secondaryContact: patient.secondaryContact || undefined,
        cardRequested: patient.cardRequested || false
      },
      conditions
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ error: 'Server error retrieving profile' });
  }
};

/**
 * Paginated access audit log for logged-in patient
 * GET /api/patient/me/audit-log
 * Role: patient
 */
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ patientId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments({ patientId: req.user.id })
    ]);

    return res.status(200).json({
      total,
      page,
      logs: logs.map((l) => ({
        id: l._id,
        facilityName: l.facilityName || 'Independent Session',
        actorName: l.actorName,
        dataAccessed: l.dataAccessed,
        tone: l.tone,
        createdAt: l.createdAt
      }))
    });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ error: 'Server error retrieving audit logs' });
  }
};

/**
 * Add a self-reported condition
 * POST /api/patient/me/conditions
 * Role: patient
 */
const addCondition = async (req, res) => {
  try {
    const { name, since, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Condition name is required' });
    }

    const condition = new Condition({
      patientId: req.user.id,
      name: name.trim(),
      since: since ? since.toString().trim() : undefined,
      notes: notes ? notes.trim() : undefined
    });

    await condition.save();

    return res.status(201).json({
      condition: {
        id: condition._id,
        name: condition.name,
        since: condition.since,
        notes: condition.notes
      }
    });
  } catch (error) {
    console.error('addCondition error:', error);
    return res.status(500).json({ error: 'Server error adding condition' });
  }
};

/**
 * Remove a self-reported condition
 * DELETE /api/patient/me/conditions/:conditionId
 * Role: patient
 */
const removeCondition = async (req, res) => {
  try {
    const { conditionId } = req.params;
    if (!conditionId) {
      return res.status(400).json({ error: 'Condition ID is required' });
    }

    const deleted = await Condition.findOneAndDelete({
      _id: conditionId,
      patientId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    return res.status(200).json({
      deleted: true
    });
  } catch (error) {
    console.error('removeCondition error:', error);
    return res.status(500).json({ error: 'Server error removing condition' });
  }
};

/**
 * Update emergency contact phone numbers
 * PUT /api/patient/me/emergency-contacts
 * Role: patient
 */
const updateEmergencyContacts = async (req, res) => {
  try {
    const { primaryContact, secondaryContact } = req.body;

    if (!primaryContact && !secondaryContact) {
      return res.status(400).json({ error: 'At least one contact is required' });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (primaryContact !== undefined) patient.primaryContact = primaryContact ? primaryContact.trim() : '';
    if (secondaryContact !== undefined) patient.secondaryContact = secondaryContact ? secondaryContact.trim() : '';

    await patient.save();

    return res.status(200).json({
      primaryContact: patient.primaryContact,
      secondaryContact: patient.secondaryContact
    });
  } catch (error) {
    console.error('updateEmergencyContacts error:', error);
    return res.status(500).json({ error: 'Server error updating emergency contacts' });
  }
};

/**
 * Request physical ABHA replacement card
 * POST /api/patient/me/request-card
 * Role: patient
 */
const requestCard = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (patient.cardRequested) {
      return res.status(409).json({ error: 'Card replacement already requested' });
    }

    patient.cardRequested = true;
    patient.cardRequestedAt = new Date();
    await patient.save();

    return res.status(200).json({
      cardRequested: true,
      cardRequestedAt: patient.cardRequestedAt
    });
  } catch (error) {
    console.error('requestCard error:', error);
    return res.status(500).json({ error: 'Server error requesting card replacement' });
  }
};

module.exports = {
  getProfile,
  getAuditLogs,
  addCondition,
  removeCondition,
  updateEmergencyContacts,
  requestCard
};
