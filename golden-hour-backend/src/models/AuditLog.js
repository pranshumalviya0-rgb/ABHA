const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    actorType: {
      type: String,
      required: true,
      enum: ['staff', 'facility', 'patient']
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    actorName: {
      type: String,
      required: true,
      trim: true
    },
    facilityName: {
      type: String,
      required: false,
      trim: true
    },
    dataAccessed: {
      type: String,
      required: true,
      trim: true
    },
    accessType: {
      type: String,
      required: true,
      enum: ['emergency', 'discharge', 'self', 'registration']
    },
    tone: {
      type: String,
      required: true,
      enum: ['emergency', 'warn', 'ok']
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  },
  {
    // Logs are immutable, so we explicitly do not add timestamps (updatedAt)
    timestamps: false
  }
);

// Create compound index for paginated queries
auditLogSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
