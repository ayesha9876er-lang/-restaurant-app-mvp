const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, managerOnly } = require('../middleware/auth');

const router = express.Router();

// Anyone can look at the menu.
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Only a logged-in manager can add, edit or delete items.
router.post('/', protect, managerOnly, createMenuItem);
router.put('/:id', protect, managerOnly, updateMenuItem);
router.delete('/:id', protect, managerOnly, deleteMenuItem);

module.exports = router;
