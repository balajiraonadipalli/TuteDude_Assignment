const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/active - list all active users
router.get('/active', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).select('-__v');
    res.json({ count: users.length, users: users.map((u) => u.toPublic()) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
