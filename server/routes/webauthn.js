const express = require('express');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const WebAuthnCredential = require('../models/WebAuthnCredential');
const User = require('../models/User');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const router = express.Router();

const RP_NAME = 'عيادة د. وسام يوسف';

const challengeStore = new Map(); // userId -> { challenge, rpId, origin }

function getRpConfig(req) {
  const originHeader = req.headers.origin || req.headers.referer || '';
  try {
    const url = new URL(originHeader);
    return { rpId: url.hostname, origin: url.origin };
  } catch {
    const replitDomain = process.env.REPLIT_DEV_DOMAIN;
    if (replitDomain) return { rpId: replitDomain, origin: `https://${replitDomain}` };
    return { rpId: process.env.RP_ID || 'localhost', origin: process.env.ORIGIN || 'http://localhost:5000' };
  }
}

// ─── Registration ─────────────────────────────────────────────────
router.post('/register-options', auth, async (req, res) => {
  try {
    const { rpId, origin } = getRpConfig(req);
    const userId = req.user._id.toString();
    const existingCreds = await WebAuthnCredential.find({ userId: req.user._id });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpId,
      userID: new TextEncoder().encode(userId),
      userName: req.user.phone || req.user.name || userId,
      userDisplayName: req.user.name || 'مستخدم',
      attestationType: 'none',
      excludeCredentials: existingCreds.map(c => ({
        id: c.credentialID,
        type: 'public-key',
        transports: c.transports || [],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    challengeStore.set(userId, { challenge: options.challenge, rpId, origin });
    setTimeout(() => challengeStore.delete(userId), 5 * 60 * 1000);

    res.json(options);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/register-verify', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const stored = challengeStore.get(userId);
    if (!stored) return res.status(400).json({ message: 'انتهى التحدي، حاول مجدداً' });
    const { challenge: expectedChallenge, rpId: expectedRPID, origin: expectedOrigin } = stored;

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
    });

    if (!verification.verified) return res.status(400).json({ message: 'فشل التحقق' });

    const { registrationInfo } = verification;
    const { credential, credentialDeviceType, credentialBackedUp, aaguid } = registrationInfo;

    await WebAuthnCredential.create({
      userId: req.user._id,
      userRole: req.user.role,
      credentialID: Buffer.from(credential.id).toString('base64url'),
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      transports: req.body.response?.transports || [],
      deviceName: req.body.deviceName || 'جهازي',
      credentialDeviceType,
      credentialBackedUp,
      aaguid: aaguid?.toString(),
    });

    challengeStore.delete(userId);
    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Authentication ────────────────────────────────────────────────
router.post('/login-options', async (req, res) => {
  try {
    const { rpId, origin } = getRpConfig(req);
    const { phone } = req.body;
    let user = await User.findOne({ phone });
    let userId;
    if (user) { userId = user._id; }
    else {
      const patient = await Patient.findOne({ phone });
      if (!patient) return res.status(404).json({ message: 'المستخدم غير موجود' });
      user = await User.findOne({ _id: patient.userId });
      if (!user) return res.status(404).json({ message: 'حساب المريض غير مفعّل' });
      userId = user._id;
    }

    const creds = await WebAuthnCredential.find({ userId });
    if (!creds.length) return res.status(404).json({ message: 'لا توجد بصمة مسجّلة لهذا الحساب' });

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: creds.map(c => ({
        id: c.credentialID,
        type: 'public-key',
        transports: c.transports || [],
      })),
      userVerification: 'preferred',
    });

    challengeStore.set(userId.toString(), { challenge: options.challenge, rpId, origin });
    setTimeout(() => challengeStore.delete(userId.toString()), 5 * 60 * 1000);

    res.json({ options, userId: userId.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login-verify', async (req, res) => {
  try {
    const { userId, response } = req.body;
    const stored = challengeStore.get(userId);
    if (!stored) return res.status(400).json({ message: 'انتهى التحدي، حاول مجدداً' });
    const { challenge: expectedChallenge, rpId: expectedRPID, origin: expectedOrigin } = stored;

    const credentialIDBase64 = response.id;
    const credDoc = await WebAuthnCredential.findOne({ userId, credentialID: credentialIDBase64 });
    if (!credDoc) return res.status(404).json({ message: 'البصمة غير موجودة' });

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: credDoc.credentialID,
        publicKey: Buffer.from(credDoc.credentialPublicKey, 'base64'),
        counter: credDoc.counter,
        transports: credDoc.transports || [],
      },
    });

    if (!verification.verified) return res.status(400).json({ message: 'فشل التحقق بالبصمة' });

    credDoc.counter = verification.authenticationInfo.newCounter;
    await credDoc.save();
    challengeStore.delete(userId);

    const user = await User.findById(userId).select('-password');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    let responseData = { token, role: user.role, user: { _id: user._id, name: user.name, phone: user.phone, role: user.role } };
    if (user.role === 'patient' && user.patientId) {
      const Patient = require('../models/Patient');
      const patient = await Patient.findById(user.patientId);
      responseData.patient = patient;
    }
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── List & Delete credentials ─────────────────────────────────────
router.get('/credentials', auth, async (req, res) => {
  try {
    const creds = await WebAuthnCredential.find({ userId: req.user._id }).select('-credentialPublicKey');
    res.json(creds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/credentials/:id', auth, async (req, res) => {
  try {
    await WebAuthnCredential.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
