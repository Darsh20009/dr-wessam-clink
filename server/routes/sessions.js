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
    if (req.user.role === 'patient') {
      const filtered = sessions
        .filter(s => s.isVisibleToPatient !== false)
        .map(s => {
          const so = s.toObject();
          so.images = (so.images || []).filter(img => img.isVisibleToPatient !== false);
          return so;
        });
      return res.json(filtered);
    }
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

router.patch('/:id/images/:imageId', auth, doctorOnly, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'الجلسة غير موجودة' });
    const img = session.images.id(req.params.imageId);
    if (!img) return res.status(404).json({ message: 'الصورة غير موجودة' });
    Object.assign(img, req.body);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/images/:imageId', auth, doctorOnly, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'الجلسة غير موجودة' });
    session.images = session.images.filter(img => img._id.toString() !== req.params.imageId);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/visibility', auth, doctorOnly, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { isVisibleToPatient: req.body.isVisibleToPatient },
      { new: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
