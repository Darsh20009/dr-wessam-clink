const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const sessionRoutes = require('./routes/sessions');
const uploadRoutes = require('./routes/uploads');
const notificationRoutes = require('./routes/notifications');
const walletRoutes = require('./routes/wallet');
const siteRoutes = require('./routes/site');
const pushRoutes = require('./routes/push');
const webauthnRoutes = require('./routes/webauthn');
const paymentRequestRoutes = require('./routes/paymentRequests');
const commentRoutes = require('./routes/comments');
const employeeRoutes = require('./routes/employees');
const messageRoutes = require('./routes/messages');
const { registerWsClient, unregisterWsClient } = require('./utils/fireNotify');

const app = express();
const server = http.createServer(app);

// ─── WebSocket Server ─────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);
  const token = query.token;
  if (!token) { ws.close(); return; }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    registerWsClient(userId, ws);
    ws.send(JSON.stringify({ type: 'connected', message: 'متصل بالإشعارات الفورية' }));
    ws.on('close', () => unregisterWsClient(userId));
    ws.on('error', () => unregisterWsClient(userId));
  } catch {
    ws.close();
  }
});

// ─── Middleware ───────────────────────────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/webauthn', webauthnRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Dr. Wessam Clinic API v3' }));

// ─── Serve React build in production ──────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');

  app.use(express.static(clientDist, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('X-Robots-Tag', 'index, follow');
      } else if (filePath.endsWith('robots.txt') || filePath.endsWith('sitemap.xml')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Content-Type', filePath.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
      }
    },
  }));

  app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(clientDist, 'sitemap.xml'));
  });

  app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(clientDist, 'robots.txt'));
  });

  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
