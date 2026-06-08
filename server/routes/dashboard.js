const express = require('express');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

const statsCache = { data: null, ts: 0 };
const CACHE_TTL = 60 * 1000;

router.get('/stats', auth, doctorOnly, async (req, res) => {
  try {
    if (statsCache.data && Date.now() - statsCache.ts < CACHE_TTL) {
      return res.json(statsCache.data);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(startOfDay); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(startOfDay); nextWeek.setDate(nextWeek.getDate() + 7);

    const [totalPatients, newThisMonth, todayAppointments, upcomingAppointments, payments, overduePatients, totalOutstanding] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true, createdAt: { $gte: startOfMonth } }),
      Appointment.countDocuments({ date: { $gte: startOfDay, $lt: tomorrow }, status: 'scheduled' }),
      Appointment.find({ date: { $gte: startOfDay, $lte: nextWeek }, status: 'scheduled' })
        .sort({ date: 1 }).limit(5)
        .populate('patientId', 'fullName')
        .lean(),
      Payment.find({ date: { $gte: startOfMonth } }).select('amount').lean(),
      Patient.countDocuments({ isActive: true, 'financials.status': 'overdue' }),
      Patient.aggregate([
        { $match: { isActive: true, 'financials.remaining': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$financials.remaining' } } }
      ]),
    ]);

    const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const result = {
      totalPatients,
      newThisMonth,
      todayAppointments,
      upcomingAppointments,
      monthlyRevenue,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      overduePatients,
    };

    statsCache.data = result;
    statsCache.ts = Date.now();

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reports', auth, doctorOnly, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    if (period === 'day') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
    else if (period === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);

    const [payments, appointments, newPatients] = await Promise.all([
      Payment.find({ date: { $gte: startDate } }).select('amount date').lean(),
      Appointment.find({ date: { $gte: startDate } }).select('status').lean(),
      Patient.countDocuments({ createdAt: { $gte: startDate }, isActive: true }),
    ]);

    const revenueByDay = {};
    payments.forEach(p => {
      const day = p.date.toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + p.amount;
    });

    res.json({
      totalRevenue: payments.reduce((s, p) => s + p.amount, 0),
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      newPatients,
      revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
