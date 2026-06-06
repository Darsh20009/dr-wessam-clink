const mongoose = require('mongoose');

const medicalImageSchema = new mongoose.Schema({
  type: String,
  url: String,
  description1: String,
  description2: String,
  description3: String,
  notes: String,
  uploadedAt: { type: Date, default: Date.now }
});

const xraySchema = new mongoose.Schema({
  type: { type: String, enum: ['panorama', 'lateral', 'cbct'] },
  url: String,
  description: String,
  uploadedAt: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  dateOfBirth: Date,
  age: Number,
  address: String,
  diagnosis: String,
  treatmentPlan: String,
  treatmentStages: String,
  instructions: String,
  treatmentNotes: String,
  faceImages: [medicalImageSchema],
  intraOralImages: [medicalImageSchema],
  xrays: [xraySchema],
  financials: {
    totalCost: { type: Number, default: 0 },
    initialPayment: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: { type: String, enum: ['paid', 'partial', 'overdue', 'pending'], default: 'pending' }
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

patientSchema.pre('save', function(next) {
  if (this.financials) {
    this.financials.remaining = this.financials.totalCost - this.financials.totalPaid;
    if (this.financials.totalPaid >= this.financials.totalCost && this.financials.totalCost > 0) {
      this.financials.status = 'paid';
    } else if (this.financials.totalPaid > 0) {
      this.financials.status = 'partial';
    }
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
