const express = require('express');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, doctorOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(startOfDay); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(startOfDay); nextWeek.setDate(nextWeek.getDate() + 7);

    const [totalPatients, newThisMonth, todayAppointments, upcomingAppointments, payments, overduePatients] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true, createdAt: { $gte: startOfMonth } }),
      Appointment.countDocuments({ date: { $gte: startOfDay, $lt: tomorrow }, status: 'scheduled' }),
      Appointment.find({ date: { $gte: startOfDay, $lte: nextWeek }, status: 'scheduled' }).sort({ date: 1 }).limit(5).populate('patientId', 'fullName'),
      Payment.find({ date: { $gte: startOfMonth } }),
      Patient.countDocuments({ isActive: true, 'financials.status': 'overdue' }),
    ]);

    const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = await Patient.aggregate([
      { $match: { isActive: true, 'financials.remaining': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$financials.remaining' } } }
    ]);

    res.json({
      totalPatients,
      newThisMonth,
      todayAppointments,
      upcomingAppointments,
      monthlyRevenue,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      overduePatients,
    });
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
      Payment.find({ date: { $gte: startDate } }),
      Appointment.find({ date: { $gte: startDate } }),
      Patient.find({ createdAt: { $gte: startDate }, isActive: true }),
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
      newPatients: newPatients.length,
      revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
