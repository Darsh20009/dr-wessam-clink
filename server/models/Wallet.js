const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['deposit', 'withdrawal', 'payment', 'refund'], required: true },
  amount: { type: Number, required: true },
  description: String,
  reference: String,
  balanceAfter: Number,
  date: { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', unique: true },
  patientName: String,
  balance: { type: Number, default: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  transactions: [transactionSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
