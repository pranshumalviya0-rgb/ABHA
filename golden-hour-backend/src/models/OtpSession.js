const mongoose = require('mongoose');

const otpSessionSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      enum: ['mobile', 'abha']
    },
    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index to automatically delete expired sessions
      expires: 0
    },
    verified: {
      type: Boolean,
      required: true,
      default: false
    },
    used: {
      type: Boolean,
      required: true,
      default: false
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  },
  {
    // No updatedAt is needed, but we track createdAt manually or let mongoose do it.
    // We set timestamps: false since we have a manual createdAt
    timestamps: false
  }
);

module.exports = mongoose.model('OtpSession', otpSessionSchema);
