const express = require('express');
const FeatureFlag = require('../models/FeatureFlag');
const Organization = require('../models/Organization');
const { requireAuth, requireOrgAdmin } = require('../middleware/auth');

const router = express.Router();


router.get('/check', async (req, res) => {
  try {
    const { organizationName, key } = req.query;
    if (!organizationName || !key) {
      return res.status(400).json({ message: 'organizationName and key are required' });
    }

    const org = await Organization.findOne({ name: organizationName.trim() });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const flag = await FeatureFlag.findOne({
      organization: org._id,
      key: key.trim().toLowerCase(),
    });

    if (!flag) {
      
      return res.json({ found: false, enabled: false, message: 'Feature flag not found' });
    }

    return res.json({ found: true, enabled: flag.enabled });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check flag', error: err.message });
  }
});

router.use(requireAuth, requireOrgAdmin);

// Create a feature flag (scoped to admin's org)
router.post('/', async (req, res) => {
  try {
    const { key, enabled } = req.body;
    if (!key || !key.trim()) {
      return res.status(400).json({ message: 'Feature key is required' });
    }

    const flag = await FeatureFlag.create({
      key: key.trim(),
      enabled: Boolean(enabled),
      organization: req.orgId,
    });

    return res.status(201).json(flag);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A flag with this key already exists for your organization' });
    }
    return res.status(500).json({ message: 'Failed to create flag', error: err.message });
  }
});

// List all flags for the admin's org
router.get('/', async (req, res) => {
  const flags = await FeatureFlag.find({ organization: req.orgId }).sort({ createdAt: -1 });
  return res.json(flags);
});

router.put('/:id', async (req, res) => {
  try {
    const { enabled, key } = req.body;
    const update = {};
    if (enabled !== undefined) update.enabled = Boolean(enabled);
    if (key !== undefined) update.key = key.trim().toLowerCase();

    const flag = await FeatureFlag.findOneAndUpdate(
      { _id: req.params.id, organization: req.orgId }, // scoping prevents cross-org edits
      update,
      { new: true, runValidators: true }
    );

    if (!flag) {
      return res.status(404).json({ message: 'Flag not found in your organization' });
    }
    return res.json(flag);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update flag', error: err.message });
  }
});

// Delete a flag — scoped the same way
router.delete('/:id', async (req, res) => {
  const flag = await FeatureFlag.findOneAndDelete({ _id: req.params.id, organization: req.orgId });
  if (!flag) {
    return res.status(404).json({ message: 'Flag not found in your organization' });
  }
  return res.json({ message: 'Flag deleted' });
});

module.exports = router;
