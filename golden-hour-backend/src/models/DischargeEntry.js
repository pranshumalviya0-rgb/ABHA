const mongoose = require('mongoose');

const allergySectionSchema = new mongoose.Schema(
  {
    allergen: {
      type: String,
      required: true,
      trim: true
    },
    reactionSeverity: {
      type: String,
      required: true,
      trim: true
    },
    clinicalManifestation: {
      type: String,
      required: true,
      trim: true
    },
    epinephrineRequired: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const diabetesSectionSchema = new mongoose.Schema(
  {
    treatmentPathway: {
      type: String,
      required: true,
      trim: true
    },
    hba1cPercent: {
      type: Number,
      required: true,
      min: 3.0,
      max: 20.0
    },
    dkaHistory: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const implantSectionSchema = new mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: true,
      trim: true
    },
    mriClass: {
      type: String,
      required: true,
      trim: true
    },
    serialNo: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const bloodThinnerSectionSchema = new mongoose.Schema(
  {
    drugName: {
      type: String,
      required: true,
      trim: true
    },
    lastDoseAt: {
      type: Date,
      required: true
    },
    targetInr: {
      type: Number,
      required: true,
      min: 1.0,
      max: 5.0
    },
    reversalAgent: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const highRiskMedSectionSchema = new mongoose.Schema(
  {
    apinchsCategory: {
      type: String,
      required: true,
      trim: true
    },
    genericDrug: {
      type: String,
      required: true,
      trim: true
    },
    route: {
      type: String,
      required: true,
      trim: true
    },
    labMarker: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const dischargeEntrySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FacilityCredential',
      required: true,
      index: true
    },
    admittedAt: {
      type: Date,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    allergy: {
      type: allergySectionSchema,
      required: false,
      default: null
    },
    diabetes: {
      type: diabetesSectionSchema,
      required: false,
      default: null
    },
    implant: {
      type: implantSectionSchema,
      required: false,
      default: null
    },
    bloodThinner: {
      type: bloodThinnerSectionSchema,
      required: false,
      default: null
    },
    highRiskMed: {
      type: highRiskMedSectionSchema,
      required: false,
      default: null
    },
    doctorNote: {
      type: String,
      required: false,
      default: '',
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 100;
        },
        message: 'Doctor note cannot exceed 100 words'
      }
    },
    reviewedAndConfirmed: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DischargeEntry', dischargeEntrySchema);
