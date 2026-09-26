const Patient = require('../models/Patient');
const FacilityCredential = require('../models/FacilityCredential');
const DischargeEntry = require('../models/DischargeEntry');
const AuditService = require('../services/audit.service');

/**
 * Submit post-care clinical discharge entry
 * POST /api/discharge
 * Role: facility
 */
const submitDischarge = async (req, res) => {
  try {
    const {
      patientAbhaId,
      allergy,
      diabetes,
      implant,
      bloodThinner,
      highRiskMed,
      doctorNote,
      admittedAt
    } = req.body;

    let patient;
    if (patientAbhaId) {
      const cleanIdentifier = patientAbhaId.toString().replace(/\s+/g, '').trim();
      const cleanAbha = cleanIdentifier.replace(/-/g, '');
      patient = await Patient.findOne({
        $or: [
          { abhaId: cleanAbha },
          { abhaId: cleanIdentifier },
          { abhaAddress: cleanIdentifier.toLowerCase() }
        ]
      });
    }
    if (!patient && !patientAbhaId) {
      patient = await Patient.findOne();
    }
    if (!patient) {
      return res.status(404).json({ error: `Patient record not found for ABHA ID: ${patientAbhaId || 'unknown'}` });
    }

    const validationErrors = [];

    // 1. Validate Allergy section if present
    if (allergy && Object.keys(allergy).length > 0) {
      const { allergen, reactionSeverity, clinicalManifestation, epinephrineRequired } = allergy;
      if (!allergen || !reactionSeverity || !clinicalManifestation || epinephrineRequired === undefined) {
        validationErrors.push('Allergy section requires allergen, reactionSeverity, clinicalManifestation, and epinephrineRequired');
      }
      allergy.epinephrineRequired = Boolean(epinephrineRequired);
    }

    // 2. Validate Diabetes section if present
    if (diabetes && Object.keys(diabetes).length > 0) {
      const { treatmentPathway, hba1cPercent, dkaHistory } = diabetes;
      if (!treatmentPathway || hba1cPercent === undefined || dkaHistory === undefined) {
        validationErrors.push('Diabetes section requires treatmentPathway, hba1cPercent, and dkaHistory');
      }
      diabetes.dkaHistory = Boolean(dkaHistory);
      const hba1cNum = Number(hba1cPercent);
      if (isNaN(hba1cNum) || hba1cNum < 3.0 || hba1cNum > 20.0) {
        validationErrors.push('hba1cPercent must be a number between 3.0 and 20.0');
      } else {
        diabetes.hba1cPercent = hba1cNum;
      }
    }

    // 3. Validate Implant section if present
    if (implant && Object.keys(implant).length > 0) {
      const { deviceName, mriClass, serialNo } = implant;
      if (!deviceName || !mriClass || !serialNo) {
        validationErrors.push('Implant section requires deviceName, mriClass, and serialNo');
      }
      const validMri = ['MR-Safe', 'MR-Conditional', 'MR-Unsafe'];
      if (mriClass && !validMri.includes(mriClass)) {
        validationErrors.push(`mriClass must be one of: ${validMri.join(', ')}`);
      }
    }

    // 4. Validate Blood Thinner section if present
    if (bloodThinner && Object.keys(bloodThinner).length > 0) {
      const { drugName, lastDoseAt, targetInr, reversalAgent } = bloodThinner;
      if (!drugName || !lastDoseAt || targetInr === undefined || !reversalAgent) {
        validationErrors.push('Blood thinner section requires drugName, lastDoseAt, targetInr, and reversalAgent');
      }
      if (lastDoseAt && isNaN(new Date(lastDoseAt).getTime())) {
        validationErrors.push('lastDoseAt must be a valid date');
      }
      const inrNum = Number(targetInr);
      if (isNaN(inrNum) || inrNum < 1.0 || inrNum > 5.0) {
        validationErrors.push('targetInr must be a number between 1.0 and 5.0');
      }
      const validReversals = ['Vitamin K', 'Andexanet alfa', 'Idarucizumab (Praxbind)', 'Protamine sulphate', 'None'];
      if (reversalAgent && !validReversals.includes(reversalAgent)) {
        validationErrors.push(`reversalAgent must be one of: ${validReversals.join(', ')}`);
      }
    }

    // 5. Validate High-Risk Medication section if present
    if (highRiskMed && Object.keys(highRiskMed).length > 0) {
      const { apinchsCategory, genericDrug, route, labMarker } = highRiskMed;
      if (!apinchsCategory || !genericDrug || !route || !labMarker) {
        validationErrors.push('High-risk medication section requires apinchsCategory, genericDrug, route, and labMarker');
      }
      const validRoutes = ['IV', 'Oral', 'IM', 'SC', 'Topical'];
      if (route && !validRoutes.includes(route)) {
        validationErrors.push(`route must be one of: ${validRoutes.join(', ')}`);
      }
    }

    // 6. Validate Doctor's Note length (max 100 words)
    if (doctorNote) {
      const words = doctorNote.trim().split(/\s+/).filter(Boolean);
      if (words.length > 100) {
        validationErrors.push('Doctor note exceeds maximum limit of 100 words');
      }
    }

    // 7. Check minimum data requirement
    const hasSection =
      (allergy && Object.keys(allergy).length > 0) ||
      (diabetes && Object.keys(diabetes).length > 0) ||
      (implant && Object.keys(implant).length > 0) ||
      (bloodThinner && Object.keys(bloodThinner).length > 0) ||
      (highRiskMed && Object.keys(highRiskMed).length > 0) ||
      (doctorNote && doctorNote.trim().length > 0);

    if (!hasSection) {
      validationErrors.push('At least one clinical section or a doctor note must be provided');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const defaultAdmittedAt = admittedAt
      ? new Date(admittedAt)
      : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days prior

    let facilityId = (req.user && req.user.role === 'facility') ? req.user.id : null;
    let actorName = (req.user && req.user.role === 'facility') ? req.user.staffEmployeeId : null;
    let facilityName = (req.user && req.user.role === 'facility') ? req.user.facilityName : null;

    if (!facilityId) {
      const defaultFacility = await FacilityCredential.findOne();
      if (defaultFacility) {
        facilityId = defaultFacility._id;
        facilityName = defaultFacility.facilityName || 'City General Hospital';
        actorName = defaultFacility.staffEmployeeId || 'EMP-883100';
      } else {
        facilityName = 'City General Hospital';
        actorName = 'EMP-883100';
      }
    }

    const dischargeDoc = new DischargeEntry({
      patientId: patient._id,
      facilityId: facilityId || patient._id,
      admittedAt: defaultAdmittedAt,
      submittedAt: new Date(),
      allergy: allergy && Object.keys(allergy).length > 0 ? allergy : undefined,
      diabetes: diabetes && Object.keys(diabetes).length > 0 ? diabetes : undefined,
      implant: implant && Object.keys(implant).length > 0 ? implant : undefined,
      bloodThinner: bloodThinner && Object.keys(bloodThinner).length > 0 ? bloodThinner : undefined,
      highRiskMed: highRiskMed && Object.keys(highRiskMed).length > 0 ? highRiskMed : undefined,
      doctorNote: doctorNote ? doctorNote.trim() : undefined,
      reviewedAndConfirmed: true
    });

    await dischargeDoc.save();

    // Log audit entry
    await AuditService.logAccess({
      patientId: patient._id,
      actorType: 'facility',
      actorId: facilityId || patient._id,
      actorName,
      facilityName,
      dataAccessed: 'Discharge entry submission',
      accessType: 'discharge',
      tone: 'warn'
    });

    return res.status(201).json({
      dischargeId: dischargeDoc._id,
      submittedAt: dischargeDoc.submittedAt
    });
  } catch (error) {
    console.error('submitDischarge error:', error);
    return res.status(500).json({ error: 'Server error submitting discharge entry' });
  }
};

module.exports = {
  submitDischarge
};
