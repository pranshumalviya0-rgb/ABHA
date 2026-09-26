const mongoose = require('mongoose');

const facilityCredentialSchema = new mongoose.Schema(
  {
    hfrId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    staffEmployeeId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    facilityName: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },
    lastLoginAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index on (hfrId, staffEmployeeId)
facilityCredentialSchema.index({ hfrId: 1, staffEmployeeId: 1 }, { unique: true });

module.exports = mongoose.model('FacilityCredential', facilityCredentialSchema);
