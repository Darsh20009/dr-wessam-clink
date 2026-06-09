const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

function makeConvId(a, b) {
  return [a.toString(), b.toString()].sort().join('_');
}

router.get('/conversations', auth, async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const msgs = await Message.aggregate([
      { $match: { conversationId: { $regex: myId } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
    ]);
    const staff = await User.find({ role: { $in: ['doctor', 'employee'] } }).select('name role employeeRole avatar');
    const result = msgs.map(m => {
      const otherId = m.lastMessage.senderId.toString() === myId ? m.lastMessage.receiverId.toString() : m.lastMessage.senderId.toString();
      const other = staff.find(u => u._id.toString() === otherId);
      const unreadCount = 0;
      return { conversationId: m._id, lastMessage: m.lastMessage, other, unreadCount };
    });
    const staffWithConv = result.map(r => r.other?._id?.toString()).filter(Boolean);
    const noConvStaff = staff.filter(u => u._id.toString() !== myId && !staffWithConv.includes(u._id.toString()));
    res.json({ conversations: result, staff: noConvStaff });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const { with: withId } = req.query;
    if (!withId) return res.status(400).json({ message: 'with مطلوب' });
    const convId = makeConvId(req.user._id, withId);
    const messages = await Message.find({ conversationId: convId }).sort({ createdAt: 1 });
    await Message.updateMany({ conversationId: convId, receiverId: req.user._id, readAt: null }, { readAt: new Date() });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) return res.status(400).json({ message: 'المستلم والنص مطلوبان' });
    const receiver = await User.findById(receiverId).select('name role');
    if (!receiver) return res.status(404).json({ message: 'المستلم غير موجود' });
    const convId = makeConvId(req.user._id, receiverId);
    const message = await Message.create({
      senderId: req.user._id, senderName: req.user.name, senderRole: req.user.role,
      receiverId, receiverName: receiver.name,
      text: text.trim(), conversationId: convId,
    });
    res.status(201).json(message);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/read', auth, async (req, res) => {
  try {
    const { fromId } = req.body;
    const convId = makeConvId(req.user._id, fromId);
    await Message.updateMany({ conversationId: convId, receiverId: req.user._id, readAt: null }, { readAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
