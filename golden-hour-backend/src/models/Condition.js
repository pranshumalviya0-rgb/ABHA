const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    since: {
      type: String,
      required: false,
      trim: true
    },
    notes: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Condition', conditionSchema);
