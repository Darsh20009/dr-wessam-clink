const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName:     { type: String, required: true },
  senderRole:     { type: String },
  receiverId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverName:   { type: String },
  text:           { type: String, required: true, maxlength: 5000 },
  conversationId: { type: String, required: true, index: true },
  readAt:         { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
