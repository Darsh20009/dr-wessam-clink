const mongoose = require('mongoose');

const SharedReportSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  htmlContent: { type: String, required: true },
  patientName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
});

SharedReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SharedReport', SharedReportSchema);
