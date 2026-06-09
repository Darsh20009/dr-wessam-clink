const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  authorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:{ type: String, required: true },
  authorRole:{ type: String, enum: ['patient', 'doctor', 'employee'], required: true },
  text:      { type: String, required: true, maxlength: 3000 },
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
