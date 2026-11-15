const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'techmania_vcet_mca_2026_jwt_secret_token_secure_key'
      );
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Not authorized: Admin not found' });
      }
      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized: Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ success: false, error: 'Not authorized: No token provided' });
  }
};

module.exports = { protectAdmin };
