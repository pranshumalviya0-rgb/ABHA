const Patient = require('../models/Patient');
const Condition = require('../models/Condition');
const DischargeEntry = require('../models/DischargeEntry');
const AuditService = require('../services/audit.service');
const NotificationService = require('../services/notification.service');

/**
 * Fetch patient emergency record
 * GET /api/emergency/patient/:abhaId
 * Role: staff
 */
const getPatientRecord = async (req, res) => {
  try {
    const { abhaId } = req.params;
    if (!abhaId) {
      return res.status(400).json({ error: 'ABHA ID is required' });
    }

    const patient = await Patient.findOne({ abhaId: abhaId.trim() });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // 1. Fetch conditions
    const conditionsDoc = await Condition.find({ patientId: patient._id });
    const conditions = conditionsDoc.map((c) => ({
      id: c._id,
      name: c.name,
      since: c.since || undefined,
      notes: c.notes || undefined
    }));

    // 2. Fetch allergies from latest discharge entries
    const latestAllergyEntry = await DischargeEntry.findOne({
      patientId: patient._id,
      allergy: { $ne: null }
    }).sort({ submittedAt: -1, createdAt: -1 });

    const allergies = [];
    if (latestAllergyEntry && latestAllergyEntry.allergy && latestAllergyEntry.allergy.allergen) {
      allergies.push({
        allergen: latestAllergyEntry.allergy.allergen,
        reactionSeverity: latestAllergyEntry.allergy.reactionSeverity,
        clinicalManifestation: latestAllergyEntry.allergy.clinicalManifestation,
        epinephrineRequired: latestAllergyEntry.allergy.epinephrineRequired
      });
    }

    // 3. Fetch medications and implants from latest discharge entries
    const medEntries = await DischargeEntry.find({
      patientId: patient._id,
      $or: [
        { highRiskMed: { $ne: null } },
        { diabetes: { $ne: null } },
        { bloodThinner: { $ne: null } },
        { implant: { $ne: null } }
      ]
    })
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(10);

    const medications = [];
    medEntries.forEach((entry) => {
      if (entry.bloodThinner && entry.bloodThinner.drugName) {
        const lastDoseStr = entry.bloodThinner.lastDoseAt
          ? new Date(entry.bloodThinner.lastDoseAt).toLocaleString()
          : '';
        medications.push({
          genericDrug: `${entry.bloodThinner.drugName} (Target INR: ${entry.bloodThinner.targetInr})`,
          route: `Last dose: ${lastDoseStr} · Reversal: ${entry.bloodThinner.reversalAgent}`,
          category: 'Blood Thinner'
        });
      }
      if (entry.highRiskMed && entry.highRiskMed.genericDrug) {
        medications.push({
          genericDrug: entry.highRiskMed.genericDrug,
          route: entry.highRiskMed.route,
          category: entry.highRiskMed.apinchsCategory
        });
      }
      if (entry.diabetes && entry.diabetes.treatmentPathway) {
        medications.push({
          genericDrug: `Diabetes Treatment (${entry.diabetes.treatmentPathway})`,
          route: `Prescribed Regimen · HbA1c: ${entry.diabetes.hba1cPercent}%`,
          category: 'Diabetes Mellitus'
        });
      }
      if (entry.implant && entry.implant.deviceName) {
        conditions.push({
          id: `implant-${entry._id}`,
          name: `Implant: ${entry.implant.deviceName}`,
          since: entry.implant.mriClass,
          notes: `SN: ${entry.implant.serialNo}`
        });
      }
    });

    // 4. Log emergency access
    await AuditService.logAccess({
      patientId: patient._id,
      actorType: 'staff',
      actorId: req.user.id,
      actorName: `${req.user.name || 'Emergency Staff'} (${req.user.hpid || 'HPID'})`,
      facilityName: 'Emergency Care Unit',
      dataAccessed: 'Full emergency record',
      accessType: 'emergency',
      tone: 'emergency'
    });

    return res.status(200).json({
      patient: {
        abhaId: patient.abhaId,
        fullName: patient.fullName,
        dob: patient.dob ? patient.dob.toISOString().split('T')[0] : undefined,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        weight_kg: patient.weight_kg,
        height_cm: patient.height_cm
      },
      conditions,
      allergies,
      medications,
      emergencyContacts: {
        primary: patient.primaryContact ? { phone: patient.primaryContact } : null,
        secondary: patient.secondaryContact ? { phone: patient.secondaryContact } : null
      }
    });
  } catch (error) {
    console.error('getPatientRecord error:', error);
    return res.status(500).json({ error: 'Server error retrieving emergency patient record' });
  }
};

/**
 * Trigger SMS + Call alert to family/emergency contacts
 * POST /api/emergency/patient/:abhaId/notify-family
 * Role: staff
 */
const notifyFamily = async (req, res) => {
  try {
    const { abhaId } = req.params;
    if (!abhaId) {
      return res.status(400).json({ error: 'ABHA ID is required' });
    }

    const patient = await Patient.findOne({ abhaId: abhaId.trim() });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const contacts = [patient.primaryContact, patient.secondaryContact].filter(Boolean);
    if (contacts.length === 0) {
      return res.status(422).json({ error: 'No emergency contacts on file' });
    }

    const alertMessage = `EMERGENCY ALERT: Patient ${patient.fullName} has been admitted to Emergency Care. Please check the portal or contact hospital staff immediately.`;

    // Notify all contacts
    for (const phone of contacts) {
      await NotificationService.sendSms(phone, alertMessage);
      await NotificationService.triggerEmergencyCall(
        phone,
        `Emergency Alert. Patient ${patient.fullName} has been admitted to Emergency Care. Please contact staff immediately.`
      );
    }

    // Audit log
    await AuditService.logAccess({
      patientId: patient._id,
      actorType: 'staff',
      actorId: req.user.id,
      actorName: `${req.user.name || 'Emergency Staff'} (${req.user.hpid || 'HPID'})`,
      facilityName: 'Emergency Care Unit',
      dataAccessed: 'Emergency family notification triggered',
      accessType: 'emergency',
      tone: 'emergency'
    });

    return res.status(200).json({
      notified: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('notifyFamily error:', error);
    return res.status(500).json({ error: 'Server error sending family notifications' });
  }
};

module.exports = {
  getPatientRecord,
  notifyFamily
};
