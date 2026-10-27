const express = require('express');
const CustomRequest = require('../models/CustomRequest');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, email, craft, details, budget } = req.body;
    if (!name || !email || !craft || !details) {
      return res.status(400).json({ message: 'Name, email, craft and project details are required.' });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      craft: craft.trim(),
      details: details.trim(),
      budget: budget || 'Flexible'
    };

    if (req.user) {
      payload.user = req.user._id;
    }

    const request = await CustomRequest.create(payload);
    res.status(201).json({ message: 'Custom request received. Our artisan team will review it.', request });
  } catch (error) { next(error); }
});

router.get('/my-requests', requireAuth, async (req, res, next) => {
  try {
    const requests = await CustomRequest.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) { next(error); }
});

router.get('/', async (_req, res, next) => {
  try { res.json(await CustomRequest.find().sort({ createdAt: -1 }).limit(100)); }
  catch (error) { next(error); }
});

module.exports = router;
