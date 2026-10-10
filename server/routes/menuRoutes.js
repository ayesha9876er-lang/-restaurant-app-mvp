const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

const router = express.Router();

// This file only maps URLs to controller functions. No database code here.
router.route('/').get(getMenuItems).post(createMenuItem);
router.route('/:id').get(getMenuItemById).put(updateMenuItem).delete(deleteMenuItem);

module.exports = router;
