const express = require('express');
const Wallet = require('../models/Wallet');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

const getOrCreateWallet = async (patientId) => {
  let wallet = await Wallet.findOne({ patientId });
  if (!wallet) {
    const patient = await Patient.findById(patientId);
    wallet = new Wallet({ patientId, patientName: patient?.fullName || '' });
    await wallet.save();
  }
  return wallet;
};

router.get('/', auth, doctorOnly, async (req, res) => {
  try {
    const wallets = await Wallet.find({ isActive: true }).sort({ updatedAt: -1 });
    const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
    const totalDeposited = wallets.reduce((s, w) => s + w.totalDeposited, 0);
    res.json({ wallets, totalBalance, totalDeposited });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/clinic-summary', auth, doctorOnly, async (req, res) => {
  try {
    const wallets = await Wallet.find({ isActive: true });
    const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
    const totalDeposited = wallets.reduce((s, w) => s + w.totalDeposited, 0);
    const totalWithdrawn = wallets.reduce((s, w) => s + w.totalWithdrawn, 0);
    res.json({ totalBalance, totalDeposited, totalWithdrawn, walletCount: wallets.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    if (req.user.role === 'patient' && req.user.patientId?.toString() !== req.params.patientId) {
      return res.status(403).json({ message: 'غير مصرح' });
    }
    const wallet = await getOrCreateWallet(req.params.patientId);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/deposit', auth, doctorOnly, async (req, res) => {
  try {
    const { patientId, amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'مبلغ غير صالح' });

    const wallet = await getOrCreateWallet(patientId);
    wallet.balance += amount;
    wallet.totalDeposited += amount;
    wallet.transactions.push({
      type: 'deposit',
      amount,
      description: description || 'إيداع',
      balanceAfter: wallet.balance,
    });
    await wallet.save();

    await new Notification({
      patientId,
      title: 'إيداع في المحفظة',
      message: `تم إضافة ${amount.toLocaleString()} ج.م إلى محفظتك. الرصيد الحالي: ${wallet.balance.toLocaleString()} ج.م`,
      type: 'payment',
    }).save();

    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/withdraw', auth, doctorOnly, async (req, res) => {
  try {
    const { patientId, amount, description } = req.body;
    const wallet = await getOrCreateWallet(patientId);
    if (wallet.balance < amount) return res.status(400).json({ message: 'الرصيد غير كافٍ' });

    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      description: description || 'سحب',
      balanceAfter: wallet.balance,
    });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
