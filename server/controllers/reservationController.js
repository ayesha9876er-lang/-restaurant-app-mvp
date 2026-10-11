const mongoose = require('mongoose');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const SLOT_PATTERN = /^(1[2-9]|2[0-2]):00$/; // hourly slots: 12:00, 13:00 ... 22:00
const PHONE_PATTERN = /^03\d{2}-\d{7}$/; // 03XX-XXXXXXX
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const BLOCKING = ['pending', 'accepted']; // these keep the table taken; declined/cancelled free it
const ONE_HOUR = 60 * 60 * 1000;

const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Invalid data', errors: messages });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error', error: error.message });
};

const pad = (n) => String(n).padStart(2, '0');
const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "2026-02-30" has the right shape but is not a real day.
const isRealDate = (text) => {
  if (!DATE_PATTERN.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

const withDetails = (query) =>
  query.populate('table', 'name tableNumber capacity').populate('user', 'name email');

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { table, date, time, partySize, contactPhone } = req.body || {};

    if (!table || !date || !time || partySize === undefined || !contactPhone) {
      return res
        .status(400)
        .json({ message: 'table, date, time, partySize and contactPhone are required' });
    }
    if (!mongoose.isValidObjectId(table)) {
      return res.status(400).json({ message: 'Invalid table id' });
    }
    if (!isRealDate(date)) {
      return res.status(400).json({ message: 'Date must be a real date like 2026-12-31' });
    }
    if (!SLOT_PATTERN.test(time)) {
      return res.status(400).json({ message: 'Time must be an hourly slot from 12:00 to 22:00' });
    }

    // Past dates first (clearer message), then the one-hour rule.
    if (date < todayString()) {
      return res.status(400).json({ message: 'The date cannot be in the past' });
    }
    const slotStart = new Date(`${date}T${time}:00`); // server's local time
    if (slotStart.getTime() < Date.now() + ONE_HOUR) {
      return res.status(400).json({ message: 'Bookings must be made at least one hour ahead' });
    }

    const guests = Number(partySize);
    if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
      return res.status(400).json({ message: 'Party size must be a whole number from 1 to 12' });
    }
    if (!PHONE_PATTERN.test(contactPhone)) {
      return res.status(400).json({ message: 'Phone number must look like 03XX-XXXXXXX' });
    }

    const foundTable = await Table.findById(table);
    if (!foundTable) {
      return res.status(404).json({ message: 'Table not found' });
    }
    if (guests > foundTable.capacity) {
      return res
        .status(400)
        .json({ message: `${foundTable.name} seats only ${foundTable.capacity} guests` });
    }

    // The server decides if the table is free. The app's own check is only a hint,
    // because another customer may have booked it a moment ago.
    // (Two requests at exactly the same moment could both pass this check.
    //  A unique index would close that gap; for this project the check is enough.)
    const clash = await Reservation.findOne({
      table: foundTable._id,
      date,
      time,
      status: { $in: BLOCKING },
    });
    if (clash) {
      return res.status(409).json({ message: `${foundTable.name} is already booked at ${time} on ${date}` });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: foundTable._id,
      date,
      time,
      partySize: guests,
      contactPhone,
    });

    const saved = await withDetails(Reservation.findById(reservation._id));
    res.status(201).json(saved);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/reservations/my
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ date: 1, time: 1 })
      .populate('table', 'name tableNumber capacity');
    res.status(200).json(reservations);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/reservations  (manager: all, optional ?status= and ?date=)
const getAllReservations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) filter.date = req.query.date;
    const reservations = await withDetails(Reservation.find(filter).sort({ date: 1, time: 1 }));
    res.status(200).json(reservations);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/reservations/booked?date=2026-12-31
// Which tables are taken at which hour on that day. The app uses it to grey out slots.
const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || !isRealDate(date)) {
      return res.status(400).json({ message: 'date is required, like 2026-12-31' });
    }
    const booked = await Reservation.find({ date, status: { $in: BLOCKING } }).select('table time');
    res.status(200).json(booked.map((r) => ({ table: r.table, time: r.time })));
  } catch (error) {
    handleError(res, error);
  }
};

// PATCH /api/reservations/:id  (manager accepts or declines)
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid reservation id' });
    }

    const { status } = req.body || {};
    if (status !== 'accepted' && status !== 'declined') {
      return res.status(400).json({ message: 'Status must be accepted or declined' });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: `This reservation is already ${reservation.status}` });
    }

    reservation.status = status;
    await reservation.save();

    const saved = await withDetails(Reservation.findById(reservation._id));
    res.status(200).json(saved);
  } catch (error) {
    handleError(res, error);
  }
};

// PATCH /api/reservations/:id/cancel  (the customer who made it)
const cancelMyReservation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid reservation id' });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (String(reservation.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only cancel your own reservations' });
    }
    if (!BLOCKING.includes(reservation.status)) {
      return res.status(400).json({ message: `This reservation is already ${reservation.status}` });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    const saved = await withDetails(Reservation.findById(reservation._id));
    res.status(200).json(saved);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  getBookedSlots,
  updateReservationStatus,
  cancelMyReservation,
};
