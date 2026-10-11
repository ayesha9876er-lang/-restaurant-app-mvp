const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },
    // The bill, worked out by the server (see orderController.js)
    subtotal: { type: Number, required: true, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String, default: null },
    total: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['dine-in', 'takeaway'], required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' }, // dine-in only
    pickupTime: { type: String }, // takeaway only
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
