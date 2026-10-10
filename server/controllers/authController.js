const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Makes a token that proves who the user is. It expires after one day.
const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

// The only user details we ever send back. The password (even hashed) is never included.
const userResponse = (user, token) => ({
  token,
  name: user.name,
  email: user.email,
  role: user.role,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < 8 || !/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters and contain a digit' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash the password before saving. 10 is the "salt rounds" (how much work the hashing does).
    const hashedPassword = await bcrypt.hash(password, 10);

    // The role is not taken from the request. Everyone who registers is a customer,
    // so nobody can make themselves a manager. Managers are created by the seed script.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
    });

    res.status(201).json(userResponse(user, createToken(user)));
  } catch (error) {
    if (error.code === 11000) {
      // Two requests with the same email arrived at the same moment.
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Invalid data', errors: messages });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Same message whether the email or the password is wrong,
    // so an attacker cannot find out which emails are registered.
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json(userResponse(user, createToken(user)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };