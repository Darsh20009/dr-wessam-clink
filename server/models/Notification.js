const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['appointment', 'payment', 'reminder', 'system', 'info'], default: 'info' },
  isRead: { type: Boolean, default: false },
  isForDoctor: { type: Boolean, default: false },
  relatedId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
