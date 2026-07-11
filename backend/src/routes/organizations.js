const express = require('express');
const Organization = require('../models/Organization');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Public endpoint: lets the Org Admin signup form populate a list of
// organizations to sign up under. Intentionally exposes only id + name,
// nothing sensitive, so it's safe to leave unauthenticated.
router.get('/public', async (req, res) => {
  const orgs = await Organization.find().select('_id name').sort({ name: 1 });
  return res.json(orgs);
});

// All routes below require Super Admin auth.
router.use(requireAuth, requireSuperAdmin);

// Create an organization
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const org = await Organization.create({ name: name.trim() });
    return res.status(201).json(org);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An organization with this name already exists' });
    }
    return res.status(500).json({ message: 'Failed to create organization', error: err.message });
  }
});

// List all organizations
router.get('/', async (req, res) => {
  const orgs = await Organization.find().sort({ createdAt: -1 });
  return res.json(orgs);
});

module.exports = router;
