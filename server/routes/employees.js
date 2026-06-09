const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const doctorOnly = (req, res, next) => {
  if (req.user.role !== 'doctor') return res.status(403).json({ message: 'فقط الطبيب' });
  next();
};

router.get('/', auth, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, doctorOnly, async (req, res) => {
  try {
    const { name, phone, employeeRole, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: 'الاسم والهاتف وكلمة المرور مطلوبة' });
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'رقم الهاتف مسجّل مسبقاً' });
    const employee = await User.create({ name, phone, password, role: 'employee', employeeRole: employeeRole || 'receptionist', isFirstLogin: false });
    const result = employee.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, doctorOnly, async (req, res) => {
  try {
    const { name, phone, employeeRole, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (employeeRole) updates.employeeRole = employeeRole;
    if (password) updates.password = password;
    const employee = await User.findOneAndUpdate({ _id: req.params.id, role: 'employee' }, updates, { new: true }).select('-password');
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });
    res.json(employee);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, doctorOnly, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
