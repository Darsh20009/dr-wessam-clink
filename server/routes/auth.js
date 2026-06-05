const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'رقم الجوال غير مسجل' });
    if (!user.password) return res.status(400).json({ message: 'يرجى تفعيل حسابك أولاً', needsSetup: true });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, patientId: user.patientId } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

router.post('/setup-password', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const patient = await Patient.findOne({ phone });
    if (!patient) return res.status(400).json({ message: 'لا يوجد ملف طبي بهذا الرقم' });

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ name: patient.fullName, phone, role: 'patient', patientId: patient._id });
    }
    user.password = password;
    user.isFirstLogin = false;
    if (!user.patientId) user.patientId = patient._id;
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, patientId: user.patientId } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

router.post('/doctor/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, role: 'doctor' });
    if (!user) return res.status(400).json({ message: 'بيانات الطبيب غير صحيحة' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

router.post('/seed-doctor', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'doctor' });
    if (existing) return res.json({ message: 'Doctor already exists' });
    
    const doctor = new User({
      name: 'د. وسام يوسف',
      phone: '01000000000',
      password: 'doctor123',
      role: 'doctor'
    });
    await doctor.save();
    res.json({ message: 'Doctor created', phone: '01000000000', password: 'doctor123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
