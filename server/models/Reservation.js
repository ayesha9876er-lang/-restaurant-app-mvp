const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    date: { type: String, required: [true, 'Date is required'] }, // YYYY-MM-DD
    time: { type: String, required: [true, 'Time is required'] }, // HH:mm
    partySize: { type: Number, required: true, min: [1, 'Minimum 1 guest'], max: [12, 'Maximum 12 guests'] },
    contactPhone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^03\d{2}-\d{7}$/, 'Phone must look like 03XX-XXXXXXX'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);