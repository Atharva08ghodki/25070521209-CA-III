const express = require('express');
const User = require('../models/User');
const { hashPassword, verifyPassword, createToken } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required and must be at least 2 characters.' });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      role: 'customer',
      lastLogin: new Date()
    });

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.status(201).json({
      message: 'Account created successfully! Welcome to KalaKart.',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.json({
      message: 'Signed in successfully. Welcome back!',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: req.user.toSafeObject()
  });
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters.' });
      }
      req.user.name = name.trim();
    }

    if (phone !== undefined) {
      req.user.phone = phone.trim();
    }

    if (address !== undefined) {
      req.user.address = address.trim();
    }

    await req.user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: req.user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Signed out successfully.' });
});

module.exports = router;
