const express = require('express');
const Notification = require('../models/Notification');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query.isForDoctor = true;
    } else {
      query.userId = req.user._id;
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    let query = req.user.role === 'doctor' ? { isForDoctor: true } : { userId: req.user._id };
    await Notification.updateMany({ ...query, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, doctorOnly, async (req, res) => {
  try {
    const notif = new Notification({ ...req.body, isForDoctor: req.body.isForDoctor || false });
    await notif.save();
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
