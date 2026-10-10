const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect: the request must carry a valid token.
// The client sends it in the header:  Authorization: Bearer <token>
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = header.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const message = error.name === 'TokenExpiredError' ? 'Token expired, please log in again' : 'Invalid token';
      return res.status(401).json({ message });
    }

    // Load the user from the database (without the password) and attach to the request.
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// managerOnly: must run after protect, because it needs req.user.
const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    return next();
  }
  res.status(403).json({ message: 'Access denied, managers only' });
};

module.exports = { protect, managerOnly };