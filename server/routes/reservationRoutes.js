const express = require('express');
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  getBookedSlots,
  updateReservationStatus,
  cancelMyReservation,
} = require('../controllers/reservationController');
const { protect, managerOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every reservation route needs a logged-in user

router.post('/', createReservation);
router.get('/my', getMyReservations);
router.get('/booked', getBookedSlots);
router.get('/', managerOnly, getAllReservations);
router.patch('/:id/cancel', cancelMyReservation);
router.patch('/:id', managerOnly, updateReservationStatus);

module.exports = router;
