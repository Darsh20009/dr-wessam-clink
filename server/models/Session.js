const mongoose = require('mongoose');

const sessionImageSchema = new mongoose.Schema({
  type: String,
  url: String,
  notes: String,
  isVisibleToPatient: { type: Boolean, default: true },
  uploadedAt: { type: Date, default: Date.now }
});

const treatmentSessionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  sessionDate: { type: Date, required: true },
  images: [sessionImageSchema],
  amountPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  nextAppointment: Date,
  nextStep: String,
  notes: String,
  sessionNumber: Number,
  isVisibleToPatient: { type: Boolean, default: true },
  medicines: [{
    name: { type: String, required: true },
    dose: { type: String, default: '' },
    duration: { type: String, default: '' },
    notes: { type: String, default: '' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Session', treatmentSessionSchema);
