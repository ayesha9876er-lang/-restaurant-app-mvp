const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Starters', 'Mains', 'Desserts', 'Drinks'],
  },
  image: { type: String, default: '' },
  isSpecial: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);