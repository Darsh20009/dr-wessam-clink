const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: String,
  patientPhone: String,
  date: { type: Date, required: true },
  time: String,
  duration: { type: Number, default: 30 },
  type: { type: String, default: 'متابعة' },
  notes: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ patientId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
