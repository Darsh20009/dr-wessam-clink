const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, doctorOnly, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    let query = { isActive: true };
    if (search) query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { phone: { $regex: search } }];
    const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Patient.countDocuments(query);
    res.json({ patients, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });
    if (req.user.role === 'patient' && patient._id.toString() !== req.user.patientId?.toString()) {
      return res.status(403).json({ message: 'غير مصرح به' });
    }
    if (req.user.role === 'patient') {
      const vis = patient.visibility || {};
      const filtered = patient.toObject();
      if (vis.diagnosis === false) { filtered.diagnosis = null; filtered.treatmentNotes = null; }
      if (vis.treatmentPlan === false) filtered.treatmentPlan = null;
      if (vis.treatmentStages === false) filtered.treatmentStages = null;
      if (vis.instructions === false) filtered.instructions = null;
      if (vis.faceImages === false) filtered.faceImages = [];
      else filtered.faceImages = (filtered.faceImages || []).filter(img => img.isVisibleToPatient !== false);
      if (vis.intraOralImages === false) filtered.intraOralImages = [];
      else filtered.intraOralImages = (filtered.intraOralImages || []).filter(img => img.isVisibleToPatient !== false);
      if (vis.xrays === false) filtered.xrays = [];
      else filtered.xrays = (filtered.xrays || []).filter(img => img.isVisibleToPatient !== false);
      if (vis.financials === false) filtered.financials = null;
      delete filtered.visibility;
      return res.json(filtered);
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, doctorOnly, async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, age, address, diagnosis, treatmentPlan, financials } = req.body;
    const existing = await Patient.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'رقم الجوال مسجل مسبقاً' });
    const patient = new Patient({ fullName, phone, dateOfBirth, age, address, diagnosis, treatmentPlan, financials: financials || {} });
    await patient.save();
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ name: fullName, phone, role: 'patient', patientId: patient._id });
      await user.save();
    } else {
      user.patientId = patient._id;
      await user.save();
    }
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, doctorOnly, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, doctorOnly, async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'تم حذف الملف' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/images', auth, doctorOnly, async (req, res) => {
  try {
    const { category, imageData } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });
    if (category === 'face') patient.faceImages.push(imageData);
    else if (category === 'intraoral') patient.intraOralImages.push(imageData);
    else if (category === 'xray') patient.xrays.push(imageData);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/images/:category/:imageId', auth, doctorOnly, async (req, res) => {
  try {
    const { category, imageId } = req.params;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });
    let arr;
    if (category === 'face') arr = patient.faceImages;
    else if (category === 'intraoral') arr = patient.intraOralImages;
    else if (category === 'xray') arr = patient.xrays;
    else return res.status(400).json({ message: 'فئة غير صحيحة' });
    const img = arr.id(imageId);
    if (!img) return res.status(404).json({ message: 'الصورة غير موجودة' });
    Object.assign(img, req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/images/:category/:imageId', auth, doctorOnly, async (req, res) => {
  try {
    const { category, imageId } = req.params;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });
    if (category === 'face') patient.faceImages = patient.faceImages.filter(img => img._id.toString() !== imageId);
    else if (category === 'intraoral') patient.intraOralImages = patient.intraOralImages.filter(img => img._id.toString() !== imageId);
    else if (category === 'xray') patient.xrays = patient.xrays.filter(img => img._id.toString() !== imageId);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/visibility', auth, doctorOnly, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: { visibility: req.body } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
