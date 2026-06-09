const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const SharedReport = require('../models/SharedReport');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'غير مصرح' });
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'رمز غير صالح' });
  }
};

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { htmlContent, patientName } = req.body;
    if (!htmlContent) return res.status(400).json({ message: 'محتوى فارغ' });

    const token = crypto.randomBytes(20).toString('hex');
    await SharedReport.create({ token, htmlContent, patientName: patientName || '' });

    res.json({ token });
  } catch (e) {
    console.error('SharedReport create error:', e);
    res.status(500).json({ message: 'خطأ في إنشاء الرابط' });
  }
});

router.get('/:token', async (req, res) => {
  try {
    const report = await SharedReport.findOne({ token: req.params.token });
    if (!report) return res.status(404).json({ message: 'الرابط غير موجود أو منتهي الصلاحية' });
    res.json({ htmlContent: report.htmlContent, patientName: report.patientName });
  } catch (e) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;
