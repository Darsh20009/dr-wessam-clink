const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('نوع الملف غير مدعوم'));
  }
});

router.post('/', auth, doctorOnly, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'لم يتم رفع ملف' });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

router.post('/multiple', auth, doctorOnly, upload.array('files', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'لم يتم رفع ملفات' });
  const urls = req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename }));
  res.json(urls);
});

module.exports = router;
