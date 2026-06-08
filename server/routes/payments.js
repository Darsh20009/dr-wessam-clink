const express = require('express');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, doctorOnly, async (req, res) => {
  try {
    const { patientId, startDate, endDate } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const payments = await Payment.find(query).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, doctorOnly, async (req, res) => {
  try {
    const { patientId, amount, type, method, notes, sessionId } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'المريض غير موجود' });

    const payment = new Payment({ patientId, patientName: patient.fullName, amount, type, method, notes, sessionId });
    await payment.save();

    patient.financials.totalPaid = (patient.financials.totalPaid || 0) + amount;
    patient.financials.remaining = patient.financials.totalCost - patient.financials.totalPaid;
    if (patient.financials.totalPaid >= patient.financials.totalCost && patient.financials.totalCost > 0) {
      patient.financials.status = 'paid';
    } else if (patient.financials.totalPaid > 0) {
      patient.financials.status = 'partial';
    }
    await patient.save();

    res.status(201).json({ payment, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, doctorOnly, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'الدفعة غير موجودة' });

    const patient = await Patient.findById(payment.patientId);
    if (patient) {
      patient.financials.totalPaid = Math.max(0, (patient.financials.totalPaid || 0) - payment.amount);
      patient.financials.remaining = (patient.financials.totalCost || 0) - patient.financials.totalPaid;
      if (patient.financials.totalPaid <= 0) {
        patient.financials.status = 'pending';
      } else if (patient.financials.totalPaid < patient.financials.totalCost) {
        patient.financials.status = 'partial';
      }
      await patient.save();
    }

    await payment.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', auth, doctorOnly, async (req, res) => {
  try {
    const { period } = req.query;
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === 'week') { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
    if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);

    const payments = await Payment.find({ date: { $gte: startDate } });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ total, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
