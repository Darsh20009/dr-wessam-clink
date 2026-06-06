const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { date, startDate, endDate, patientId, status } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    }
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (req.user.role === 'patient') {
      query.patientId = req.user.patientId;
    }
    const appointments = await Appointment.find(query).sort({ date: 1 }).populate('patientId', 'fullName phone');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, doctorOnly, async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, doctorOnly, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, doctorOnly, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الموعد' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
