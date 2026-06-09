const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Image = require('../models/Image');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('نوع الملف غير مدعوم'));
  }
});

async function compressImage(buffer, mimetype) {
  if (mimetype === 'application/pdf') return buffer;
  try {
    return await sharp(buffer)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
  } catch {
    return buffer;
  }
}

router.post('/', auth, doctorOnly, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'لم يتم رفع ملف' });
  try {
    const compressed = await compressImage(req.file.buffer, req.file.mimetype);
    const img = await Image.create({
      data: compressed,
      mimetype: req.file.mimetype.startsWith('image/') ? 'image/jpeg' : req.file.mimetype,
      size: compressed.length,
      originalName: req.file.originalname,
    });
    res.json({ url: `/api/images/${img._id}`, filename: img._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/multiple', auth, doctorOnly, upload.array('files', 10), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'لم يتم رفع ملفات' });
  try {
    const results = await Promise.all(req.files.map(async (file) => {
      const compressed = await compressImage(file.buffer, file.mimetype);
      const img = await Image.create({
        data: compressed,
        mimetype: file.mimetype.startsWith('image/') ? 'image/jpeg' : file.mimetype,
        size: compressed.length,
        originalName: file.originalname,
      });
      return { url: `/api/images/${img._id}`, filename: img._id.toString() };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).send('الصورة غير موجودة');
    res.set('Content-Type', img.mimetype || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(img.data);
  } catch {
    res.status(404).send('الصورة غير موجودة');
  }
});

module.exports = router;
