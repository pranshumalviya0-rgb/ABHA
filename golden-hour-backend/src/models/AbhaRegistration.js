const mongoose = require('mongoose');

const abhaRegistrationSchema = new mongoose.Schema(
  {
    aadhaarHash: {
      type: String,
      required: true,
      trim: true
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: false
    },
    otpExpiresAt: {
      type: Date,
      required: false,
      // TTL index to automatically delete expired registration attempts
      expires: 0
    },
    fullName: {
      type: String,
      required: false,
      trim: true
    },
    dob: {
      type: Date,
      required: false
    },
    gender: {
      type: String,
      required: false,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    address: {
      type: String,
      required: false,
      trim: true
    },
    bloodGroup: {
      type: String,
      required: false,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    weight_kg: {
      type: Number,
      required: false
    },
    height_cm: {
      type: Number,
      required: false
    },
    emergencyContact: {
      type: String,
      required: false,
      trim: true
    },
    abhaHandle: {
      type: String,
      required: false,
      trim: true
    },
    consentGiven: {
      type: Boolean,
      required: false,
      default: false
    },
    status: {
      type: String,
      required: true,
      enum: ['otp_pending', 'otp_verified', 'profile_complete', 'completed', 'failed'],
      default: 'otp_pending',
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: false
    },
    failedAttempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AbhaRegistration', abhaRegistrationSchema);
