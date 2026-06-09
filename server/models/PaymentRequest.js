const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount:    { type: Number, required: true },
  paymentType: {
    type: String,
    enum: ['remaining', 'next-session', 'custom'],
    default: 'custom',
  },
  receiptImage: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reupload-requested'],
    default: 'pending',
  },
  notes:       { type: String },
  doctorNotes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
