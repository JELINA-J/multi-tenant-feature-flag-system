const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { signToken } = require('../utils/jwt');

const router = express.Router();

// --- Super Admin Login ---
router.post('/superadmin/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    const token = signToken({ role: 'superadmin', email });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid Super Admin credentials' });
});

// --- Org Admin Signup ---
router.post('/orgadmin/signup', async (req, res) => {
  try {
    const { email, password, organizationId } = req.body;

    if (!email || !password || !organizationId) {
      return res.status(400).json({ message: 'email, password, and organizationId are required' });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role: 'orgadmin',
      organization: org._id,
    });

    const token = signToken({
      id: user._id,
      role: 'orgadmin',
      organization: org._id.toString(),
    });

    return res.status(201).json({ token, organization: { id: org._id, name: org.name } });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// --- Org Admin Login ---
router.post('/orgadmin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({
      id: user._id,
      role: 'orgadmin',
      organization: user.organization.toString(),
    });

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
