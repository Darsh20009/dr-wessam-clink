const mongoose = require('mongoose');

const sessionImageSchema = new mongoose.Schema({
  type: String,
  url: String,
  notes: String,
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
}, { timestamps: true });

module.exports = mongoose.model('Session', treatmentSessionSchema);
