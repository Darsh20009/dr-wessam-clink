const express = require('express');
const Session = require('../models/Session');
const Patient = require('../models/Patient');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (req.user.role === 'patient') query.patientId = req.user.patientId;
    const sessions = await Session.find(query).sort({ sessionDate: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, doctorOnly, async (req, res) => {
  try {
    const count = await Session.countDocuments({ patientId: req.body.patientId });
    const session = new Session({ ...req.body, sessionNumber: count + 1 });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, doctorOnly, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, doctorOnly, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الجلسة' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/images', auth, doctorOnly, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'الجلسة غير موجودة' });
    session.images.push(req.body);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
