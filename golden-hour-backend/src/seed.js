const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Patient = require('./models/Patient');
const StaffCredential = require('./models/StaffCredential');
const FacilityCredential = require('./models/FacilityCredential');
const Condition = require('./models/Condition');
const DischargeEntry = require('./models/DischargeEntry');
const AuditLog = require('./models/AuditLog');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/golden_hour';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing sample collections
    await Promise.all([
      Patient.deleteMany({}),
      StaffCredential.deleteMany({}),
      FacilityCredential.deleteMany({}),
      Condition.deleteMany({}),
      DischargeEntry.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // 1. Create Staff Credential
    const pinHash = await bcrypt.hash('123456', 10);
    const staff = await StaffCredential.create({
      hpid: 'HPID-11-2024-8831-0042',
      pinHash,
      name: 'Dr. A. Menon',
      specialization: 'Emergency Medicine',
      active: true
    });
    console.log('Created Staff: Dr. A. Menon (HPID-11-2024-8831-0042, PIN: 123456)');

    // 2. Create Facility Credential
    const facilityPasswordHash = await bcrypt.hash('Facility@123', 12);
    const facility = await FacilityCredential.create({
      hfrId: 'IN-HFR-2024-0012',
      staffEmployeeId: 'EMP-883100',
      passwordHash: facilityPasswordHash,
      facilityName: 'City General Hospital',
      city: 'Pune',
      state: 'Maharashtra',
      active: true
    });
    console.log('Created Facility Staff: EMP-883100 @ IN-HFR-2024-0012 (Password: Facility@123)');

    // 3. Create Sample Patient
    const patientPasswordHash = await bcrypt.hash('Patient@123', 12);
    const patient = await Patient.create({
      abhaId: '12345678901234',
      abhaAddress: 'rahul.sharma@abdm',
      fullName: 'Rahul Sharma',
      dob: new Date('1983-06-14'),
      gender: 'Male',
      address: 'Flat 402, Green Meadows, Kothrud, Pune, Maharashtra - 411038',
      bloodGroup: 'O+',
      weight_kg: 72,
      height_cm: 176,
      passwordHash: patientPasswordHash,
      mobileNumber: '+919822045210',
      primaryContact: '+91 98220 45210',
      secondaryContact: '+91 90040 88455',
      aadhaarHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      consentGiven: true,
      consentAt: new Date(),
      cardRequested: false,
      tokenVersion: 0
    });
    console.log('Created Patient: Rahul Sharma (12345678901234 / rahul.sharma@abdm, Password: Patient@123)');

    // 4. Create Sample Conditions
    await Condition.create([
      {
        patientId: patient._id,
        name: 'Type 2 Diabetes',
        since: '2018',
        notes: 'Managed with Metformin and lifestyle modification'
      },
      {
        patientId: patient._id,
        name: 'Hypertension',
        since: '2020',
        notes: 'On Telmisartan 40mg daily'
      }
    ]);
    console.log('Created Sample Conditions for Rahul Sharma');

    // 5. Create Sample Discharge Entry
    await DischargeEntry.create({
      patientId: patient._id,
      facilityId: facility._id,
      admittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      allergy: {
        allergen: 'Penicillin',
        reactionSeverity: 'Class 4 — Life-threatening (anaphylactic shock)',
        clinicalManifestation: 'Anaphylaxis',
        epinephrineRequired: true
      },
      diabetes: {
        treatmentPathway: 'Oral medication',
        hba1cPercent: 7.4,
        dkaHistory: false
      },
      doctorNote: 'Patient recovered steadily. Advised low GI diet and regular glycemic monitoring.',
      reviewedAndConfirmed: true
    });
    console.log('Created Sample Discharge History for Rahul Sharma');

    // 6. Create Sample Audit Log
    await AuditLog.create({
      patientId: patient._id,
      actorType: 'staff',
      actorId: staff._id,
      actorName: 'Dr. A. Menon (HPID-11-2024-8831-0042)',
      facilityName: 'City General Hospital',
      dataAccessed: 'Full emergency record',
      accessType: 'emergency',
      tone: 'emergency',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    console.log('Created Sample Audit Log.');

    console.log('\n==================================================');
    console.log('  Database seeding completed successfully!       ');
    console.log('==================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
