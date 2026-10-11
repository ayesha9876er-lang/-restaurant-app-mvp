const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, managerOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every order route needs a logged-in user

router.post('/', placeOrder);
router.get('/my', getMyOrders); // keep before any "/:id" route
router.get('/', managerOnly, getAllOrders);
router.patch('/:id/status', managerOnly, updateOrderStatus);

module.exports = router;
