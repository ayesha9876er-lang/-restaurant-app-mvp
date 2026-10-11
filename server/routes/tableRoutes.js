const express = require('express');
const { getTables } = require('../controllers/tableController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getTables);

module.exports = router;
