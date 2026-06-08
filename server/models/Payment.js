const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: String,
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'session', 'full', 'partial'], default: 'session' },
  method: { type: String, enum: ['cash', 'card', 'transfer', 'wallet'], default: 'cash' },
  notes: String,
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

paymentSchema.index({ date: 1 });
paymentSchema.index({ patientId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
