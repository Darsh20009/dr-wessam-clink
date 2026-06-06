const express = require('express');
const PushSubscription = require('../models/PushSubscription');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'بيانات الاشتراك غير مكتملة' });
    }
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.user._id, userRole: req.user.role, endpoint, keys, isActive: true, userAgent: req.headers['user-agent'] },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.findOneAndDelete({ endpoint, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/subscriptions', auth, async (req, res) => {
  try {
    const subs = await PushSubscription.find({ userId: req.user._id, isActive: true });
    res.json({ subscribed: subs.length > 0, count: subs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
