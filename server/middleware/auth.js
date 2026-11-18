
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Check whether the request has a valid login token.
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // 1. Check Authorization header
    if (!header || !header.startsWith('Bearer ')) {
      console.log('AUTH ERROR: Authorization token is missing');
      return res.status(401).json({
        message: 'Not authorized, no token',
      });
    }

    const token = header.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token',
      });
    }

    // 2. Check JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error('AUTH ERROR: JWT_SECRET is missing');
      return res.status(500).json({
        message: 'Server authentication configuration error',
      });
    }

    // 3. Verify token
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT VERIFICATION ERROR:', error.name, error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired, please log in again',
        });
      }

      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    // 4. Check user ID inside token
    if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.log('AUTH ERROR: Invalid user ID in token');
      return res.status(401).json({
        message: 'Invalid user information in token',
      });
    }

    // 5. Find user in database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    // 6. Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error);

    return res.status(500).json({
      message: 'Authentication server error',
    });
  }
};

// Only managers can access manager routes.
const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    return next();
  }

  return res.status(403).json({
    message: 'Access denied, managers only',
  });
};

module.exports = { protect, managerOnly };
