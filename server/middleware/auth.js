const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken } = require('../utils/auth');

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    return parts[1].trim();
  }
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please sign in to continue.' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
      return res.status(401).json({ message: 'Session expired or invalid token. Please sign in again.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User account not found. Please sign up or sign in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) return next();

    const decoded = verifyToken(token);
    if (decoded && decoded.userId && mongoose.isValidObjectId(decoded.userId)) {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth
};
