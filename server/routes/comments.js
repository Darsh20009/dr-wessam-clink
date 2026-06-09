const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ message: 'patientId مطلوب' });
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== patientId) return res.status(403).json({ message: 'غير مصرح' });
    }
    const comments = await Comment.find({ patientId, isDeleted: false, parentId: null }).sort({ createdAt: 1 });
    const replies = await Comment.find({ patientId, isDeleted: false, parentId: { $ne: null } }).sort({ createdAt: 1 });
    const result = comments.map(c => ({
      ...c.toObject(),
      replies: replies.filter(r => r.parentId?.toString() === c._id.toString()),
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { patientId, text } = req.body;
    if (!patientId || !text?.trim()) return res.status(400).json({ message: 'patientId والنص مطلوبان' });
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== patientId) return res.status(403).json({ message: 'غير مصرح' });
    }
    const comment = await Comment.create({
      patientId, text: text.trim(),
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
    });
    res.status(201).json({ ...comment.toObject(), replies: [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/reply', auth, async (req, res) => {
  try {
    if (!['doctor', 'employee'].includes(req.user.role)) return res.status(403).json({ message: 'فقط الطبيب أو الموظف يمكنه الرد' });
    const parent = await Comment.findById(req.params.id);
    if (!parent) return res.status(404).json({ message: 'التعليق غير موجود' });
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'النص مطلوب' });
    const reply = await Comment.create({
      patientId: parent.patientId, text: text.trim(),
      authorId: req.user._id, authorName: req.user.name, authorRole: req.user.role,
      parentId: parent._id,
    });
    res.status(201).json(reply);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'التعليق غير موجود' });
    if (req.user.role !== 'doctor' && comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح' });
    }
    comment.isDeleted = true;
    await comment.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
