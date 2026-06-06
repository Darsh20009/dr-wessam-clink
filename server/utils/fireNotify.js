const webpush = require('web-push');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@dr-wessam.online',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let wsClients = {};

const registerWsClient = (userId, ws) => {
  wsClients[userId.toString()] = ws;
};

const unregisterWsClient = (userId) => {
  delete wsClients[userId.toString()];
};

const sendPushToUser = async (userId, payload) => {
  try {
    const subs = await PushSubscription.find({ userId, isActive: true });
    const deadSubs = [];
    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({ title: payload.title, body: payload.body, icon: payload.icon || '/logo.png', data: payload.data || {} })
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadSubs.push(sub._id);
        }
      }
    }));
    if (deadSubs.length > 0) {
      await PushSubscription.deleteMany({ _id: { $in: deadSubs } });
    }
  } catch (err) {
    console.error('Push error:', err.message);
  }
};

const fireNotify = async (userId, title, body, opts = {}) => {
  const { type = 'info', link = '/', icon = '🔔', patientId, isForDoctor = false } = opts;

  // Layer 1: DB
  const notif = await Notification.create({ userId, patientId, title, message: body, type, isForDoctor });

  // Layer 2: WebSocket (real-time if app is open)
  const ws = wsClients[userId.toString()];
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'notification', _id: notif._id, title, body, notifType: type, link }));
  }

  // Layer 3: Web Push (even if app is closed)
  await sendPushToUser(userId, { title, body, icon: '/logo.png', data: { url: link } });

  return notif;
};

const fireNotifyAdmins = async (title, body, opts = {}) => {
  const User = require('../models/User');
  const admins = await User.find({ role: 'doctor' });
  await Promise.all(admins.map(a => fireNotify(a._id, title, body, { ...opts, isForDoctor: true })));
};

module.exports = { fireNotify, fireNotifyAdmins, registerWsClient, unregisterWsClient, sendPushToUser };
