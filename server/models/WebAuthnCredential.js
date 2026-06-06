const mongoose = require('mongoose');

const webAuthnCredentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userRole: { type: String, enum: ['doctor', 'patient'], required: true },
  credentialID: { type: String, required: true, unique: true },
  credentialPublicKey: { type: String, required: true },
  counter: { type: Number, default: 0 },
  deviceName: { type: String, default: 'جهازي' },
  transports: [String],
  aaguid: String,
  credentialDeviceType: String,
  credentialBackedUp: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('WebAuthnCredential', webAuthnCredentialSchema);
