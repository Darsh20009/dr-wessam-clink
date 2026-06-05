const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'غير مصرح به' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود' });
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};

const doctorOnly = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'هذا الإجراء مخصص للطبيب فقط' });
  }
  next();
};

module.exports = { auth, doctorOnly };
