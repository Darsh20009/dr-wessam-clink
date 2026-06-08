const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Normalize Egyptian phone numbers — accept 01xxxxxxxx, 1xxxxxxxx, +201xxxxxxxx, 201xxxxxxxx
const normalizePhone = (raw = '') => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('20')) return '0' + digits.slice(2);
  if (!digits.startsWith('0') && digits.length === 10) return '0' + digits;
  return digits;
};

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const phone = normalizePhone(req.body.phone);
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
    const { password } = req.body;
    const phone = normalizePhone(req.body.phone);
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

// ── Reset Password (Forgot Password) ─────────────────────────────
// Patient verifies with patientId + phone, then sets new password
router.post('/verify-identity', async (req, res) => {
  try {
    const { patientId } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!patientId || !phone) return res.status(400).json({ message: 'يرجى إدخال رقم الملف ورقم الجوال' });

    const patient = await Patient.findOne({ _id: patientId, phone });
    if (!patient) return res.status(400).json({ message: 'بيانات غير صحيحة. تأكد من رقم الملف ورقم جوالك' });

    res.json({ verified: true, name: patient.fullName, patientId: patient._id });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'رقم الملف غير صحيح' });
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { patientId, newPassword } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!patientId || !phone || !newPassword) return res.status(400).json({ message: 'بيانات ناقصة' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });

    const patient = await Patient.findOne({ _id: patientId, phone });
    if (!patient) return res.status(400).json({ message: 'بيانات غير صحيحة' });

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ name: patient.fullName, phone, role: 'patient', patientId: patient._id });
    }
    user.password = newPassword;
    user.patientId = patient._id;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, patientId: user.patientId } });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'رقم الملف غير صحيح' });
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

router.post('/doctor/login', async (req, res) => {
  try {
    const { password } = req.body;
    const phone = normalizePhone(req.body.phone);
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

// ── Public patient self-registration ─────────────────────────────
router.post('/register-patient', async (req, res) => {
  try {
    const { fullName, password, age, address, consultationType } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!fullName || !phone || !password)
      return res.status(400).json({ message: 'الاسم ورقم الجوال وكلمة المرور مطلوبة' });
    if (password.length < 6)
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });

    const existingPatient = await Patient.findOne({ phone });
    if (existingPatient)
      return res.status(400).json({ message: 'رقم الجوال مسجل بالفعل، يمكنك تسجيل الدخول مباشرة', alreadyExists: true });

    const notes = consultationType === 'phone'
      ? 'طلب المريض استشارة هاتفية عبر الموقع'
      : 'فتح ملف من الموقع — في انتظار الكشف في العيادة';

    const patient = new Patient({
      fullName,
      phone,
      age: age ? parseInt(age) : undefined,
      address: address || undefined,
      diagnosis: consultationType === 'phone' ? 'طلب استشارة هاتفية' : 'في انتظار الكشف',
      treatmentNotes: notes,
    });
    await patient.save();

    const user = new User({
      name: fullName,
      phone,
      password,
      role: 'patient',
      patientId: patient._id,
    });
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      patientId: patient._id,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, patientId: patient._id },
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'رقم الجوال مسجل بالفعل، يمكنك تسجيل الدخول' });
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// ── QR Token Generate (doctor only) ──────────────────────────────
router.post('/qr-generate', auth, async (req, res) => {
  try {
    const crypto = require('crypto');
    const qrToken = crypto.randomBytes(32).toString('hex');
    await require('../models/User').findByIdAndUpdate(req.user._id, { qrToken });
    res.json({ qrToken });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في إنشاء الباركود' });
  }
});

// ── QR Login ─────────────────────────────────────────────────────
router.post('/qr-login', async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) return res.status(400).json({ message: 'باركود مفقود' });
    const user = await require('../models/User').findOne({ qrToken });
    if (!user) return res.status(400).json({ message: 'باركود غير صالح أو منتهي' });
    const token = generateToken(user._id);
    res.json({ token, role: user.role, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول بالباركود' });
  }
});

router.post('/seed-doctor', async (req, res) => {
  try {
    let doctor = await User.findOne({ role: 'doctor' });
    if (doctor) {
      doctor.phone = '01156798324';
      doctor.name = 'د. وسام يوسف';
      await doctor.save();
      return res.json({ message: 'Doctor updated', phone: '01156798324' });
    }
    doctor = new User({
      name: 'د. وسام يوسف',
      phone: '01156798324',
      password: 'doctor123',
      role: 'doctor'
    });
    await doctor.save();
    res.json({ message: 'Doctor created', phone: '01156798324', password: 'doctor123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
