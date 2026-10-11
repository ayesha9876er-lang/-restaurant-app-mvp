const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');

// Promo codes live on the server too, so a customer cannot invent a discount.
const PROMO_CODES = { WELCOME10: 10, FEAST20: 20 };
const SERVICE_RATE = 0.05; // 5% service charge
const TAX_RATE = 0.15; // 15% sales tax

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];
// The only normal moves: one step forward. Cancelled is handled separately below.
const NEXT_STATUS = { Pending: 'Preparing', Preparing: 'Ready', Ready: 'Served' };

const round2 = (n) => Math.round(n * 100) / 100;

const withDetails = (query) => query.populate('table', 'name tableNumber').populate('user', 'name email');

const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Invalid data', errors: messages });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error', error: error.message });
};

// POST /api/orders  (any logged-in user)
const placeOrder = async (req, res) => {
  try {
    // WHY we ignore any "total" sent by the app: the app runs on the customer's phone,
    // so a customer could change it and pay Rs. 1 for a Rs. 5000 order. The server works
    // out every price itself, from the prices stored in the database.
    const { items, type, table, pickupTime, promoCode } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'An order needs at least one item' });
    }

    // Check every line and merge repeated items into one line.
    const wanted = new Map(); // menu item id -> { quantity, note }
    for (const entry of items) {
      const id = entry && entry.menuItem;
      const quantity = entry ? Number(entry.quantity) : NaN;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Each item needs a valid menuItem id' });
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a whole number, at least 1' });
      }
      const note = typeof entry.note === 'string' ? entry.note.trim().slice(0, 200) : '';

      const key = String(id);
      if (wanted.has(key)) {
        const line = wanted.get(key);
        line.quantity += quantity;
        if (note) line.note = note;
      } else {
        wanted.set(key, { quantity, note });
      }
    }
    for (const line of wanted.values()) {
      if (line.quantity > 20) {
        return res.status(400).json({ message: 'You can order at most 20 of one item' });
      }
    }

    // Prices and availability come from the database.
    const menuItems = await MenuItem.find({ _id: { $in: [...wanted.keys()] } });
    const byId = new Map(menuItems.map((m) => [String(m._id), m]));

    const orderItems = [];
    let subtotal = 0;
    for (const [id, line] of wanted) {
      const menuItem = byId.get(id);
      if (!menuItem) {
        return res.status(400).json({ message: 'One of the items in your order does not exist' });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is not available right now` });
      }
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price, // price copied from the database
        quantity: line.quantity,
        note: line.note,
      });
      subtotal += menuItem.price * line.quantity;
    }

    // Dine-in needs a table, takeaway needs a pickup time.
    if (type !== 'dine-in' && type !== 'takeaway') {
      return res.status(400).json({ message: 'Order type must be dine-in or takeaway' });
    }
    let tableId;
    if (type === 'dine-in') {
      if (!mongoose.isValidObjectId(table)) {
        return res.status(400).json({ message: 'Choose a table for a dine-in order' });
      }
      const foundTable = await Table.findById(table);
      if (!foundTable) {
        return res.status(400).json({ message: 'That table does not exist' });
      }
      tableId = foundTable._id;
    } else if (typeof pickupTime !== 'string' || !pickupTime.trim()) {
      return res.status(400).json({ message: 'Choose a pickup time for a takeaway order' });
    }

    let discountPercent = 0;
    let appliedCode = null;
    if (promoCode) {
      const code = String(promoCode).toUpperCase().trim();
      if (!PROMO_CODES[code]) {
        return res.status(400).json({ message: 'Invalid promo code' });
      }
      discountPercent = PROMO_CODES[code];
      appliedCode = code;
    }

    // Same formula as the app's Order Summary: service charge, tax and discount
    // are all taken from the subtotal.
    subtotal = round2(subtotal);
    const serviceCharge = round2(subtotal * SERVICE_RATE);
    const tax = round2(subtotal * TAX_RATE);
    const discount = round2((subtotal * discountPercent) / 100);
    const total = round2(subtotal + serviceCharge + tax - discount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      serviceCharge,
      tax,
      discount,
      promoCode: appliedCode,
      total,
      type,
      table: tableId,
      pickupTime: type === 'takeaway' ? pickupTime.trim() : undefined,
    });

    const saved = await withDetails(Order.findById(order._id));
    res.status(201).json(saved);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/orders/my  (the logged-in customer's own orders, newest first)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('table', 'name tableNumber');
    res.status(200).json(orders);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/orders  (manager: every order, optional ?status=Pending)
const getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
      }
      filter.status = req.query.status;
    }
    const orders = await withDetails(Order.find(filter).sort({ createdAt: -1 }));
    res.status(200).json(orders);
  } catch (error) {
    handleError(res, error);
  }
};

// PATCH /api/orders/:id/status  (manager)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const current = order.status;

    if (status === 'Cancelled') {
      // An order can only be cancelled while nobody has started working on it.
      if (current !== 'Pending') {
        return res
          .status(400)
          .json({ message: `Only a Pending order can be cancelled (this order is ${current})` });
      }
    } else if (NEXT_STATUS[current] !== status) {
      const allowed = NEXT_STATUS[current];
      return res.status(400).json({
        message: allowed
          ? `Cannot change an order from ${current} to ${status}. The next step is ${allowed}`
          : `A ${current} order cannot be changed any more`,
      });
    }

    order.status = status;
    await order.save();

    const saved = await withDetails(Order.findById(order._id));
    res.status(200).json(saved);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
