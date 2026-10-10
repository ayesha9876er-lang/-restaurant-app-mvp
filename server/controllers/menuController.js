const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// Turns any error into the right HTTP status code.
const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Invalid data', errors: messages });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${error.path}` });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error', error: error.message });
};

// GET /api/menu            -> all items
// GET /api/menu?category=Mains&search=chicken
const getMenuItems = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      // Escape special characters so the search text is treated as plain text.
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' }; // 'i' = not case sensitive
    }

    const items = await MenuItem.find(filter);
    res.status(200).json(items);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/menu/:id
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item id' });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/menu
const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body || {});
    res.status(201).json(item);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item id' });
    }

    const item = await MenuItem.findByIdAndUpdate(id, req.body || {}, {
      new: true, // return the updated document
      runValidators: true, // apply schema rules (e.g. price >= 0) on updates too
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item id' });
    }

    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
