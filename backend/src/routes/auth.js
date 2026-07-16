const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/auth/login
 * Returns a JWT for valid admin credentials.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

/**
 * POST /api/auth/setup
 * One-time endpoint to create the first admin account.
 * Blocked after any admin exists in the database.
 */
router.post('/setup', async (req, res) => {
  const count = await Admin.countDocuments();
  if (count > 0) {
    return res.status(403).json({ message: 'Setup already completed. Use login instead.' });
  }

  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const admin = new Admin({ email, passwordHash: password, name: name || 'Admin' });
  await admin.save();

  res.status(201).json({ message: '✅ Admin account created. You can now log in.' });
});

/**
 * GET /api/auth/me
 * Returns current admin info (protected).
 */
router.get('/me', authMiddleware, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-passwordHash');
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(admin);
});

module.exports = router;
