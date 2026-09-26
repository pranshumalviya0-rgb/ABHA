const mongoose = require('mongoose');

const staffCredentialSchema = new mongoose.Schema(
  {
    hpid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    pinHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
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

module.exports = mongoose.model('StaffCredential', staffCredentialSchema);
