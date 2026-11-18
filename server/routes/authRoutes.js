
const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', (req, res, next) => {
  console.log('Register request received');
  next();
}, register);

router.post('/login', (req, res, next) => {
  console.log('LOGIN REQUEST RECEIVED');
  console.log('Email provided:', Boolean(req.body?.email));
  console.log('Password provided:', Boolean(req.body?.password));
  next();
}, login);

module.exports = router;
