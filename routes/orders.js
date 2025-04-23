const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  placeOrder,
  getOrderHistory,
  trackOrder
} = require('../controllers/orderController');

router.post('/', verifyToken, placeOrder);
router.get('/history', verifyToken, getOrderHistory);
router.get('/:orderId', verifyToken, trackOrder);

module.exports = router;