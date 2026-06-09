const express = require('express');
const router = express.Router();
const PaymentRequest = require('../models/PaymentRequest');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');
const { fireNotify, fireNotifyAdmins } = require('../utils/fireNotify');

// ── Patient: submit new payment request ──────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { amount, paymentType, receiptImage, notes } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'المبلغ غير صحيح' });
    if (!receiptImage) return res.status(400).json({ message: 'يرجى رفع صورة سند التحويل' });

    const patient = await Patient.findById(req.user.patientId);
    if (!patient) return res.status(404).json({ message: 'لم يتم العثور على ملف المريض' });

    const pr = await PaymentRequest.create({
      patientId: patient._id,
      userId: req.user._id,
      amount,
      paymentType: paymentType || 'custom',
      receiptImage,
      notes: notes || '',
      status: 'pending',
    });

    await fireNotifyAdmins(
      '💳 طلب دفع جديد عبر InstaPay',
      `${patient.fullName} أرسل دفعة ${amount.toLocaleString()} ج.م — في انتظار التأكيد`,
      { type: 'payment', link: '/doctor/payment-requests', patientId: patient._id }
    );

    res.status(201).json(pr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Patient: my payment requests ─────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.patientId);
    if (!patient) return res.json([]);
    const list = await PaymentRequest.find({ patientId: patient._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Doctor: all payment requests ─────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'غير مصرح' });
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const list = await PaymentRequest.find(filter)
      .populate('patientId', 'fullName phone financials')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Doctor: approve ───────────────────────────────────────────────
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'غير مصرح' });
    const pr = await PaymentRequest.findById(req.params.id).populate('patientId');
    if (!pr) return res.status(404).json({ message: 'الطلب غير موجود' });

    pr.status = 'approved';
    pr.doctorNotes = req.body.doctorNotes || '';
    await pr.save();

    await Payment.create({
      patientId: pr.patientId._id,
      amount: pr.amount,
      method: 'transfer',
      type: pr.paymentType === 'remaining' ? 'full' : 'partial',
      notes: `دفع عبر InstaPay — تم التأكيد`,
    });

    const patient = await Patient.findById(pr.patientId._id);
    if (patient) {
      patient.financials.totalPaid = (patient.financials.totalPaid || 0) + pr.amount;
      patient.financials.remaining = (patient.financials.totalCost || 0) - patient.financials.totalPaid;
      if (patient.financials.totalPaid >= patient.financials.totalCost && patient.financials.totalCost > 0) {
        patient.financials.status = 'paid';
      } else if (patient.financials.totalPaid > 0) {
        patient.financials.status = 'partial';
      }
      await patient.save();
    }

    if (pr.userId) {
      await fireNotify(
        pr.userId,
        '✅ تم تأكيد دفعتك',
        `تم قبول دفعة ${pr.amount.toLocaleString()} ج.م بنجاح. شكراً لك!`,
        { type: 'payment', link: '/portal', patientId: pr.patientId._id }
      );
    }

    res.json({ message: 'تم تأكيد الدفع', pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Doctor: reject ────────────────────────────────────────────────
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'غير مصرح' });
    const pr = await PaymentRequest.findById(req.params.id).populate('patientId');
    if (!pr) return res.status(404).json({ message: 'الطلب غير موجود' });

    pr.status = 'rejected';
    pr.doctorNotes = req.body.doctorNotes || 'تم رفض الطلب';
    await pr.save();

    if (pr.userId) {
      await fireNotify(
        pr.userId,
        '❌ تم رفض طلب الدفع',
        pr.doctorNotes,
        { type: 'payment', link: '/portal', patientId: pr.patientId._id }
      );
    }

    res.json({ message: 'تم رفض الطلب', pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Doctor: request re-upload ─────────────────────────────────────
router.patch('/:id/request-reupload', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'غير مصرح' });
    const pr = await PaymentRequest.findById(req.params.id).populate('patientId');
    if (!pr) return res.status(404).json({ message: 'الطلب غير موجود' });

    pr.status = 'reupload-requested';
    pr.doctorNotes = req.body.doctorNotes || 'يرجى إعادة رفع سند التحويل بصورة أوضح';
    await pr.save();

    if (pr.userId) {
      await fireNotify(
        pr.userId,
        '🔄 يرجى إعادة رفع سند التحويل',
        pr.doctorNotes,
        { type: 'payment', link: '/portal', patientId: pr.patientId._id }
      );
    }

    res.json({ message: 'تم طلب إعادة الرفع', pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Patient: re-upload receipt ────────────────────────────────────
router.patch('/:id/reupload', auth, async (req, res) => {
  try {
    const pr = await PaymentRequest.findById(req.params.id);
    if (!pr) return res.status(404).json({ message: 'الطلب غير موجود' });
    if (pr.userId?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'غير مصرح' });

    const { receiptImage, notes } = req.body;
    if (!receiptImage) return res.status(400).json({ message: 'يرجى رفع صورة السند' });

    pr.receiptImage = receiptImage;
    pr.notes = notes || pr.notes;
    pr.status = 'pending';
    pr.doctorNotes = '';
    await pr.save();

    const patient = await Patient.findById(pr.patientId);
    await fireNotifyAdmins(
      '🔄 إعادة رفع سند دفع',
      `${patient?.fullName || 'مريض'} أعاد رفع سند دفعة ${pr.amount.toLocaleString()} ج.م`,
      { type: 'payment', link: '/doctor/payment-requests', patientId: pr.patientId }
    );

    res.json({ message: 'تم إعادة رفع السند', pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
