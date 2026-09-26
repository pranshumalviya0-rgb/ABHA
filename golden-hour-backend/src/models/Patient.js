const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    abhaId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    abhaAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    dob: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    bloodGroup: {
      type: String,
      required: true,
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
    passwordHash: {
      type: String,
      required: true
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    primaryContact: {
      type: String,
      required: false,
      trim: true
    },
    secondaryContact: {
      type: String,
      required: false,
      trim: true
    },
    aadhaarHash: {
      type: String,
      required: true,
      trim: true
    },
    consentGiven: {
      type: Boolean,
      required: true,
      default: false
    },
    consentAt: {
      type: Date,
      required: false
    },
    cardRequested: {
      type: Boolean,
      required: true,
      default: false
    },
    cardRequestedAt: {
      type: Date,
      required: false
    },
    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Patient', patientSchema);
